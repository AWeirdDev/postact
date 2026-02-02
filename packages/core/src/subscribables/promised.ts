import { BaseSubscribable, type Subscribable } from "./base";

interface PromisedConfig {
  catch?: (err: any) => any;
  finally?: () => any;
}

/**
 * Create a subscribable from a promise.
 * @param promise The promise.
 * @param config Extra config, such as `catch` to catch errors and `finally` to perform tasks whether it succeeds/fails.
 */
export function promised<T>(promise: Promise<T>, config: PromisedConfig = {}): Subscribable<T> {
  const { catch: onErr, finally: onFin } = config;

  // safety: only when it's okay (non-undefined), the subscribable is dispatched
  const sub = new BaseSubscribable(undefined as T);

  promise
    .then((data) => {
      sub.value = data;
      sub.emit();
    })
    .catch((err) => onErr && onErr(err))
    .finally(() => onFin && onFin());

  return sub;
}
