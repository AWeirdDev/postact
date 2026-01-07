import { isPostactIdent, PostactIdentifier } from "./_internals";
import { BaseSubscribable, type Subscribable } from "./subscribable";

/**
 * Represents an element reference.
 */
export type Ref<T extends HTMLElement> = Subscribable<T | null> & {
  __p: PostactIdentifier.Ref;
};

/**
 * Create a new reference.
 * Reference values (`.value`) remain `null` until rendered.
 *
 * @example
 * ```ts
 * const $div = ref();
 * $div.subscribe((div) => {
 *   console.log("rendered:", div.textContent);
 * });
 *
 * html`<div ref=${$div}>Hello</div>`
 * ```
 */
export function ref<T extends HTMLElement>(): Ref<T> {
  return Object.assign(new BaseSubscribable(null), {
    __p: PostactIdentifier.Ref as PostactIdentifier.Ref,
  });
}

export function isRef(item: any): item is Ref<any> {
  return isPostactIdent(PostactIdentifier.Ref, item);
}
