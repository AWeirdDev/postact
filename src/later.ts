import { BaseStateManager } from "./state";

export class Later<T> extends BaseStateManager<T> {
  #promise: Promise<T>;
  #catch: ((reason: any) => void) | null;

  /**
   * Whether the promise has been fulfilled.
   */
  ok: boolean;

  constructor(promise: Promise<T>) {
    // @ts-ignore I am aware. let's just sacrifice typing lmfao
    super(null);

    this.#promise = promise;
    this.ok = false;
    this.#catch = () => {};

    this.#promise
      .then((value) => this.update(value))
      .catch((reason) => this.#catch && this.#catch(reason));
  }

  catch(onRejected: (reason: any) => void): Later<T> {
    this.#catch = onRejected;
    return this;
  }
}

/**
 * Creates a subscribable `Later` object for asynchronous execution.
 * @param fn The asynchronous function.
 *
 * @example
 * ```ts
 * const $result = later(async () => {
 *   return await doSomeHeavyWork();
 * });
 *
 * $result.ok
 * $result.value
 * $result.subscribe((value) => {
 *   console.log("finally got value", value);
 * })
 * ```
 */
export function later<T>(fn: () => Promise<T>): Later<T> {
  return new Later(fn());
}
