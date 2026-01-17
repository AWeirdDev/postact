import { isPostactIdent, PostactIdentifier } from "./_internals";
import type { VirtualItem } from "./vdom/structure";

export type PropsWithChildren<K = {}> = { children?: VirtualItem } & K;
type ComponentInnerFn<K = {}> = (props: PropsWithChildren<K>) => VirtualItem;

export interface ComponentInstance<K = {}> {
  __p: PostactIdentifier.ComponentInstance;
  props: K;
  ptr: ComponentInnerFn<K>;
}

interface ComponentInner<K = {}> {
  __p: PostactIdentifier.ComponentPointer;
  ptr: ComponentInnerFn<K>;
}

export type Component<K> = ((props: PropsWithChildren<K>) => ComponentInstance<K>) &
  Readonly<ComponentInner<K>>;

export function component<K>(fn: ComponentInnerFn<K>): Component<K> {
  return Object.freeze(
    Object.assign(
      (props: PropsWithChildren<K>) => {
        return {
          // yes. this is needed.
          __p: PostactIdentifier.ComponentInstance as PostactIdentifier.ComponentInstance,
          props,
          ptr: fn,
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

export function isComponentPtr(item: any): item is Component<any> {
  return isPostactIdent(PostactIdentifier.ComponentPointer, item);
}

export function isComponentInstance(item: any): item is ComponentInstance<any> {
  return isPostactIdent(PostactIdentifier.ComponentInstance, item);
}
