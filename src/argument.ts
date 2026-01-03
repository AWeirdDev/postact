import { isPrimitive } from "./utilities";
import { isSubscribable, type Subscribable } from "./subscribable";

import type { VirtualItem } from "./vdom/structure";

export type Argument =
  | null
  | undefined
  | boolean
  | number
  | bigint
  | string
  | Subscribable<any>
  | VirtualItem
  | Function;

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
