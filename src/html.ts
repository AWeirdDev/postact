import type { VirtualElement, VirtualItem } from "./vdom/structure";
import type { State } from "./state";

type Argument =
  | null
  | undefined
  | boolean
  | number
  | string
  | State<any>
  | VirtualItem
  | Function;

enum ArgumentType {
  Empty,
  Text,
  Subscribable,
  VirtualItem,
  Function,
}

function identifyArgument(arg: Argument): ArgumentType {
  if (arg === null || typeof arg === "undefined") return ArgumentType.Empty;
  if (typeof arg === "function") return ArgumentType.Function;

  // @ts-ignore javascript is gonna spare us with `undefined` anyway lmfao
  if (arg["__postactItem"] === "state" || arg["__postactItem"] == "dependent") {
    return ArgumentType.Subscribable;
  }

  if (["number", "boolean", "string"].includes(typeof arg))
    return ArgumentType.Text;

  return ArgumentType.VirtualItem;
}

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

  static expectedQuote(): ParseError {
    return new ParseError('expected double quote (")');
  }

  static expectedAttrName(): ParseError {
    return new ParseError("expected attribute name, got empty");
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
    return this.#values[this.#tsaIdx - 1] || null;
  }

  consume(): VirtualElement[] {
    const items: VirtualElement[] = [];

    while (true) {
      const n = this.next();
      if (!n) break;

      const [shouldInsert, chr] = n;

      if (chr == "<") {
        if (shouldInsert) throw ParseError.noInsertInTagNames();
        items.push(this.processConsumption());
      } else if (!/\s/.test(chr)) {
        throw ParseError.expectedTagOpening();
      }
    }

    return items;
  }

  processConsumption(): VirtualElement {
    const [startTag, attributes, selfClosing, afterTagShouldInsert] =
      this.consumeTag();

    const [listeners, attrs] = filterListenersFromAttributes(attributes);

    if (selfClosing) {
      return {
        __postactItem: "virtual-element",
        tag: startTag,
        attributes: attrs,
        children: [],
        listeners,
      };
    }

    const children = this.consumeChildren(afterTagShouldInsert);
    const endTag = this.consumeEndTag();

    if (startTag !== endTag) throw ParseError.tagMismatch(startTag, endTag);

    return {
      __postactItem: "virtual-element",
      tag: startTag,
      attributes: attrs,
      children,
      listeners,
    };
  }

  /**
   *
   * @returns `[(tag name), (attributes), (self-closing?), (shouldInsert?)]`
   */
  consumeTag(): [string, Record<string, string | Function>, boolean, boolean] {
    let tag = "";
    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (/\s/.test(chr)) {
        const [attrs, selfClosing, shouldInsertAfterAttrConsumption] =
          this.consumeAttributes();
        return [tag, attrs, selfClosing, shouldInsertAfterAttrConsumption];
      }

      if (chr == ">") return [tag, {}, false, shouldInsert];
      if (shouldInsert) throw ParseError.noInsertInTagNames();

      if (!/[a-zA-Z0-9-]/.test(chr))
        throw ParseError.invalidCharacterInTagName(chr);

      tag += chr;
    }
  }

  /**
   *
   * @returns `[(attributes), (self-closing?), (shouldInsert?)]`
   */
  consumeAttributes(): [Record<string, string | Function>, boolean, boolean] {
    const attrs: Record<string, string | Function> = {};
    let name = "";

    /**
     * - `0`: Consuming attribute **name**.
     * - `1`: Waiting for `=` (equal) sign.
     */
    let state: 0 | 1 = 0;

    while (true) {
      const [shouldInsert, chr] = this.consumeWhitespace();

      if (chr == ">") return [attrs, false, shouldInsert];
      if (chr == "/") {
        const [_, c] = this.consumeWhitespace();
        if (c !== ">") throw ParseError.expectedTagClosing();
        return [attrs, true, shouldInsert];
      }

      if (state === 0) {
        // attr name
        if (/\s|=/.test(chr)) {
          if (!name) throw ParseError.expectedAttrName();
          // we can now go collect the value
          state = 1;
        } else {
          if (shouldInsert) throw ParseError.noInsertInAttrNames();
          name += chr;
          continue;
        }
      }

      // finally not equal, process attr value
      if (chr == "=") {
        const value: string | Function | null = shouldInsert
          ? argToStringOrFn(this.getInsertion()!)
          : this.consumeStringQuote();

        if (value !== null) {
          attrs[name] = value;
        }

        name = "";
        state = 0;
        continue;
      }
      // otherwise, there's something else, perhaps a new attr
      // we'll keep this one as "true"
      attrs[name] = "true";
      name = "";
      state = 0;
    }
  }

  consumeEndTag(): string {
    const [shouldInsertAfterTagName, chr] = this.consumeWhitespace();
    if (chr !== "/") throw ParseError.expectedTagClosing();
    if (shouldInsertAfterTagName) throw ParseError.noInsertInTagNames();

    let name = "";

    /**
     * - `0`: Still collecting.
     * - `1`: Already done collecting, waiting for `>`.
     */
    let state: 0 | 1 = 0;

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (chr === ">") return name.trimEnd();
      if (shouldInsert) throw ParseError.noInsertInTagNames();

      if (/\s/.test(chr)) state = 1;

      if (state == 0 && !/[a-zA-Z0-9-]/.test(chr))
        throw ParseError.invalidCharacterInTagName(chr);

      name += chr;
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
      if (!text.endsWith("\\") && chr == '"') break;

      text += chr;
      if (shouldInsert) text += this.getInsertion()!.toString();
    }

    return JSON.parse(text + '"');
  }

  consumeChildren(afterTagShouldInsert: boolean): VirtualItem[] {
    let text = "";
    const children: VirtualItem[] = [];

    if (afterTagShouldInsert) addArgToChildren(this.getInsertion(), children);

    while (true) {
      const [shouldInsert, chr] = this.next()!;

      if (chr === "<") {
        if (this.seek() === "/") {
          // end tag
          break;
        } else {
          // new tag! niche!
          const trimmed = text.trimStart();
          if (trimmed) children.push(trimmed);
          text = "";

          children.push([this.processConsumption()]);
          continue;
        }
      }

      text += chr;

      if (shouldInsert) {
        const trimmed = text.trimStart();
        if (trimmed) children.push(trimmed);
        text = "";

        const insertion = this.getInsertion();
        addArgToChildren(insertion, children);
      }
    }

    const trimmed = text.trimStart();
    if (trimmed) children.push(trimmed);
    return children;
  }
}

function addArgToChildren(insertion: Argument, children: VirtualItem[]) {
  switch (identifyArgument(insertion)) {
    case ArgumentType.Empty:
      break;

    case ArgumentType.Text:
      children.push(insertion!.toString());
      break;

    case ArgumentType.Subscribable:
      // we'll put the initial value
      const value = (insertion as State<any>).value;
      if (typeof value !== "undefined" && value !== null)
        children.push(value.toString());
      break;

    case ArgumentType.VirtualItem:
      children.push(insertion as VirtualItem);
      break;
    case ArgumentType.Function:
      // similar to states, we'll do an initial render
      const fValue = (insertion as Function)();
      if (typeof fValue !== "undefined" && fValue !== null)
        children.push(fValue.toString());
      break;
  }
}

function argToStringOrFn(arg: Argument): string | Function | null {
  switch (identifyArgument(arg)) {
    case ArgumentType.Empty:
      return null;
    case ArgumentType.Text:
      return arg!.toString();
    case ArgumentType.Subscribable:
      return ((arg as State<any>).value || "").toString();
    case ArgumentType.VirtualItem:
      // this should not be here
      return null;
    case ArgumentType.Function:
      return arg as Function;
  }
}

function filterListenersFromAttributes<
  K = keyof HTMLElementEventMap,
  F = (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void,
  N = Record<string, string>,
>(attrs: Record<string, string | Function>): [[K, F][], N] {
  const callbacks: [K, F][] = [];

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith("on") && typeof value === "function") {
      delete attrs[key];
      callbacks.push([key.slice(2) as K, value as F]);
    }
  }
  return [callbacks, attrs as N];
}

export function html(
  tsa: TemplateStringsArray,
  ...values: Argument[]
): VirtualItem {
  const parser = new HTMLParser(tsa, values);
  return parser.consume();
}
