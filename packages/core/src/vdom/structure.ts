import { isPostactIdent, PostactIdentifier } from "../_internals";
import { type StyleDeclaration } from "../css";

import type { Ref } from "../subscribables/ref";
import type { Subscribable } from "../subscribables/base";

// for attributes
type _Primitive = number | string | boolean | null | undefined;
export type AttributeValue =
  | _Primitive
  | string
  | StyleDeclaration
  | Subscribable<_Primitive>
  | Ref<any>
  | string[];
export type Attributes = Map<string, AttributeValue>;

export interface VirtualElement {
  readonly __p: PostactIdentifier.VirtualElement;

  tag: string;
  children: VirtualItem[];
  attributes: Attributes;
  listeners: [
    keyof HTMLElementEventMap,
    (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void,
  ][];
  subscribable?: Subscribable<any>;
}

export function isVe(item: any): item is VirtualElement {
  return isPostactIdent(PostactIdentifier.VirtualElement, item);
}

export interface VirtualFragment {
  readonly __p: PostactIdentifier.VirtualFragment;
  children: VirtualItem[];
  subscribable?: Subscribable<any>;
}

export function isVf(item: any): item is VirtualFragment {
  return isPostactIdent(PostactIdentifier.VirtualFragment, item);
}

/**
 * (helper) Create a virtual fragment.
 * Note:
 */
export function createVf(
  children: VirtualItem[],
  subscribable?: Subscribable<any>,
): VirtualFragment {
  // quick optimization
  if (children.length === 1 && isVf(children[0]!) && !(subscribable && children[0].subscribable)) {
    // subsribable && children[0].subscribable => skip
    //
    // !subscribable && children[0].subscribable => children[0].subscribable
    // subscribable && !children[0].subscribable = subscribable
    // !subscribable && !children[0].subscribable => undefined
    return {
      __p: PostactIdentifier.VirtualFragment,
      children: children[0].children,
      subscribable: children[0].subscribable ?? subscribable,
    };
  }

  return {
    __p: PostactIdentifier.VirtualFragment,
    children,
    subscribable,
  };
}

export interface VirtualTextNode {
  readonly __p: PostactIdentifier.VirtualTextNode;

  data: string;
  subscribable?: Subscribable<any>;
}

export function isVtn(item: any): item is VirtualTextNode {
  return isPostactIdent(PostactIdentifier.VirtualTextNode, item);
}

/**
 * (helper) Create a virtual text node.
 */
export function createVtn(data: string, subscribable?: Subscribable<any>): VirtualTextNode {
  return {
    __p: PostactIdentifier.VirtualTextNode,
    data,
    subscribable,
  };
}

export interface FunctionRender {
  readonly __p: PostactIdentifier.FunctionRender;
  render: () => VirtualItem;
}

/**
 * Checks if the given item is a rendering function.
 * @param item The item to check.
 */
export function isFr(item: any): item is FunctionRender {
  return isPostactIdent(PostactIdentifier.FunctionRender, item);
}

/**
 * Virtual items without `Promise`.
 * This avoids circular type dependencies.
 */
export type ResolvedVirtualItem =
  | VirtualTextNode
  | VirtualElement
  | VirtualFragment
  | FunctionRender
  | null;

export type AsyncVirtualItem = Promise<ResolvedVirtualItem>;

/**
 * Any virtual item. Could be a text node, an element, a fragment,
 * a rendering function, a promise, or just null.
 */
export type VirtualItem = ResolvedVirtualItem | AsyncVirtualItem;

/**
 *
 * @param value Checks if the given item is a promise.
 */
export function isPromise(value: any): value is Promise<unknown> {
  return typeof value?.then === "function";
}

/**
 * Any type of unsanitized children.
 * This should be preferred over {@link VirtualItem} because it's more
 * flexible and easier to use.
 */
export type AnyChildren =
  | VirtualItem
  | string
  | boolean
  | number
  | bigint
  | undefined
  | Subscribable<AnyChildren>
  | AnyChildren[];

export type PropsWithChildren<K = {}> = { children?: AnyChildren } & K;
