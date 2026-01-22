import { isPostactIdent, PostactIdentifier } from "../_internals";

export type Subscriber<T> = (value: T) => any;

export interface Subscribable<T> {
  /**
   * Current state value.
   * You may replace it using the `=` (assign) operator, as it's not read-only, yet
   * no subscribers will be notified nor will checks be made, which is the same behavior `State.set()` does.
   */
  value: T;

  /**
   * Subscribe to state value changes.
   * @param subscriber The subscriber, taking the current state value as the parameter.
   *
   * @example
   * ```ts
   * const $count = state(0);
   *
   * $count.subscribe((count) => {
   *   console.log("count is now", count);
   * });
   * ```
   */
  readonly subscribe: (subscriber: Subscriber<T>) => void;

  /**
   * Unsubscribe from state value changes.
   * @param pointer The function.
   * @example
   * ```ts
   * const $count = state(0);
   *
   * $count.subscribe(function foo() {
   *   console.log("count is now", count);
   * });
   *
   * $count.unsubscribe(foo);
   * ```
   */
  readonly unsubscribe: (pointer: Subscriber<T>) => void;
}

export class BaseSubscribable<T> implements Subscribable<T> {
  value: T;
  #subscribers: Map<Subscriber<T>, Subscriber<T>>;

  constructor(initial: T) {
    this.value = initial;
    this.#subscribers = new Map();
  }

  subscribe(subscriber: Subscriber<T>): void {
    this.#subscribers.set(subscriber, subscriber);
  }

  unsubscribe(pointer: Subscriber<T>): void {
    this.#subscribers.delete(pointer);
  }

  /**
   * Notify all subscribables of the current state value.
   */
  emit() {
    const value = this.value; // cache
    this.#subscribers.forEach((sub) => sub(value));
  }
}

/**
 * Check if `item` is a subscribable.
 * @param item The item to check.
 * @returns
 */
export function isSubscribable(item: any): item is Subscribable<any> {
  return (
    isPostactIdent(PostactIdentifier.Dependent, item) ||
    isPostactIdent(PostactIdentifier.State, item) ||
    isPostactIdent(PostactIdentifier.Ref, item)
  );
}
