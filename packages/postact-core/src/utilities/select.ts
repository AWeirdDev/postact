import type { VirtualItem } from "../vdom/structure";
import { realize } from "../vdom/client";
import { render } from "./render";

interface SelectionUtils {
  /**
   * Render virtual DOM.
   * @param vi The virtual DOM.
   *
   * ```ts
   * select("#app").render(html`<p>Hello, world!</p>`)
   * ```
   */
  render: (vi: VirtualItem) => void;
}

/**
 * Utility to select an HTML node.
 * This is essentially `document.querySelector`, but attached with postact utilities.
 * Instead of returning `undefined`, this throws an error if nothing's found.
 *
 * @param query The query.
 * @throws {ReferenceError} The node was not found.
 */
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

  result.render = (vi) => {
    render(result, vi);
  };

  return result as T & SelectionUtils;
}
