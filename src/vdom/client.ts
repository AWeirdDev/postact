import type {
  VirtualElement,
  VirtualFragment,
  VirtualItem,
  VirtualTextNode,
} from "./structure";

import { ensureWindow } from "../utilities";

function isPrimitive(value: any): boolean {
  return ["string", "number", "bigint", "boolean"].includes(typeof value);
}

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();

  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  // a text node
  if (Object.hasOwn(vi, "__postactItem")) {
    if (vi["__postactItem"] == "virtual-text-node") {
      // VirtualTextNode
      const vtn = vi as VirtualTextNode;
      const tn = window.document.createTextNode(vtn.data);

      if (vtn.subscribable)
        vtn.subscribable.subscribe((value) => {
          if (isPrimitive(value)) {
            // then we'll keep it simple
            tn.textContent = value.toString();
          } else {
          }
        });

      fragment.appendChild(tn);
      return fragment;
    } else if (vi["__postactItem"] == "virtual-element") {
      // VirtualElement
      const element = window.document.createElement(vi.tag);

      // attributes
      Object.entries(vi.attributes).forEach(([name, value]) =>
        element.setAttribute(name, value),
      );

      // listeners
      vi.listeners.forEach(([name, listener]) =>
        element.addEventListener(name, listener),
      );

      // subscribables
      if (vi.subscribable)
        vi.subscribable.subscribe((value: any) => {
          if (isPrimitive(value)) {
            // then we'll keep it simple
            element.textContent = value.toString();
          } else {
            element.replaceChildren(_toFrag(value));
          }
        });

      // inner children
      element.append(...vi.children.map((child) => _toFrag(child)));

      fragment.appendChild(element);
      return fragment;
    }
  }

  // we're left with VirtualFragment
  if (vi.subscribable)
    vi.subscribable.subscribe((value: any) => {
      if (isPrimitive(value)) {
        fragment.textContent = value.toString();
      } else {
        const newFrag = (value as VirtualFragment).children.reduce((f, vi) => {
          f.append(_toFrag(vi));
          return f;
        }, window.document.createDocumentFragment());
        fragment.replaceChildren(newFrag);
      }
    });

  fragment.append(...(vi as VirtualFragment).children.map((vi) => _toFrag(vi)));
  return fragment;
}

/**
 * Converts a virtual DOM to a document fragment for rendering it on the web.
 * @param vi
 */
export function virtualItemsToFragment(vi: VirtualItem): DocumentFragment {
  ensureWindow();
  return _toFrag(vi);
}
