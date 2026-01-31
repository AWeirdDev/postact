import { isSubscribable, type Subscribable } from "../subscribables/base";
import { dependent } from "../subscribables/dependent";
import { createVf, isFr, isVf, type VirtualItem } from "../vdom/structure";

export namespace Show {
  export type MaybeFalsy<T> = T | null | undefined;
  export type Children<T> = ((value: T) => VirtualItem) | VirtualItem;

  export interface Props<T> {
    when: MaybeFalsy<T> | Subscribable<MaybeFalsy<T>>;
    children: Children<T>;
    fallback?: VirtualItem | null;
  }
}

function resolveRender<T>(item: Show.Children<T>): (value: T) => VirtualItem {
  if (isVf(item)) {
    const first = item.children[0];
    if (!isFr(first)) throw new TypeError("expected function as children for <Show>");
    return first.render;
  }

  if (typeof item === "function") {
    return item;
  }

  throw new TypeError(
    "expected either a function or a fragment containing one function in children for <Show>",
  );
}

export function Show<T>({ when, children, fallback }: Show.Props<T>): VirtualItem {
  const render = resolveRender(children);

  if (!isSubscribable(when)) {
    return createVf([when ? render(when) : (fallback ?? null)]);
  }

  return createVf(
    [when.value ? render(when.value) : (fallback ?? null)],
    dependent(when, (value) => createVf([value ? render(value) : (fallback ?? null)])),
  );
}
