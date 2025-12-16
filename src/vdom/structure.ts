import type { Subscribable } from "../state";

export interface VirtualElement {
  readonly __postactItem: `virtual-element`;

  tag: string;
  attributes: Record<string, string>;
  children: VirtualItem[];
  listeners: [
    keyof HTMLElementEventMap,
    (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void,
  ][];
  subscribables: Subscribable<any>[];
}

export type VirtualItem = string | null | undefined | VirtualElement[];
