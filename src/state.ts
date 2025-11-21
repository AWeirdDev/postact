type UpdateDispatch<T> = (current: T) => T;
type StateUpdate<T> = UpdateDispatch<T> | T;

function resolveStateUpdate<T>(curr: T, update: StateUpdate<T>): T {
  // @ts-ignore
  return typeof update === "function" ? update(curr) : update;
}

type StateSubscriber<T> = (curr: T) => {};

class State<T> {
  #item: T;
  #listeners: (StateSubscriber<T> | null)[];

  constructor(initial: T) {
    this.#item = initial;
    this.#listeners = [];
  }

  /**
   * Subscribe to state changes.
   * @param subscriber The subscriber.
   * @returns The identifier of this subscriber. You can use `unsubscribe()` to unsubscribe.
   */
  subscribe(subscriber: StateSubscriber<T>): number {
    const identifier = this.#listeners.push(subscriber);
    return identifier;
  }

  /**
   * Unsubscribe.
   * @param identifier The identifier of the subscriber.
   */
  unsubscribe(identifier: number) {
    this.#listeners[identifier] = null;
  }

  /**
   * Update the state and eagerly trigger all subscribers.
   * @param upd Update dispatch or value.
   */
  update(upd: StateUpdate<T>) {
    this.#item = resolveStateUpdate(this.#item, upd);
    this.#listeners.forEach(
      (subscriber) => subscriber && subscriber(this.#item),
    );
  }

  get value() {
    return this.#item;
  }
}

const state = <T>(initial: T): State<T> => {
  return new State(initial);
};

class NumberState extends State<number> {
  constructor(n: number) {
    super(n);
  }

  override update(n: number) {
    if (n == super.value) return;
    super.update(n);
  }

  add(by: number = 1): void {
    if (by == 0) return;
    this.update(super.value + by);
  }

  sub(by: number = 1): void {
    if (by == 0) return;
    this.update(super.value - by);
  }

  mul(by: number): void {
    if (by == 1) return;
    this.update(super.value * by);
  }

  div(by: number): void {
    if (by == 1) return;
    this.update(super.value / by);
  }
}

state.number = (initial: number) => new NumberState(initial);

export { state };
