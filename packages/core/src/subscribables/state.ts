import { isPostactIdent, PostactIdentifier } from "../_internals";
import type { Subscribable, Subscriber } from "./base";

export type UpdateDispatch<T> = (current: T) => T;
export type Updater<T> = UpdateDispatch<T> | T;

export function getUpdaterValue<T>(current: T, upd: Updater<T>): T {
  // @ts-ignore
  return typeof upd === "function" ? upd(current) : upd;
}

export type Checker<T> = (current: T, other: T) => boolean;

export interface State<T> extends Subscribable<T> {
  readonly __p: PostactIdentifier.State;

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
  readonly withChecker: (checker: Checker<T>) => State<T>;

  /**
   * Adds multiple checkers. See `withChecker`.
   * @param checkers An array of checker functions.
   */
  readonly withCheckers: (checkers: Checker<T>[]) => State<T>;
}

export class BaseStateManager<T> implements State<T> {
  public value: T;
  public readonly __p = PostactIdentifier.State;

  #subscribers: Map<Subscriber<T>, Subscriber<T>>;
  #checkers: Checker<T>[];

  constructor(initial: T) {
    this.value = initial;
    this.#subscribers = new Map();
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
    this.#subscribers.set(subscriber, subscriber);
  }

  unsubscribe(pointer: Subscriber<T>): void {
    this.#subscribers.delete(pointer);
  }

  unsubscribeAll(): void {
    this.#subscribers.clear();
  }

  emit(): void {
    const value = this.value; // value cache
    this.#subscribers.forEach((_, subscriber) => subscriber(value));
  }

  withChecker(checker: Checker<T>): State<T> {
    this.#checkers.push(checker);
    return this;
  }

  withCheckers(checkers: Checker<T>[]): State<T> {
    this.#checkers.push(...checkers);
    return this;
  }
}

/**
 * Create a new state, managed by postact.
 * @param initial The initial value. Required.
 *
 * @example
 * ```ts
 * const $count = state<number>(0);
 * $count.update(v => v + 1);
 * ```
 */
export function state<T, Q = Exclude<T, Function>>(initial: Q): State<Q> {
  return new BaseStateManager(initial);
}

export function isState(item: any): item is State<any> {
  return isPostactIdent(PostactIdentifier.State, item);
}
