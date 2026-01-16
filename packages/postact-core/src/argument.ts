import { isPrimitive } from "./utilities";
import { isSubscribable, type Subscribable } from "./subscribable";

import { createVf, createVtn, type VirtualItem } from "./vdom/structure";
import type { Component, ComponentInstance } from "./component";
import { isPostactEcosystem } from "./_internals";

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
  | Component<any>
  | ComponentInstance<any>;

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

export function transformArgToVirtualItem(insertion: Argument): VirtualItem {
  switch (identifyArgument(insertion)) {
    case ArgumentType.Empty:
      return null;

    case ArgumentType.Text:
      return createVtn(insertion!.toString());

    case ArgumentType.Subscribable:
      // we'll put the initial value
      const state = insertion as Subscribable<any>;
      const value = state.value;

      if (typeof value !== "undefined" && value !== null) {
        if (isPrimitive(value)) {
          return createVtn(value.toString(), state);
        } else {
          return createVf([value], state);
        }
      } else {
        return createVtn("", state);
      }

    case ArgumentType.VirtualItem:
      return insertion as VirtualItem;

    case ArgumentType.Function:
      // similar to states, we'll do an initial render
      const fValue = (insertion as Function)();
      if (typeof fValue === "undefined" || fValue === null) return null;
      if (isPrimitive(fValue)) return createVtn(fValue.toString());
      if (!isPostactEcosystem(fValue))
        throw new Error(`unresolvable value in children after function calling. value: ${fValue}`);

      return fValue as VirtualItem;
  }
}
