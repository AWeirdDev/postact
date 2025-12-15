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

export function dependent<T, R>(
  state: State<T>,
  gen: (value: T) => R,
): Dependent<T, R> {
  return new Dependent(state, gen);
}
