import { PostactIdentifier } from "./_internals";
import type { VirtualItem } from "./vdom/structure";

export type PropsWithChildren<K = {}> = { children: VirtualItem } & K;
type ComponentInnerFn<K = {}> = (props: PropsWithChildren<K>) => VirtualItem;

interface ComponentInstance {
  __p: PostactIdentifier.ComponentInstance;
  result: VirtualItem;
}

interface ComponentInner {
  __p: PostactIdentifier.ComponentPointer;
  ptr: Function;
}

export type Component<K> = ((
  props: PropsWithChildren<K>,
) => ComponentInstance) &
  ComponentInner;

export function component<K>(fn: ComponentInnerFn<K>): Readonly<Component<K>> {
  return Object.freeze(
    Object.assign(
      (props: PropsWithChildren<K>) => {
        return {
          // yes. this is needed.
          __p: PostactIdentifier.ComponentInstance as PostactIdentifier.ComponentInstance,
          result: fn(props),
        };
      },
      {
        // yup...
        __p: PostactIdentifier.ComponentPointer as PostactIdentifier.ComponentPointer,
        ptr: fn,
      },
    ),
  );
}
