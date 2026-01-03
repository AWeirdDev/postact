import { ArgumentType, identifyArgument, type Argument } from "./argument";
import { dependent } from "./dependent";
import { isSubscribable, type Subscribable } from "./subscribable";
import { isPrimitive } from "./utilities";

/**
 * Create a subscribable text.
 *
 * @example
 * ```ts
 * const $count = state(0);
 * const $label = text`Current: ${$count}`;
 *
 * console.log($label.value) // "Current: 0"
 *
 * // Now we update the $count
 * $count.update(1)
 * console.log($label.value) // "Current: 1"
 * ```
 */
export function text(
  tsa: TemplateStringsArray,
  ...args: Argument[]
): Subscribable<string> {
  const deps = args.reduce((acc, arg) => {
    if (isSubscribable(arg)) acc.push(arg);
    return acc;
  }, [] as Subscribable<any>[]);
  return textWithDefault(deps, tsa, args);
}

/**
 * (internal, reserved)
 */
export function textWithDefault(
  deps: Subscribable<any>[],
  tsa: TemplateStringsArray,
  args: Argument[],
  set?: string,
): Subscribable<string> {
  return dependent<string, any>(
    deps,
    () => {
      let i = 0;
      let s = "";

      while (i < tsa.length) {
        if (i - 1 >= 0) {
          const arg = args[i - 1];
          switch (identifyArgument(arg)) {
            case ArgumentType.Empty:
              break;

            case ArgumentType.Text:
              s += arg!.toString();
              break;

            case ArgumentType.Subscribable:
              s += anyToString((arg as Subscribable<any>).value);
              break;

            case ArgumentType.VirtualItem:
              s += anyToString(arg);
              break;

            case ArgumentType.Function:
              s += anyToString((arg as Function)());
              break;
          }
        }

        s += tsa[i];
        i += 1;
      }

      return s;
    },
    set,
  );
}

/**
 * (internal) Convert any item to a string.
 */
export function anyToString(item: any): string {
  if (typeof item === "undefined" || item === null) return "";
  if (isPrimitive(item)) return item.toString();
  return JSON.stringify(item);
}
