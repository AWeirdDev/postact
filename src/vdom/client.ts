import type { VirtualElement, VirtualItem, VirtualTextNode } from "./structure";

import { ensureWindow } from "../utilities";

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  // a text node, which is fine
  if (
    Object.hasOwn(vi, "__postactItem") &&
    // @ts-ignore
    vi["__postactItem"] == "virtual-text-node"
  ) {
    const vtn = vi as VirtualTextNode;
    const tn = window.document.createTextNode(vtn.data);

    if (vtn.subscribable)
      vtn.subscribable.subscribe((value) => (tn.textContent = value));

    fragment.appendChild(tn);
    return fragment;
  }

  // we're left with VirtualElement[]
  for (const item of vi as VirtualElement[]) {
    const element = window.document.createElement(item.tag);

    // attributes
    Object.entries(item.attributes).forEach(([name, value]) =>
      element.setAttribute(name, value),
    );

    // listeners
    item.listeners.forEach(([name, listener]) =>
      element.addEventListener(name, listener),
    );

    // subscribables
    if (item.subscribable)
      item.subscribable.subscribe((value) => {
        if (["string", "number", "bigint", "boolean"].includes(typeof value)) {
          // then we'll keep it simple
          element.textContent = value.toString();
        } else {
          element.replaceChildren(_toFrag(value));
        }
      });

    // inner children
    element.append(...item.children.map((child) => _toFrag(child)));

    fragment.appendChild(element);
  }

  return fragment;
}

/**
 * Converts a virtual DOM to a document fragment for rendering it on the web.
 * @param vi
 * @returns
 */
export function virtualItemToFragment(vi: VirtualItem): DocumentFragment {
  ensureWindow();
  return _toFrag(vi);
}
