import type { Subscribable, Subscriber } from "./base";

import { isPostactIdent, PostactIdentifier } from "../_internals";

type WrapTupleWithSubscribables<T extends readonly unknown[]> = {
  [K in keyof T]: Subscribable<T[K]>;
};

export class Dependent<const T extends readonly unknown[], R> implements Subscribable<R> {
  public __p: PostactIdentifier.Dependent = PostactIdentifier.Dependent;

  #gen: (values: T) => R;
  #value: R;
  #subscribers: Map<Subscriber<R>, Subscriber<R>>;

  constructor(arg0: WrapTupleWithSubscribables<T> | any, gen: (value: T) => R, set?: R) {
    this.#value =
      set || gen(Array.isArray(arg0) ? (arg0.map((itm) => itm.value) as any) : arg0.value);
    this.#gen = gen;
    this.#subscribers = new Map();

    if (Array.isArray(arg0))
      arg0.forEach((subscribable) => {
        subscribable.subscribe(() => {
          const generated = this.#gen(arg0.map((itm) => itm.value) as any);
          this.#value = generated;
          this.#subscribers.forEach((_, subscriber) => subscriber(generated));
        });
      });
    else
      arg0.subscribe(() => {
        const generated = this.#gen(arg0.value);
        this.#value = generated;
        this.#subscribers.forEach((_, subscriber) => subscriber(generated));
      });
  }

  get value(): R {
    return this.#value;
  }

  subscribe(subscriber: Subscriber<R>): void {
    this.#subscribers.set(subscriber, subscriber);
  }

  unsubscribe(pointer: Subscriber<R>): void {
    this.#subscribers.delete(pointer);
  }
}

/**
 * Creates a {@link Subscribable} that reruns `fn` whenever `subscribable` updates.
 * @param subscribable One subscribable.
 * @param fn The function, taking the current subscribable value as the argument.
 * @param set Sets the default value.
 */
export function dependent<R, K>(
  subscribable: Subscribable<K>,
  fn: (args: K) => R,
  set?: R,
): Dependent<[K], R>;

/**
 * Creates a {@link Subscribable} that reruns `fn` whenever any of `subscribables` updates.
 * @param subscribables Multiple subscribables.
 * @param fn The function, taking all the current subscribable values in an array as the argument.
 * @param set Sets the default value.
 */
export function dependent<R, T extends readonly unknown[]>(
  subscribables: WrapTupleWithSubscribables<T>,
  fn: (args: T) => R,
  set?: R,
): Dependent<T, R>;

/**
 * Dependents.
 */
export function dependent(arg0: any, fn: any, set?: any) {
  return new Dependent(arg0, fn, set);
}

export function isDependent(item: any): item is Dependent<any, any> {
  return isPostactIdent(PostactIdentifier.Dependent, item);
}
