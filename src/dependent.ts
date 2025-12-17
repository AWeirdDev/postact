import type { State, Subscribable, Subscriber } from "./state";

export class Dependent<T, R> implements Subscribable<R> {
  public __postactItem: "dependent" = "dependent";

  #gen: (value: T) => R;
  #value: R;
  #subscribers: Subscriber<R>[];

  constructor(state: State<T>, gen: (value: T) => R) {
    this.#value = gen(state.value);
    this.#gen = gen;
    this.#subscribers = [];

    state.subscribe((current) => {
      const generated = this.#gen(current);
      this.#value = generated;
      this.#subscribers.forEach((subscriber) => subscriber(generated));
    });
  }

  get value(): R {
    return this.#value;
  }

  subscribe(subscriber: Subscriber<R>): void {
    this.#subscribers.push(subscriber);
  }
}

interface DependentEntry {
  later: <R, T>(
    state: State<T>,
    gen: (value: T) => Promise<R>,
  ) => Dependent<T, R>;
}

/**
 * Creates a subscribable `Dependent` object that runs `gen` whenever the `state` updates.
 * @param state The state to depend upon.
 * @param gen A function taking a state, then returns a value.
 *
 * @example
 * ```ts
 * const $count = state<number>(0);
 * const $calculated = dependent<string>($count, (count) => {
 *   return (count * 67).toString() // performs some computation
 * })
 * ```
 */
function _dependent<R, T>(
  state: State<T>,
  gen: (value: T) => R,
): Dependent<T, R> {
  return new Dependent(state, gen);
}

_dependent.later = function <R, T>(
  state: State<T>,
  gen: (value: T) => Promise<R>,
): Dependent<T, R> {
  // later ill write this lmfao
};

export const dependent = _dependent as unknown as
  | DependentEntry
  | (<R, T>(state: State<T>) => Dependent<T, R>);
