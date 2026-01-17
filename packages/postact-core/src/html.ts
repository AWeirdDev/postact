import {
  createVf,
  createVtn,
  type Attributes,
  type AttributeValue,
  type VirtualElement,
  type VirtualItem,
} from "./vdom/structure";
import type { Subscribable } from "./subscribable";
import { unescape } from "./utilities";
import { PostactIdentifier } from "./_internals";
import {
  ArgumentType,
  identifyArgument,
  transformArgToVirtualItem,
  type Argument,
} from "./argument";
import {
  isComponentInstance,
  isComponentPtr,
  type Component,
  type ComponentInstance,
} from "./component";

class ParseError extends Error {
  constructor(reason: string) {
    super(reason);
  }

  static noInsertInTagNames(): ParseError {
    return new ParseError("`${...}` is not allowed in tag names");
  }

  static noInsertInAttrNames(): ParseError {
    return new ParseError("`${...}` is not allowed in attribute names");
  }

  static invalidCharacterInTagName(chr: string): ParseError {
    return new ParseError(`${chr} is not a valid html tag character`);
  }

  static invalidCharacterInAttributeName(chr: string): ParseError {
    return new ParseError(`${chr} is not a valid html attribute character`);
  }

  static expectedQuote(): ParseError {
    return new ParseError('expected double quote (")');
  }

  static expectedAttrName(): ParseError {
    return new ParseError("expected attribute name, got empty");
  }

  static expectedAttrEqual(): ParseError {
    return new ParseError("expected equal sign (=) right after attribute name");
  }

  static expectedTagClosing(): ParseError {
    return new ParseError("expected tag to be closing (with a slash: /)");
  }

  static expectedTagOpening(): ParseError {
    return new ParseError("expected an opening tag");
  }

  static tagMismatch(starting: string, closing: string): ParseError {
    return new ParseError(
      `the starting and closing tags do not match: \`${starting}\` and \`${closing}\``,
    );
  }

  static noBackslashBeforeInsert(): ParseError {
    return new ParseError("there should be no backslash (\\) before ${...}");
  }

  static typeCheckComponentProps(): ParseError {
    return new ParseError(
      "**do not** add attributes like how you would in JSX." +
        "this may lead to runtime type inconsistencies. " +
        "instead, run components (e.g., `Page`) with attributes like this: \n" +
        "  html`<${Page({ hello: 'world' })} />`\n" +
        "this ensures runtime type safety.",
    );
  }
}

class HTMLParser {
  #strings: TemplateStringsArray;
  #values: Argument[];
  #tsaIdx: number;
  #idx: number;

  constructor(strings: TemplateStringsArray, values: Argument[]) {
    this.#strings = strings;
    this.#values = values;
    this.#tsaIdx = 0;
    this.#idx = 0;
  }

  /**
   * Next character.
   * @returns `[(whether to insert a template value after / end of source), string]`
   */
  next(): [boolean, string] | null {
    if (this.#tsaIdx >= this.#strings.length) return null;

    if (this.#strings[this.#tsaIdx]!.length == 0) {
      this.#idx = 0;
      this.#tsaIdx += 1;
      return [true, ""];
    }

    if (this.#idx >= this.#strings[this.#tsaIdx]!.length) return null;

    const templateStr = this.#strings[this.#tsaIdx]!;
    const value = templateStr[this.#idx]!;

    this.#idx = (this.#idx + 1) % templateStr.length;
    this.#tsaIdx += this.#idx == 0 ? 1 : 0;

    return [this.#idx == 0, value];
  }

  /**
   * Seeks for the next character.
   * This function **does not** return characters across different string slices.
   */
  seek(): string | null {
    return this.#strings[this.#tsaIdx]![this.#idx] || null;
  }

  getInsertion(): Argument | null {
    // we should not be using `||` because we might get
    // values like `0` to be gone!
    return this.#values[this.#tsaIdx - 1] ?? null;
  }

  consume(): VirtualItem {
    const children: VirtualItem[] = [];

    while (true) {
      const n = this.next();
      if (!n) break;

      const [shouldInsert, chr] = n;

      if (chr == "<") {
        if (shouldInsert) {
          const insertion = this.getInsertion();
          if (isComponentPtr(insertion) || isComponentInstance(insertion)) {
            children.push(this.processComponent(insertion));
            continue;
          } else {
            throw ParseError.noInsertInTagNames();
          }
        }
        children.push(this.processElement());
      } else if (shouldInsert) {
        // then it's quite possibly in the end
        const vi = transformArgToVirtualItem(this.getInsertion()!);
        if (vi !== null) children.push(vi);
      } else if (!/\s/.test(chr)) {
        throw ParseError.expectedTagOpening();
      }
    }

    // create a fragment
    return {
      __p: PostactIdentifier.VirtualFragment,
      children,
    };
  }

  processElement(): VirtualElement {
    const [startTag, attributes, selfClosing, afterTagShouldInsert] = this.consumeTag();

    const [listeners, attrs] = filterListenersFromAttributes(attributes);

    if (selfClosing) {
      return {
        __p: PostactIdentifier.VirtualElement,
        tag: startTag,
        attributes: attrs,
        children: [],
        listeners,
      };
    }

    const children = this.consumeChildren(afterTagShouldInsert);
    const endTag = this.consumeEndTag();

    if (startTag !== endTag)
      throw ParseError.tagMismatch(startTag, typeof endTag === "string" ? endTag : "[component]");

    return {
      __p: PostactIdentifier.VirtualElement,
      tag: startTag,
      attributes: attrs,
      children,
      listeners,
    };
  }

  processComponent(insertion: Component<any> | ComponentInstance): VirtualItem {
    const [attributes, selfClosing, afterTagShouldInsert] = this.consumeAttributes();

    // don't do: html`<${Fruits} apples=${10} />`
    // this is BAD (actually, horrible) for runtime!
    // instead, use html`<${Fruits({ apples: 10 })} />`
    //
    // also, if you *do* have additional props for your component
    // and you you created components using the `component()` function,
    // typescript will warn you of this.
    if (attributes.size > 0) throw ParseError.typeCheckComponentProps();

    if (selfClosing) return insertion.ptr(isComponentPtr(insertion) ? {} : insertion.props);

    const children = this.consumeChildren(afterTagShouldInsert);
    const endTag = this.consumeEndTag();
    if (typeof endTag !== "function") throw ParseError.tagMismatch("[component]", endTag);

    if (!isComponentPtr(endTag))
      throw new TypeError("expected component pointer for end tag, got other functions instead");

    if (endTag.ptr !== insertion.ptr)
      throw ParseError.tagMismatch("[component A]", "[component B]");

    return insertion.ptr({
      children: createVf(children),
      ...(isComponentPtr(insertion) ? {} : insertion.props),
    });
  }

  /**
   * @returns `[(tag name), (attributes), (self-closing?), (shouldInsert?)]`
   */
  consumeTag(): [string, Map<string, AttributeValue | Function>, boolean, boolean] {
    let tag = "";
    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (/\s/.test(chr)) {
        const [attrs, selfClosing, shouldInsertAfterAttrConsumption] = this.consumeAttributes();
        return [tag, attrs, selfClosing, shouldInsertAfterAttrConsumption];
      }

      if (chr == ">") return [tag, new Map(), false, shouldInsert];
      if (shouldInsert) throw ParseError.noInsertInTagNames();

      if (!/[a-zA-Z0-9-]/.test(chr)) throw ParseError.invalidCharacterInTagName(chr);

      tag += chr;
    }
  }

  /**
   *
   * @returns `[(attributes), (self-closing?), (shouldInsert?)]`
   */
  consumeAttributes(): [Map<string, AttributeValue | Function>, boolean, boolean] {
    const attrs: Map<string, AttributeValue | Function> = new Map();
    let name = "";

    /**
     * - `0`: Consuming attribute **name**.
     * - `1`: Waiting for `=` (equal) sign.
     */
    let state: 0 | 1 = 0;

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      // stop characters
      if (chr == ">") {
        if (name) {
          // [MACRO]
          attrs.set(name, "true");
          // [/MACRO]
        }
        return [attrs, false, shouldInsert];
      }
      if (chr == "/") {
        const [_, c] = this.consumeWhitespace();
        if (c !== ">") throw ParseError.expectedTagClosing();
        if (name) {
          // [MACRO]
          attrs.set(name, "true");
          // [/MACRO]
        }
        return [attrs, true, shouldInsert];
      }

      if (state === 0) {
        // attr name
        // we might be waiting for attr name if there's nothing yet
        if (!name && (/\s/.test(chr) || !chr)) continue;
        if (/\s|=/.test(chr)) {
          if (!name) throw ParseError.expectedAttrName();
          // we can now go collect the value
          state = 1;
        } else {
          if (shouldInsert) throw ParseError.noInsertInAttrNames();
          if (!/[a-zA-Z0-9-]/.test(chr)) throw ParseError.invalidCharacterInAttributeName(chr);
          name += chr;
          continue;
        }
      }

      if (chr === " ") {
        // [MACRO]
        attrs.set(name, "true");
        // [/MACRO]
        name = "";
        state = 0;
        continue;
      }
      if (chr !== "=") throw ParseError.expectedAttrEqual();

      const value: AttributeValue | Function | null = shouldInsert
        ? argToAttrValueOrFn(this.getInsertion()!)
        : this.consumeStringQuote();

      if (value !== null) {
        attrs.set(name, value);
      }

      name = "";
      state = 0;
      continue;
    }
  }

  consumeEndTag(): string | Function {
    const [shouldInsertAfterTagName, chr] = this.consumeWhitespace();
    if (chr !== "/") throw ParseError.expectedTagClosing();
    if (shouldInsertAfterTagName) {
      const insertion = this.getInsertion();
      if (typeof insertion === "function") return insertion;
      throw ParseError.noInsertInTagNames();
    }

    let name: string | Function = "";

    /**
     * - `0`: Still collecting.
     * - `1`: Already done collecting, waiting for `>`.
     */
    let state: 0 | 1 = 0;

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (chr === ">") {
        if (typeof name === "function") return name;
        return name.trimEnd();
      }

      if (shouldInsert) {
        const insertion = this.getInsertion();
        if (typeof insertion === "function" && typeof name !== "function") {
          name = insertion;
        } else {
          throw ParseError.noInsertInTagNames();
        }
      } else {
        if (typeof name === "function") throw ParseError.invalidCharacterInTagName(chr);

        if (/\s/.test(chr)) state = 1;

        if (state == 0 && !/[a-zA-Z0-9-]/.test(chr))
          throw ParseError.invalidCharacterInTagName(chr);

        name += chr;
      }
    }
  }

  consumeWhitespace(): [boolean, string] {
    const [shouldInsert, chr] = this.next()!;
    if (/\s/.test(chr)) return this.consumeWhitespace();
    return [shouldInsert, chr];
  }

  consumeStringQuote(): string {
    let text = "";
    const [shouldInsert, chr] = this.consumeWhitespace()!;
    if (chr !== '"') throw ParseError.expectedQuote();

    text += '"';
    if (shouldInsert) text += this.getInsertion()!.toString();

    while (true) {
      const [shouldInsert, chr] = this.next()!;
      if (chr == "\\") {
        const [nextInsert, nextChr] = this.next()!;
        if (nextInsert) throw ParseError.noBackslashBeforeInsert();
        text += "\\" + nextChr;
        continue;
      }
      if (chr == '"') break;

      text += chr;
      if (shouldInsert) text += this.getInsertion()!.toString();
    }

    return JSON.parse(text + '"');
  }

  consumeChildren(afterTagShouldInsert: boolean): VirtualItem[] {
    let text = "";
    const children: VirtualItem[] = [];

    if (afterTagShouldInsert) children.push(transformArgToVirtualItem(this.getInsertion()));

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (chr === "<") {
        if (this.seek() === "/") {
          // end tag
          break;
        } else {
          // new tag! niche!
          if (text.trim()) children.push(createVtn(unescape(text)));
          text = "";

          children.push(this.processElement());
          continue;
        }
      }

      text += chr;

      if (shouldInsert) {
        if (text.trim()) children.push(createVtn(unescape(text)));
        text = "";

        const insertion = this.getInsertion();
        children.push(transformArgToVirtualItem(insertion));
      }
    }

    if (text.trim()) children.push(createVtn(unescape(text)));
    return children;
  }
}

// this is only called for resolving attributes
function argToAttrValueOrFn(arg: Argument): AttributeValue | Function | null {
  switch (identifyArgument(arg)) {
    case ArgumentType.Empty:
      return null;
    case ArgumentType.Text:
      return arg!.toString();
    case ArgumentType.Subscribable:
      return arg as Subscribable<any>;
    case ArgumentType.VirtualItem:
      // this should not be here
      return null;
    case ArgumentType.Function:
      return arg as Function;
  }
}

export function filterListenersFromAttributes<
  K = keyof HTMLElementEventMap,
  F = (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void,
  A = Attributes,
>(attrs: Map<string, AttributeValue | Function>): [[K, F][], A] {
  const callbacks: [K, F][] = [];

  for (const [key, value] of attrs.entries()) {
    if (key.startsWith("on") && typeof value === "function") {
      attrs.delete(key);
      callbacks.push([key.slice(2) as K, value as F]);
    }
  }
  return [callbacks, attrs as A];
}

/**
 * Create HTML. Use this with template-string-based calls.
 * Accepts insertions such as states, primitives, virtual DOM, and callback functions.
 *
 * Be sure to escape unsafe HTML, see below.
 *
 * **HTML Escape Map**
 * - `&` → `&amp;`
 * - `<` → `&lt;`
 * - `>` → `&gt;`
 * - `"` → `&quot;`
 * - `'` → `&#39;`
 *
 * @param tsa Template strings.
 * @param values Values (arguments).
 */
export function html(tsa: TemplateStringsArray, ...values: Argument[]): VirtualItem {
  const parser = new HTMLParser(tsa, values);
  return parser.consume();
}
