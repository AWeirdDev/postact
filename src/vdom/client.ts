import type { VirtualItem } from "./structure";

import { ensureWindow } from "../utilities";

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  // we're left with VirtualElement[]
  for (const item of vi) {
    const element = window.document.createElement(item.tag);

    // attributes
    Object.entries(item.attributes).forEach(([name, value]) =>
      element.setAttribute(name, value),
    );

    // listeners
    item.listeners.forEach(([name, listener]) =>
      element.addEventListener(name, listener),
    );

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
