import {
  isComponentInstance,
  isComponentPtr,
  type Component,
  type ComponentInstance,
} from "../component";
import { realize } from "../vdom/client";
import type { VirtualItem } from "../vdom/structure";

export type Renderable = VirtualItem | ComponentInstance<any> | Component<any>;

function toNode(re: Renderable): DocumentFragment {
  if (isComponentInstance(re)) {
    return realize(re.ptr(re.props));
  }
  if (isComponentPtr(re)) {
    return realize(re.ptr({}));
  }
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
