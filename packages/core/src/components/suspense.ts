import { isPostactEcosystem } from "../_internals";
import { transformArgToVirtualItem } from "../argument";
import { promised } from "../subscribables/promised";
import { state, type State } from "../subscribables/state";
import { createVf, isPromise, isVf, type AnyChildren, type VirtualItem } from "../vdom/structure";

export namespace Suspense {
  export interface Props {
    children: AnyChildren;
    fallback?: VirtualItem;
  }
}

function _suspense(deps: State<number>, children: AnyChildren): VirtualItem {
  if (isVf(children)) {
    children.children = children.children.map((item) => {
      if (isPromise(item)) {
        deps.update((v) => v + 1);
        const sub = promised(item);
        sub.subscribe(() => deps.update((v) => v - 1));
        return createVf([], sub);
      }
      return item;
    });
    return children;
  }

  if (typeof children === "function") {
    return children;
  }

  if (isPromise(children)) {
    deps.update((v) => v + 1);
    const sub = promised(children);
    sub.subscribe(() => deps.update((v) => v - 1));
    return createVf([], sub);
  }

  if (isPostactEcosystem(children)) {
    return children;
  }

  if (Array.isArray(children)) {
    return createVf(children.map((item) => _suspense(deps, item)));
  }

  return transformArgToVirtualItem(children);
}

export function Suspense({ children, fallback }: Suspense.Props): VirtualItem {
  const $deps = state<number>(0);
  const sus = _suspense($deps, children);

  const $render = state<VirtualItem>(fallback ?? null);

  $deps.subscribe((deps) => {
    if (!deps) {
      $render.update(sus);
    }
  });

  return createVf([$render.value], $render);
}
