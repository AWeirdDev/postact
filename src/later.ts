import { BaseStateManager } from "./state";

export class Later<T> extends BaseStateManager<T | null> {
  #promise: Promise<T>;
  #catch: ((reason: any) => void) | null;

  /**
   * Whether the promise has been fulfilled.
   */
  ok: boolean;

  constructor(promise: Promise<T>) {
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

export function later<T>(fn: () => Promise<T>): Later<T> {
  return new Later(fn());
}
