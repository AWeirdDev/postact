export type UpdateDispatch<T> = (current: T) => T;
export type Updater<T> = UpdateDispatch<T> | T;

export function getUpdaterValue<T>(current: T, updater: Updater<T>): T {
  if (typeof updater === "function") {
    // @ts-ignore
    return updater(current);
  } else {
    return current;
  }
}

type Subscriber<T> = (value: T) => void;

export interface State<T> {
  /**
   * Value of the state.
   */
  readonly value: T;

  /**
   * Directly update the value without checking.
   * @param value Value to set.
   */
  directlyUpdate: (value: Updater<T>) => void;

  /**
   * Update the state.
   * @param upd An updater. Either a function that takes the current value and returns the new value to be set, or the new value.
   * @param options Additional options.
   */
  update: (upd: Updater<T>, options?: { silent?: boolean }) => void;

  /**
   * Checks whether to perform an update.
   * @param other The new value candidate.
   */
  shouldUpdate: (other: T) => boolean;

  /**
   * Subscribe to state changes.
   * @param subscriber The subscriber.
   */
  subscribe: (subscriber: Subscriber<T>) => void;

  /**
   * Notify all subscribers immediately of the current state value.
   */
  notify: () => void;
}

/**
 * Default state manager implementation.
 */
export class BaseStateManager<T> implements State<T> {
  #item: T;
  #subscribers: Subscriber<T>[];

  constructor(initial: T) {
    this.#item = initial;
    this.#subscribers = [];
  }

  get value(): T {
    return this.#item;
  }

  directlyUpdate(value: Updater<T>): void {
    this.#item = getUpdaterValue(this.#item, value);
  }

  update(upd: Updater<T>, _options?: { silent?: boolean }): void {
    const value = getUpdaterValue(this.#item, upd);
    if (this.shouldUpdate(value)) {
      this.#item = value;
    }
  }

  shouldUpdate(_other: T): boolean {
    return true;
  }

  subscribe(subscriber: (value: T) => void): void {
    this.#subscribers.push(subscriber);
  }

  notify(): void {
    const v = this.value; // value cache
    this.#subscribers.forEach((subscriber) => subscriber(v));
  }
}

// TODO: fix "initialized" for non-initialized entries
export class MaybeState<T> implements State<T | null> {
  #state: State<T>;
  #isNull: boolean;
  #initialized: boolean;
  #subscribers: Subscriber<T | null>[];

  constructor(stateManager: State<T>, isNull: boolean) {
    this.#state = stateManager;
    this.#isNull = isNull;
    this.#subscribers = [];
    this.#initialized = !isNull;
  }

  get value(): T | null {
    return this.#isNull ? null : this.#state.value;
  }

  update(upd: Updater<T | null>, options?: { silent?: boolean }): void {
    const value = getUpdaterValue(this.value, upd);

    if (this.#initialized && !this.shouldUpdate(value)) return;
    if (value !== null) {
      this.#state.directlyUpdate(value);
    }
    this.#isNull = upd === null;
  }

  directlyUpdate(upd: Updater<T | null>) {
    const value = getUpdaterValue(this.value, upd);
    this.#isNull = value === null;
    if (value) this.#state.directlyUpdate(value);
  }

  shouldUpdate(other: T | null): boolean {
    if (!this.#isNull && other !== null) return this.#state.shouldUpdate(other);
    return !(this.#isNull && other === null);
  }

  subscribe(subscriber: (value: T | null) => void): void {
    this.#subscribers.push(subscriber);
  }

  notify(): void {
    const v = this.value; // value cache
    this.#subscribers.forEach((subscriber) => subscriber(v));
  }
}
