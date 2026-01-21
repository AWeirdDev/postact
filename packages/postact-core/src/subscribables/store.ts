import { state, type State } from "./state"

export function store<T extends object>(initial: T) {
  const $data = state(initial);
  const observers = new Map();

  return new Proxy(initial, {
    get() {
      return Reflect.get
    }
  })
}
