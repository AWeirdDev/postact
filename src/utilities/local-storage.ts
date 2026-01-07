import { ensureWindow } from "./ensure-window";

export class LocalStorageInterface {
  public key: string;

  constructor(key: string) {
    this.key = key;
  }

  set(value: string) {
    window.localStorage.setItem(this.key, value);
  }

  get(): string {
    return window.localStorage.getItem(this.key) ?? "";
  }

  remove() {
    window.localStorage.removeItem(this.key);
  }
}

/**
 * Create a local storage interface for the specified key.
 *
 * @param key The key.
 *
 * @example
 * ```ts
 * const session = localStorage("session");
 *
 * session.set("w4Lt3rWh!t3");
 * console.log(session.get()); // Console: w4Lt3rWh!t3
 * ```
 */
export function localStorage(key: string): LocalStorageInterface {
  ensureWindow();
  return new LocalStorageInterface(key);
}
