import type { Subscribable, Subscriber } from "./subscribable";
import type { State } from "./state";

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
  /**
   * Creates a subscribable `DependentLater` object that runs an asynchronous `gen` whenever the `state` updates.
   * @param state The state to depend upon.
   * @param gen An asynchronous function taking a state, then returns a value.
   *
   * @example
   * ```ts
   * const $count = state<number>(0);
   * const $calculated = dependent.later<string>($count, async (count) => {
   *   return (count * 67).toString() // performs some computation
   * })
   *
   * if ($calculated.ok) {
   *   console.log($calculated.value);
   * }
   * ```
   */
  later: <R, T>(
    state: State<T>,
    gen: (value: T) => Promise<R>,
  ) => DependentLater<T, R>;
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

export class DependentLater<T, R> implements Subscribable<R> {
  public __postactItem: "dependent" = "dependent";

  #gen: (value: T) => Promise<R>;
  #value: R | null;
  #subscribers: Subscriber<R>[];
  #waiting: boolean;

  constructor(state: State<T>, gen: (value: T) => Promise<R>) {
    this.#value = null;
    this.#waiting = true;
    gen(state.value).then((value) => {
      this.#value = value;
      this.#waiting = false;
    });

    this.#gen = gen;
    this.#subscribers = [];

    state.subscribe((current) => {
      this.#value = null;
      this.#waiting = true;
      this.#gen(current).then((value) => {
        this.#value = value;
        this.#waiting = false;
        this.#subscribers.forEach((subscriber) => subscriber(value));
      });
    });
  }

  /**
   * Checks whether or not the promise has been fulfilled.
   * **Always check `ok` before using `.value`.**
   */
  get ok(): boolean {
    return !this.#waiting;
  }

  get value(): R {
    // @ts-ignore lol
    return this.#value;
  }

  subscribe(subscriber: Subscriber<R>): void {
    this.#subscribers.push(subscriber);
  }
}

_dependent.later = function <R, T>(
  state: State<T>,
  gen: (value: T) => Promise<R>,
): DependentLater<T, R> {
  return new DependentLater(state, gen);
};

export const dependent = _dependent as unknown as
  | DependentEntry
  | (<R, T>(state: State<T>, gen: (value: T) => R) => Dependent<T, R>);
