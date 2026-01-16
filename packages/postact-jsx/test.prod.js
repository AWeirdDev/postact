// ../postact-core/src/_internals.ts
function isPostactEcosystem(item) {
  if (item === null) return false;
  if (typeof item === "object" && Object.hasOwn(item, "__p")) return true;
  return false;
}
function isPostactIdent(ident, item) {
  if (item === null) return false;
  if (
    (typeof item === "object" || typeof item === "function") &&
    Object.hasOwn(item, "__p") &&
    item["__p"] == ident
  )
    return true;
  return false;
}

// ../postact-core/src/vdom/structure.ts
function createVf(children, subscribable) {
  return {
    __p: 3 /* VirtualFragment */,
    children,
    subscribable,
  };
}
function createVtn(data, subscribable) {
  return {
    __p: 4 /* VirtualTextNode */,
    data,
    subscribable,
  };
}

// ../postact-core/src/subscribable.ts
class BaseSubscribable {
  value;
  #subscribers;
  constructor(initial) {
    this.value = initial;
    this.#subscribers = new Map();
  }
  subscribe(subscriber) {
    this.#subscribers.set(subscriber, subscriber);
  }
  unsubscribe(pointer) {
    this.#subscribers.delete(pointer);
  }
  emit() {
    const value = this.value;
    this.#subscribers.forEach((sub) => sub(value));
  }
}
function isSubscribable(item) {
  return (
    isPostactIdent(0 /* Dependent */, item) ||
    isPostactIdent(1 /* State */, item) ||
    isPostactIdent(8 /* Ref */, item)
  );
}

// ../postact-core/src/ref.ts
class RefSubscribable {
  __p = 8 /* Ref */;
  value;
  #subscribers;
  constructor() {
    this.value = null;
    this.#subscribers = new Map();
  }
  subscribe(subscriber) {
    this.#subscribers.set(subscriber, subscriber);
  }
  unsubscribe(pointer) {
    this.#subscribers.delete(pointer);
  }
  emit() {
    const value = this.value;
    if (value === null) throw new Error("ref is currently null");
    this.#subscribers.forEach((sub) => sub(value));
  }
}

// ../postact-core/src/vdom/client.ts
class FragmentSpread {
  #start;
  #end;
  #parent;
  constructor(start, end, parent) {
    this.#start = start;
    this.#end = end;
    this.#parent = parent;
  }
  setParent(parent) {
    this.#parent = parent;
  }
  spreadAndReplace(items) {
    let current = this.#start.nextSibling;
    while (current && !this.#end.isEqualNode(current)) {
      const next = current.nextSibling;
      this.#parent.removeChild(current);
      current = next;
    }
    this.#parent.insertBefore(items, this.#end);
  }
}
// ../postact-core/src/utilities/unescape.ts
var HTML_UNESCAPES = Object.freeze({
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
});
var RE_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;
function unescape(slice) {
  return slice && RE_ESCAPED_HTML.test(slice)
    ? slice.replace(RE_ESCAPED_HTML, (entity) => HTML_UNESCAPES[entity])
    : slice;
}
// ../postact-core/src/utilities/is-primitive.ts
function isPrimitive(value) {
  return ["string", "number", "bigint", "boolean"].includes(typeof value);
}
// ../postact-core/src/state.ts
function getUpdaterValue(current, upd) {
  return typeof upd === "function" ? upd(current) : upd;
}

class BaseStateManager {
  value;
  __p = 1 /* State */;
  #subscribers;
  #checkers;
  constructor(initial) {
    this.value = initial;
    this.#subscribers = new Map();
    this.#checkers = [];
  }
  update(upd) {
    const value = getUpdaterValue(this.value, upd);
    for (const checker of this.#checkers) {
      if (!checker(this.value, value)) return;
    }
    this.value = value;
    this.emit();
  }
  set(upd) {
    this.value = getUpdaterValue(this.value, upd);
  }
  subscribe(subscriber) {
    this.#subscribers.set(subscriber, subscriber);
  }
  unsubscribe(pointer) {
    this.#subscribers.delete(pointer);
  }
  emit() {
    const value = this.value;
    this.#subscribers.forEach((_, subscriber) => subscriber(value));
  }
  withChecker(checker) {
    this.#checkers.push(checker);
    return this;
  }
  withCheckers(checkers) {
    this.#checkers.push(...checkers);
    return this;
  }
}
// ../postact-core/src/dependent.ts
class Dependent {
  __p = 0 /* Dependent */;
  #gen;
  #value;
  #subscribers;
  constructor(arg0, gen, set) {
    this.#value = set || gen(Array.isArray(arg0) ? arg0.map((itm) => itm.value) : arg0.value);
    this.#gen = gen;
    this.#subscribers = new Map();
    if (Array.isArray(arg0))
      arg0.forEach((subscribable) => {
        subscribable.subscribe(() => {
          const generated = this.#gen(arg0.map((itm) => itm.value));
          this.#value = generated;
          this.#subscribers.forEach((_, subscriber) => subscriber(generated));
        });
      });
    else
      arg0.subscribe(() => {
        const generated = this.#gen(arg0.value);
        this.#value = generated;
        this.#subscribers.forEach((_, subscriber) => subscriber(generated));
      });
  }
  get value() {
    return this.#value;
  }
  subscribe(subscriber) {
    this.#subscribers.set(subscriber, subscriber);
  }
  unsubscribe(pointer) {
    this.#subscribers.delete(pointer);
  }
}
// ../postact-core/src/later.ts
class Later extends BaseStateManager {
  #promise;
  #catch;
  ok;
  constructor(promise) {
    super(null);
    this.#promise = promise;
    this.ok = false;
    this.#catch = () => {};
    this.#promise
      .then((value) => this.update(value))
      .catch((reason) => this.#catch && this.#catch(reason));
  }
  catch(onRejected) {
    this.#catch = onRejected;
    return this;
  }
}
// ../postact-core/src/argument.ts
function identifyArgument(arg) {
  if (arg === null || typeof arg === "undefined") return 0 /* Empty */;
  if (typeof arg === "function") return 4 /* Function */;
  if (isPrimitive(arg)) return 1 /* Text */;
  if (isSubscribable(arg)) {
    return 2 /* Subscribable */;
  }
  return 3 /* VirtualItem */;
}

// ../postact-core/src/component.ts
function isComponentPtr(item) {
  return isPostactIdent(6 /* ComponentPointer */, item);
}
function isComponentInstance(item) {
  return isPostactIdent(7 /* ComponentInstance */, item);
}

// ../postact-core/src/html.ts
class ParseError extends Error {
  constructor(reason) {
    super(reason);
  }
  static noInsertInTagNames() {
    return new ParseError("`${...}` is not allowed in tag names");
  }
  static noInsertInAttrNames() {
    return new ParseError("`${...}` is not allowed in attribute names");
  }
  static invalidCharacterInTagName(chr) {
    return new ParseError(`${chr} is not a valid html tag character`);
  }
  static invalidCharacterInAttributeName(chr) {
    return new ParseError(`${chr} is not a valid html attribute character`);
  }
  static expectedQuote() {
    return new ParseError('expected double quote (")');
  }
  static expectedAttrName() {
    return new ParseError("expected attribute name, got empty");
  }
  static expectedAttrEqual() {
    return new ParseError("expected equal sign (=) right after attribute name");
  }
  static expectedTagClosing() {
    return new ParseError("expected tag to be closing (with a slash: /)");
  }
  static expectedTagOpening() {
    return new ParseError("expected an opening tag");
  }
  static tagMismatch(starting, closing) {
    return new ParseError(
      `the starting and closing tags do not match: \`${starting}\` and \`${closing}\``,
    );
  }
  static noBackslashBeforeInsert() {
    return new ParseError("there should be no backslash (\\) before ${...}");
  }
  static typeCheckComponentProps() {
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
  #strings;
  #values;
  #tsaIdx;
  #idx;
  constructor(strings, values) {
    this.#strings = strings;
    this.#values = values;
    this.#tsaIdx = 0;
    this.#idx = 0;
  }
  next() {
    if (this.#tsaIdx >= this.#strings.length) return null;
    if (this.#strings[this.#tsaIdx].length == 0) {
      this.#idx = 0;
      this.#tsaIdx += 1;
      return [true, ""];
    }
    if (this.#idx >= this.#strings[this.#tsaIdx].length) return null;
    const templateStr = this.#strings[this.#tsaIdx];
    const value = templateStr[this.#idx];
    this.#idx = (this.#idx + 1) % templateStr.length;
    this.#tsaIdx += this.#idx == 0 ? 1 : 0;
    return [this.#idx == 0, value];
  }
  seek() {
    return this.#strings[this.#tsaIdx][this.#idx] || null;
  }
  getInsertion() {
    return this.#values[this.#tsaIdx - 1] ?? null;
  }
  consume() {
    const children = [];
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
        const vi = transformArgToVirtualItem(this.getInsertion());
        if (vi !== null) children.push(vi);
      } else if (!/\s/.test(chr)) {
        throw ParseError.expectedTagOpening();
      }
    }
    return {
      __p: 3 /* VirtualFragment */,
      children,
    };
  }
  processElement() {
    const [startTag, attributes, selfClosing, afterTagShouldInsert] = this.consumeTag();
    const [listeners, attrs] = filterListenersFromAttributes(attributes);
    if (selfClosing) {
      return {
        __p: 2 /* VirtualElement */,
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
      __p: 2 /* VirtualElement */,
      tag: startTag,
      attributes: attrs,
      children,
      listeners,
    };
  }
  processComponent(insertion) {
    const [attributes, selfClosing, afterTagShouldInsert] = this.consumeAttributes();
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
  consumeTag() {
    let tag = "";
    while (true) {
      const [shouldInsert, chr] = this.next();
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
  consumeAttributes() {
    const attrs = new Map();
    let name = "";
    let state = 0;
    while (true) {
      const [shouldInsert, chr] = this.next();
      if (chr == ">") {
        if (name) {
          attrs.set(name, "true");
        }
        return [attrs, false, shouldInsert];
      }
      if (chr == "/") {
        const [_, c] = this.consumeWhitespace();
        if (c !== ">") throw ParseError.expectedTagClosing();
        if (name) {
          attrs.set(name, "true");
        }
        return [attrs, true, shouldInsert];
      }
      if (state === 0) {
        if (!name && (/\s/.test(chr) || !chr)) continue;
        if (/\s|=/.test(chr)) {
          if (!name) throw ParseError.expectedAttrName();
          state = 1;
        } else {
          if (shouldInsert) throw ParseError.noInsertInAttrNames();
          if (!/[a-zA-Z0-9-]/.test(chr)) throw ParseError.invalidCharacterInAttributeName(chr);
          name += chr;
          continue;
        }
      }
      if (chr === " ") {
        attrs.set(name, "true");
        name = "";
        state = 0;
        continue;
      }
      if (chr !== "=") throw ParseError.expectedAttrEqual();
      const value = shouldInsert
        ? argToAttrValueOrFn(this.getInsertion())
        : this.consumeStringQuote();
      if (value !== null) {
        attrs.set(name, value);
      }
      name = "";
      state = 0;
      continue;
    }
  }
  consumeEndTag() {
    const [shouldInsertAfterTagName, chr] = this.consumeWhitespace();
    if (chr !== "/") throw ParseError.expectedTagClosing();
    if (shouldInsertAfterTagName) {
      const insertion = this.getInsertion();
      if (typeof insertion === "function") return insertion;
      throw ParseError.noInsertInTagNames();
    }
    let name = "";
    let state = 0;
    while (true) {
      const [shouldInsert, chr2] = this.next();
      if (chr2 === ">") {
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
        if (typeof name === "function") throw ParseError.invalidCharacterInTagName(chr2);
        if (/\s/.test(chr2)) state = 1;
        if (state == 0 && !/[a-zA-Z0-9-]/.test(chr2))
          throw ParseError.invalidCharacterInTagName(chr2);
        name += chr2;
      }
    }
  }
  consumeWhitespace() {
    const [shouldInsert, chr] = this.next();
    if (/\s/.test(chr)) return this.consumeWhitespace();
    return [shouldInsert, chr];
  }
  consumeStringQuote() {
    let text = "";
    const [shouldInsert, chr] = this.consumeWhitespace();
    if (chr !== '"') throw ParseError.expectedQuote();
    text += '"';
    if (shouldInsert) text += this.getInsertion().toString();
    while (true) {
      const [shouldInsert2, chr2] = this.next();
      if (chr2 == "\\") {
        const [nextInsert, nextChr] = this.next();
        if (nextInsert) throw ParseError.noBackslashBeforeInsert();
        text += "\\" + nextChr;
        continue;
      }
      if (chr2 == '"') break;
      text += chr2;
      if (shouldInsert2) text += this.getInsertion().toString();
    }
    return JSON.parse(text + '"');
  }
  consumeChildren(afterTagShouldInsert) {
    let text = "";
    const children = [];
    if (afterTagShouldInsert) children.push(transformArgToVirtualItem(this.getInsertion()));
    while (true) {
      const [shouldInsert, chr] = this.next();
      if (chr === "<") {
        if (this.seek() === "/") {
          break;
        } else {
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
function transformArgToVirtualItem(insertion) {
  switch (identifyArgument(insertion)) {
    case 0 /* Empty */:
      return null;
    case 1 /* Text */:
      return createVtn(insertion.toString());
    case 2 /* Subscribable */:
      const state = insertion;
      const value = state.value;
      if (typeof value !== "undefined" && value !== null) {
        if (isPrimitive(value)) {
          return createVtn(value.toString(), state);
        } else {
          return createVf([value], state);
        }
      } else {
        return createVtn("", state);
      }
    case 3 /* VirtualItem */:
      return insertion;
    case 4 /* Function */:
      const fValue = insertion();
      if (typeof fValue === "undefined" || fValue === null) return null;
      if (isPrimitive(fValue)) return createVtn(fValue.toString());
      if (!isPostactEcosystem(fValue))
        throw new Error(`unresolvable value in children after function calling. value: ${fValue}`);
      return fValue;
  }
}
function argToAttrValueOrFn(arg) {
  switch (identifyArgument(arg)) {
    case 0 /* Empty */:
      return null;
    case 1 /* Text */:
      return arg.toString();
    case 2 /* Subscribable */:
      return arg;
    case 3 /* VirtualItem */:
      return null;
    case 4 /* Function */:
      return arg;
  }
}
function filterListenersFromAttributes(attrs) {
  const callbacks = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith("on") && typeof value === "function") {
      attrs.delete(key);
      callbacks.push([key.slice(2), value]);
    }
  }
  return [callbacks, attrs];
}
// ../postact-core/src/routes.ts
var GLOBAL_ROUTER = new BaseSubscribable({ pathname: "", hash: " " });
// jsx-runtime.ts
var Fragment = Symbol();
