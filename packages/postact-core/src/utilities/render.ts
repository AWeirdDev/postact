import { realize } from "../vdom/client";
import type { VirtualItem } from "../vdom/structure";

/**
 * Render virtual nodes onto the actual DOM.
 * @param ele The element (container).
 * @param vi A virtual DOM.
 */
export function render(ele: HTMLElement, vi: VirtualItem) {
  ele.replaceChildren(realize(vi));
}
