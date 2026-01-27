import { Primitive } from "./structure";

export function validatePrimitive(expected: Primitive, data: any): boolean {
  switch (expected) {
    case Primitive.BigInt64:
      return typeof data === "bigint";
    case Primitive.Boolean:
      return typeof data === "boolean";
    case Primitive.Float64:
      return typeof data === "number";
    case Primitive.Int32:
      return typeof data === "number" && Number.isInteger(data);
    case Primitive.Uint8:
      return typeof data === "number" && Number.isInteger(data);
    case Primitive.String:
      return typeof data === "string";
  }
}

export function validatePrimitiveOrThrow(expected: Primitive, data: any): any {
  if (!validatePrimitive(expected, data))
    throw new TypeError(
      `expected type ${Primitive[expected]}, got: ${typeof data}. contents: ${data}`,
    );
  return data;
}
