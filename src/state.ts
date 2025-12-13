export type UpdateDispatch<T> = (current: T) => T;
export type Updater<T> = UpdateDispatch<T> | T;

function getUpdaterValue<T>(current: T, upd: Updater<T>): T {
  // @ts-ignore
  return typeof upd === "function" ? upd(current) : current;
}

export type Subscriber<T> = (value: T) => any;
export type Checker<T> = (current: T, other: T) => boolean;

export interface State<T> {
  readonly __postactItem: `state`;

  /**
   * Current value of the state.
   * You may replace it using the `=` (assign) operator, as it's not read-only, yet
   * no subscribers will be notified nor are checks made, which is the same behavior `set()` does.
   */
  value: T;

  /**
   * Update the state value and notifies all subscribers of the change.
   * If checkers are set, the state will not update if any of them returns `false` (meaning the state does not need updating).
   * @param upd A function dispatch that takes the current state value as a parameter,
   * returning the new value to set, or just the new value.
   */
  readonly update: (upd: Updater<T>) => void;

  /**
   * Sets the state value without notifying any subscriber or doing any checks.
   * @param upd A function dispatch that takes the current state value as a parameter,
   * returning the new value to set, or just the new value.
   */
  readonly set: (upd: Updater<T>) => void;

  /**
   * Subscribe to state changes.
   * @param subscriber The subscriber, taking the current state value as the parameter.
   */
  readonly subscribe: (subscriber: Subscriber<T>) => void;

  /**
   * Notifies all subscribers of the current state value.
   */
  readonly emit: () => void;

  /**
   * Adds a checker. The checker is run whenever an `update()` is called, making sure
   * whether to actually update the state value.
   * @param checker The checker, taking the current value and the new value candidate as the parameters.
   * If `true` is returned, postact will continue running other checkers, and once all of them return true,
   * postact will update the state; if `false` is returned, postact won't run other checks and abort, leaving
   * the state as-is.
   */
  readonly withChecker: (checker: Checker<T>) => void;

  /**
   * Adds multiple checkers. See `withChecker`.
   * @param checkers An array of checker functions.
   */
  readonly withCheckers: (checkers: Checker<T>[]) => void;
}

export class BaseStateManager<T> implements State<T> {
  public value: T;
  public readonly __postactItem: "state" = "state";

  #subscribers: Subscriber<T>[];
  #checkers: Checker<T>[];

  constructor(initial: T) {
    this.value = initial;
    this.#subscribers = [];
    this.#checkers = [];
  }

  update(upd: Updater<T>): void {
    const value = getUpdaterValue(this.value, upd);
    for (const checker of this.#checkers) {
      if (!checker(this.value, value)) return;
    }

    this.value = value;
    this.emit();
  }

  set(upd: Updater<T>): void {
    this.value = getUpdaterValue(this.value, upd);
  }

  subscribe(subscriber: Subscriber<T>): void {
    this.#subscribers.push(subscriber);
  }

  emit(): void {
    const value = this.value; // value cache
    this.#subscribers.forEach((subscriber) => subscriber(value));
  }

  withChecker(checker: Checker<T>): void {
    this.#checkers.push(checker);
  }

  withCheckers(checkers: Checker<T>[]): void {
    this.#checkers.push(...checkers);
  }
}

export function state<T, Q = Exclude<T, Function>>(initial: Q): State<Q> {
  return new BaseStateManager(initial);
}

export function equalityChecker<T>(current: T, other: T): boolean {
  return current === other;
}
