import { BaseSubscribable, type Subscriber } from "./base";
import { getUpdaterValue, state, type Updater } from "./state";

type StoreInner<T extends Record<string, any>> = {
  [K in keyof T as T[K] extends Record<string, any>
    ? never
    : `$${K & string}`]: StoreValueSubscribable<T[K]>;
} & {
  [K in keyof T]: T[K] extends Record<string, any> ? StoreInner<T[K]> : T[K];
};

type Store<T extends Record<string, any>> = StoreInner<T> & {
  update: (upd: Updater<T>) => void;
  subscribe: (sub: Subscriber<T>) => void;
  unsubscribe: (pointer: Subscriber<T>) => void;
};

class StoreValueSubscribable<T> extends BaseSubscribable<T> {
  #ticker: Subscriber<T>;

  constructor(initial: T, ticker: Subscriber<T>) {
    super(initial);
    this.#ticker = ticker;
  }

  /**
   * Updates partial part of the store. Subscribers to the
   * store and to this partial part will be notified.
   * @param upd The updater.
   */
  update(upd: Updater<T>) {
    this.value = getUpdaterValue(this.value, upd);
    this.#ticker(this.value);
    this.emit();
  }
}

export function store<T extends Record<string, any>>(initial: T): Store<T> {
  const $storeInner = state(initial);
  const userSubscribers: Map<Subscriber<T>, Subscriber<T>> = new Map();

  const partials: Map<string, any> = new Map();

  return new Proxy(
    // note: Object.assign() will mutate `initial`
    // but don't tell the user about this! ok maybe they're reading this
    Object.assign(initial, {
      update(upd: Updater<T>) {
        $storeInner.update(upd);
        userSubscribers.values().forEach((sub) => sub($storeInner.value));
      },
      subscribe(sub: Subscriber<T>) {
        userSubscribers.set(sub, sub);
      },
      unsubscribe(pointer: Subscriber<T>) {
        userSubscribers.delete(pointer);
      },
    }),
    {
      get(current, key) {
        if (typeof key === "symbol") return Reflect.get(current, key);

        if (Reflect.has(current, key) && typeof Reflect.get(current, key) === "object") {
          if (partials.has(key)) return partials.get(key);
          const nextStore = store(Reflect.get(current, key));
          nextStore.subscribe((value) => {
            ($storeInner.value as Record<string, any>)[key] = value;
            userSubscribers.values().forEach((sub) => sub($storeInner.value));
          });
          partials.set(key, nextStore);
          return nextStore;
        }

        if (key.startsWith("$") && Reflect.has(current, key.slice(1))) {
          const normKey = key.slice(1);
          if (partials.has(normKey)) return partials.get(normKey);

          const $partialState = new StoreValueSubscribable(
            Reflect.get(current, normKey),
            (value) => {
              // this function gets called when partial part of the store
              // is called to update (from the user interface).

              ($storeInner.value as Record<string, any>)[normKey] = value;
              userSubscribers.values().forEach((sub) => sub($storeInner.value));
            },
          );

          $storeInner.subscribe((data) => {
            $partialState.update(data[normKey]);
          });

          partials.set(normKey, $partialState);
          return $partialState;
        }

        return Reflect.get(current, key);
      },
    },
  );
}
