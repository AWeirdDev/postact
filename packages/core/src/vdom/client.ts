import {
  isVe,
  isVf,
  isVtn,
  type AttributeValue,
  type VirtualItem,
  type VirtualTextNode,
} from "./structure";

import { ensureWindow, isPrimitive } from "../utilities";

import { simpleRandString } from "../_internals";
import { isSubscribable, type Subscribable } from "../subscribables/base";
import { isRef } from "../subscribables/ref";
import { getCssKeyName, type StyleDeclaration } from "../css";

const ATTRIBUTE_RENAMES: Record<string, string> = {
  className: "class",
};

function _toFrag(vi: VirtualItem, options: ToFragOptions): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  if (isVtn(vi)) {
    // text node (VirtualTextNode)
    const vtn = vi as VirtualTextNode;
    const tn = window.document.createTextNode(vtn.data);

    // it's only needed if subscribables are present
    // otherwise it's a waste of resource
    if (vtn.subscribable) {
      const id = options.debug ? simpleRandString() : "";

      const start = window.document.createComment(options.debug ? `${id}` : "");
      const end = window.document.createComment(options.debug ? `/${id}` : "");

      const fs = new FragmentSpread(start, end, fragment); // as of now, the parent is the container

      vtn.subscribable.subscribe((value) => {
        if (tn.parentNode) {
          // if the text node has been added to the DOM, parentNode would be present
          fs.setParent(tn.parentNode);
        }
        const newFrag = resolveSubscribableValueToFrag(value, options);
        fs.spreadAndReplace(newFrag);
      });

      fragment.append(start, tn, end);
    } else {
      // no subscribables
      fragment.appendChild(tn);
    }

    return fragment;
  }

  if (isVe(vi)) {
    // element (VirtualElement)
    const element = window.document.createElement(vi.tag);

    // attributes (can be subscribables)
    vi.attributes.entries().forEach(([name, value]) => {
      if (typeof value === "undefined" || value === null) return;

      // for $refs
      if (isRef(value)) {
        value.value = element;
        value.emit();
      }

      // for regular subscribable attributes
      if (isSubscribable(value)) {
        value.subscribe((newValue) => {
          resolveAttributeForChangable(element, name, newValue);
        });
        return resolveAttributeForChangable(element, name, value.value);
      }

      if (Array.isArray(value)) {
        return element.setAttribute(name, value.join(" "));
      }

      // for styles declared with objects { ... }
      if (typeof value === "object") {
        return applyCssDeclaration(element, value);
      }

      element.setAttribute(name, value.toString());
    });

    // listeners
    vi.listeners.forEach(([name, listener]) => element.addEventListener(name, listener));

    // subscribables
    if (vi.subscribable)
      vi.subscribable.subscribe((value) => {
        const newFrag = resolveSubscribableValueToFrag(value, options);
        element.replaceChildren(newFrag);
      });

    // inner children
    element.append(...vi.children.map((child) => _toFrag(child, options)));

    fragment.appendChild(element);
    return fragment;
  }

  if (isVf(vi)) {
    // fragment (VirtualFragment)
    const toInsert = vi.children.reduce((frag, vi) => {
      frag.append(_toFrag(vi, options));
      return frag;
    }, window.document.createDocumentFragment());

    // again, it's only needed if there are subscribables
    if (vi.subscribable) {
      const id = options.debug ? simpleRandString() : "";

      const start = window.document.createComment(options.debug ? `${id}` : "");
      const end = window.document.createComment(options.debug ? `/${id}` : "");
      const fs = new FragmentSpread(start, end, fragment);

      vi.subscribable.subscribe((value) => {
        if (start.parentNode) {
          fs.setParent(start.parentNode);
        }

        const newFrag = resolveSubscribableValueToFrag(value, options);
        fs.spreadAndReplace(newFrag);
      });

      fragment.append(start, toInsert, end);
    } else {
      fragment.appendChild(toInsert);
    }
    return fragment;
  } else {
    throw new Error(`unknown virtual item, contents: ${JSON.stringify(vi)}`);
  }
}

function resolveSubscribableValueToFrag(value: any, options: ToFragOptions): DocumentFragment {
  if (typeof value === "undefined" || value === null) {
    return window.document.createDocumentFragment();
  } else if (isPrimitive(value)) {
    const frag = window.document.createDocumentFragment();
    frag.appendChild(window.document.createTextNode(value.toString()));
    return frag;
  } else {
    return _toFrag(value, options);
  }
}

class FragmentSpread {
  #start: Node;
  #end: Node;
  #parent: Node;

  constructor(start: Node, end: Node, parent: Node) {
    this.#start = start;
    this.#end = end;
    this.#parent = parent;
  }

  setParent(parent: Node) {
    this.#parent = parent;
  }

  spreadAndReplace(items: DocumentFragment) {
    let current = this.#start.nextSibling;

    while (current && !this.#end.isEqualNode(current)) {
      const next = current.nextSibling; // cache first
      this.#parent.removeChild(current);
      current = next;
    }

    this.#parent.insertBefore(items, this.#end);
  }
}

/**
 * Resolves the attribute name & value. If the given value is null, removes the
 * attribute (if exists); if the given value is non-null, sets the attribute.
 *
 * @param element The HTML element to add attributes to.
 * @param name The name of the attribute.
 * @param value The value of the attribute.
 */
function resolveAttributeForChangable(element: HTMLElement, name: string, value: AttributeValue) {
  const keyName = Object.keys(ATTRIBUTE_RENAMES).includes(name) ? ATTRIBUTE_RENAMES[name]! : name;

  // According to mdn, if the specified attribute does not exist,
  // `removeAttribute()` returns without generating an error.
  if (typeof value === "undefined" || value === null) element.removeAttribute(keyName);
  else element.setAttribute(keyName, value.toString());
}

function resolveAddCssKey(element: HTMLElement, key: string, content: any) {
  if (typeof content === "undefined" || content === null) return;
  element.style[key as any] = content.toString();
}

function applyCssDeclaration(element: HTMLElement, styleDecl: StyleDeclaration) {
  Object.entries(styleDecl).forEach(([key, content]) => {
    if (isSubscribable(content)) {
      resolveAddCssKey(element, key, content.value);

      // then, we subscribe!
      content.subscribe((newData) => resolveAddCssKey(element, key, newData));
      return;
    } else {
      resolveAddCssKey(element, key, content);
    }
  });
}

export interface ToFragOptions {
  /**
   * Whether to enable debug mode. *(default: `false`)*
   * When debug mode is enabled, comments will appear in the following format,
   * wrapping fragments:
   * ```html
   * <!--xxxxxx-->
   * <!--/xxxxxx-->
   * ```
   * When disabled, all identifiers are wiped out.
   */
  debug?: boolean;
}

const DEFAULT_TOFRAG_OPTIONS = { debug: false };

/**
 * Converts a virtual DOM to a {@link DocumentFragment} for rendering it on the web.
 * To put it short, this process is called "realization," and as the name suggests, it
 * realizes a virtual DOM.
 * This can only be used when the `window` context is present.
 *
 * @param vi The virtual item.
 * @param options Additional options. For more, see {@link ToFragOptions}.
 */
export function realize(
  vi: VirtualItem,
  options: ToFragOptions = DEFAULT_TOFRAG_OPTIONS,
): DocumentFragment {
  ensureWindow();
  return _toFrag(vi, options);
}
