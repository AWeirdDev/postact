import type { VirtualItem } from "./vdom/structure";
import { virtualItemToFragment } from "./vdom/client";

class RuntimeError extends Error {
  constructor(reason: string) {
    super(reason);
  }
}

export function ensureWindow(): void {
  if (typeof window === "undefined")
    throw new RuntimeError(
      "expected the runtime context to be in the browser (window is undefined)",
    );
}

interface SelectionUtils {
  on: <T extends keyof HTMLElementEventMap>(
    event: T,
    handler: (e: HTMLElementEventMap[T]) => void,
  ) => { remove: () => void };
  render: (vi: VirtualItem) => void;
}

export function select<T extends HTMLElement>(
  query: string,
): T & SelectionUtils {
  const result = window.document.querySelector<T>(query) as
    | undefined
    | (T & SelectionUtils);
  if (!result)
    throw new ReferenceError(
      `could not find any element matching query: ${query}`,
    );

  result.on = (name, handler) => {
    result.addEventListener(name, handler);
    return { remove: () => result.removeEventListener(name, handler) };
  };
  result.render = (vi) => {
    result.replaceChildren(virtualItemToFragment(vi));
  };

  return result as T & SelectionUtils;
}

type _DollarSign = Record<
  keyof HTMLElementTagNameMap,
  (child: string | HTMLElement) => HTMLElement
>;

/**
 * Dollar sign (`$`) serves as a simple element creation tool for debugging.
 *
 * @example
 * ```ts
 * $.div(
 *   $.p("Hello, world!")
 * )
 * ```
 */
export const $: _DollarSign = new Proxy(
  {},
  {
    get(_, tag: string) {
      return (child: any) => {
        const element = window.document.createElement(tag);
        if (typeof child === "string") {
          element.textContent = child;
        } else {
          element.appendChild(child);
        }
        return element;
      };
    },
  },
) as _DollarSign;
