class Shell<T> {
  value: T;

  constructor(df: T) {
    this.value = df;
  }

  set(value: T) {
    this.value = value;
  }
}

/**
 * The maximum recursion depth. Defaults to 200.
 */
export const MAX_RECURSION_DEPTH: Shell<number> = new Shell(200);
