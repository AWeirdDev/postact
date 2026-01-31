import { realize } from "../vdom/client";
import type { VirtualItem } from "../vdom/structure";

export type Renderable = VirtualItem;

function toNode(re: Renderable): DocumentFragment {
  return realize(re);
}

/**
 * Render virtual nodes onto the actual DOM.
 * @param ele The element (container).
 * @param vi A virtual DOM.
 */
export function render(ele: HTMLElement, re: Renderable) {
  ele.replaceChildren(toNode(re));
}
