import type { Subscribable } from "../subscribable";

export interface VirtualElement {
  readonly __postactItem: `virtual-element`;

  tag: string;
  attributes: Record<string, string>;
  children: VirtualItem[];
  listeners: [
    keyof HTMLElementEventMap,
    (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void,
  ][];
  subscribable?: Subscribable<any>;
}

export interface VirtualTextNode {
  readonly __postactItem: `virtual-text-node`;

  data: string;
  subscribable?: Subscribable<any>;
}

export type VirtualItem =
  | null
  | undefined
  | string
  | VirtualTextNode
  | VirtualElement[];
