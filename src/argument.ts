import { isPrimitive } from "./utilities";
import { isSubscribable, type Subscribable } from "./subscribable";

import type { VirtualItem } from "./vdom/structure";
import type { Component, ComponentInstance } from "./component";

type EventMap = {
  animation: AnimationEvent;
  clipboard: ClipboardEvent;
  composition: CompositionEvent;
  drag: DragEvent;
  focus: FocusEvent;
  input: InputEvent;
  keyboard: KeyboardEvent;
  mouse: MouseEvent;
  touch: TouchEvent;
  pointer: PointerEvent;
  toggle: ToggleEvent;
  transition: TransitionEvent;
  ui: UIEvent;
  wheel: WheelEvent;
  generic: Event;
};

type EventHandler = {
  [K in keyof EventMap]: (e: EventMap[K]) => any;
}[keyof EventMap];

export type Argument =
  | null
  | undefined
  | boolean
  | number
  | bigint
  | string
  | Subscribable<any>
  | VirtualItem
  | EventHandler
  | Component<{}>
  | ComponentInstance;

export enum ArgumentType {
  Empty,
  Text,
  Subscribable,
  VirtualItem,
  Function,
}

/**
 * Identify the template argument.
 * @param arg The argument.
 */
export function identifyArgument(arg: Argument): ArgumentType {
  if (arg === null || typeof arg === "undefined") return ArgumentType.Empty;
  if (typeof arg === "function") return ArgumentType.Function;

  if (isPrimitive(arg)) return ArgumentType.Text;

  if (isSubscribable(arg)) {
    return ArgumentType.Subscribable;
  }

  return ArgumentType.VirtualItem;
}
