import { isPrimitive } from "./utilities";
import { isSubscribable, type Subscribable } from "./subscribables/base";

import { createVf, createVtn, type FunctionRender, type VirtualItem } from "./vdom/structure";
import { PostactIdentifier } from "./_internals";

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
  | (() => VirtualItem);
// | Component<any>
// | ComponentInstance<any>;

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

  arg satisfies VirtualItem;
  return ArgumentType.VirtualItem;
}

/**
 * Transform raw data ("argument") to renderable `VirtualItem`.
 * @param arg The argument. Could be primitives, subscribables, functions, etc.
 */
export function transformArgToVirtualItem(arg: Argument): VirtualItem {
  switch (identifyArgument(arg)) {
    case ArgumentType.Empty:
      return null;

    case ArgumentType.Text:
      return createVtn(arg!.toString());

    case ArgumentType.Subscribable:
      // we'll put the initial value
      const state = arg as Subscribable<any>;
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
      return arg as VirtualItem;

    case ArgumentType.Function:
      // function render
      return {
        __p: PostactIdentifier.FunctionRender,
        render: arg as () => VirtualItem,
      } satisfies FunctionRender;
  }
}
