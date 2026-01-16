import { isPostactIdent, PostactIdentifier } from "./_internals";
import { type Subscribable, type Subscriber } from "./subscribable";

class RefSubscribable<T> implements Subscribable<T | null> {
  __p: PostactIdentifier.Ref = PostactIdentifier.Ref;
  value: T | null;
  #subscribers: Map<Subscriber<T>, Subscriber<T>>;

  constructor() {
    this.value = null;
    this.#subscribers = new Map();
  }

  subscribe(subscriber: Subscriber<T>): void {
    this.#subscribers.set(subscriber, subscriber);
  }

  unsubscribe(pointer: Subscriber<T>): void {
    this.#subscribers.delete(pointer);
  }

  emit() {
    const value = this.value; // cache
    if (value === null) throw new Error("ref is currently null");
    this.#subscribers.forEach((sub) => sub(value));
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
  return new RefSubscribable<T>();
}

export function isRef(item: any): item is Ref<any> {
  return isPostactIdent(PostactIdentifier.Ref, item);
}
