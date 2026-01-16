class ContextError extends Error {
  constructor(reason: string) {
    super(reason);
  }
}

/**
 * Ensure that `window` exists in this context.
 *
 * @throws {ContextError} If `window` is undefined.
 */
export function ensureWindow(): void {
  if (typeof window === "undefined")
    throw new ContextError(
      "expected the runtime context to be in the browser (window is undefined)",
    );
}
