import { isSubscribable, type Subscribable } from "../subscribables/base";
import { dependent } from "../subscribables/dependent";
import { createVf, isFr, isVf, type VirtualItem } from "../vdom/structure";

export namespace For {
  export type RenderFn<T> = (mapFn: T) => VirtualItem;
  export type Children<T> = VirtualItem | RenderFn<T>;
  export interface Props<T> {
    each: T[] | Subscribable<T[]>;
    children: Children<T>;
  }
}

function resolveRender<T>(item: For.Children<T>): For.RenderFn<T> {
  if (isVf(item)) {
    const first = item.children[0];
    if (!isFr(first)) throw new TypeError("expected function as children for <For>");
    return first.render;
  }

  if (typeof item === "function") {
    return item;
  }

  throw new TypeError(
    "expected either a function or a fragment containing one function in children for <For>",
  );
}

/**
 * Maps an array of items defined in `each`.
 * The children provided **must** either be a rendering function or a fragment containing the function.
 * The function takes one parameter of type `T` when the type of `each` is `T[]` or `Subscribable<T[]>`.
 *
 * Example:
 *
 * ```tsx
 * const $todos = useState<string[]>([]);
 *
 * <ul>
 *   <For each={$todos}>
 *    {(todo) => <li>{todo}</li>}
 *   </For>
 * </ul>
 * ```
 *
 * In the above example, `<For>` maps the items of `$todos.value`.
 */
export function For<T>({ children, each }: For.Props<T>): VirtualItem {
  const render = resolveRender(children);

  if (!isSubscribable(each)) {
    return createVf(each.map((item) => render(item)));
  }

  return createVf(
    each.value.map((item) => render(item)),
    dependent(each, (value) => createVf(value.map((item) => render(item)))),
  );
}
