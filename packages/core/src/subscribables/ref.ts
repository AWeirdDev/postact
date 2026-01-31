import { isPostactIdent, PostactIdentifier } from "../_internals";
import { BaseSubscribable } from "./base";

class RefSubscribable<T> extends BaseSubscribable<T | null> {
  constructor(initial: T | null) {
    super(initial);
  }

  /**
   * Kill this reference, meaning the item has died.
   */
  kill(): void {
    this.value = null;
    this.emit();
    this.unsubscribeAll();
  }
}

/**
 * Represents an element reference.
 */
export type Ref<T extends HTMLElement> = RefSubscribable<T> & {
  __p: PostactIdentifier.Ref;
};

/**
 * Create a new reference.
 * Reference values (`.value`) remain `null` until rendered.
 * When the referenced item is killed (removed from the DOM),
 * you also get a notification, and `.value` will be `null`.
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
  return Object.assign(new RefSubscribable<T | null>(null), {
    __p: PostactIdentifier.Ref as const,
  });
}

export function isRef(item: any): item is Ref<any> {
  return isPostactIdent(PostactIdentifier.Ref, item);
}
