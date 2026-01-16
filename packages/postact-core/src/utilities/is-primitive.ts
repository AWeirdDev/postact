export function isPrimitive(
  value: any,
): value is string | number | bigint | boolean {
  return ["string", "number", "bigint", "boolean"].includes(typeof value);
}
