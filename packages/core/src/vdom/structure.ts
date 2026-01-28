import { isPostactIdent, PostactIdentifier } from "../_internals";
import { type StyleDeclaration } from "../css";

import type { Ref } from "../subscribables/ref";
import type { Subscribable } from "../subscribables/base";

type _Any = number | string | boolean | null | undefined;
export type AttributeValue =
  | _Any
  | string
  | StyleDeclaration
  | Subscribable<_Any>
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

// abstraction only
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
 */
export function createVf(
  children: VirtualItem[],
  subscribable?: Subscribable<any>,
): VirtualFragment {
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

export type VirtualItem = VirtualTextNode | VirtualElement | VirtualFragment | null;
