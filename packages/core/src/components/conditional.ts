import { isSubscribable, type Subscribable } from "../subscribables/base";
import { dependent } from "../subscribables/dependent";
import { createVf, isFr, isVf, type VirtualItem } from "../vdom/structure";

export namespace Conditional {
  export type Children = VirtualItem | (() => VirtualItem);
  export interface Props {
    condition: boolean | Subscribable<boolean>;
    children: Children;
  }
}

function resolveRender(item: Conditional.Children): () => VirtualItem {
  if (isVf(item)) {
    const first = item.children[0];
    if (!isFr(first)) throw new TypeError("expected function as children for <Conditional>");
    return first.render;
  }

  if (typeof item === "function") {
    return item;
  }

  throw new TypeError(
    "expected either a function or a fragment containing one function in children for <Conditional>",
  );
}

/**
 * Renders a component when the value of `condition` (as a subscribable or just a value) is `true`.
 * The children provided **must** either be a rendering function or a fragment containing the function.
 *
 * Example:
 *
 * ```tsx
 * const $show = state(false);
 *
 * <Conditional condition={$show}>
 *   <p>Boo!</p>
 * </Conditional>
 * ```
 *
 * In this example, "Boo!" will only show when `$show.value` is `true`.
 */
export function Conditional({ condition, children }: Conditional.Props): VirtualItem {
  const render = resolveRender(children);

  if (!isSubscribable(condition)) return createVf([condition ? render() : null]);

  let last = condition.value;
  const memo = condition.value ? render() : null;

  return createVf(
    condition.value ? [memo] : [],
    dependent(condition, (value) => {
      if (value) {
        if (value === last) return memo;
        last = true;
        return render();
      } else {
        last = false;
        return null;
      }
    }),
  );
}
