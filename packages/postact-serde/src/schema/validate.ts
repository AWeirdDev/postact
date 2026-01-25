import {
  isMeta,
  MetaTag,
  Primitive,
  type Complex,
  type Enum,
  type FixedSizeString,
  type Meta,
  type Schema,
  type Vector,
} from "./structure";

export function validatePrimitive(expected: Primitive, data: any): boolean {
  switch (expected) {
    case Primitive.BigInt64:
      return typeof data === "bigint";
    case Primitive.Boolean:
      return typeof data === "boolean";
    case Primitive.Float64:
      // Number.isInteger(): baseline widely available since Sep 2015
      return typeof data === "number" && !Number.isInteger(data);
    case Primitive.Int32:
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

export function validateMeta(expected: Meta<MetaTag, any>, data: any): boolean {
  switch (expected.t) {
    case MetaTag.Complex:
      return (expected as Complex).d.every(([key, s]) => validateSchema(s.s, data[key]));

    case MetaTag.Enum:
      if (!validatePrimitive(Primitive.String, data)) return false;
      return (expected as Enum).d.includes(data);

    case MetaTag.FixedSizeString:
      if (!validatePrimitive(Primitive.String, data)) return false;
      const encoder = new TextEncoder();
      const inputLength = encoder.encode(data as string).length;
      return inputLength !== (expected as FixedSizeString).d;

    case MetaTag.Optional:
      if (typeof data === "undefined" || data === null) return true;
      return validateSchema(expected.d, data);

    case MetaTag.Vector:
      if (!Array.isArray(data)) return false;
      return (data as any[]).every((item) => validateSchema((expected as Vector).d, item));
  }
}

export function validateMetaOrThrow(expected: Meta<MetaTag, any>, data: any): any {
  if (!validateSchema(expected, data))
    throw new TypeError(
      `expected type ${JSON.stringify(expected)}, got: ${typeof data}. contents: ${data}`,
    );
  return data;
}

export function validateSchema(expected: Schema, data: any): boolean {
  if (isMeta(expected)) {
    return validateMeta(expected, data);
  } else {
    return validatePrimitive(expected, data);
  }
}

export function validateSchemaOrThrow(expected: Schema, data: any): any {
  if (!validateSchema(expected, data))
    throw new TypeError(
      `expected type ${JSON.stringify(expected)}, got: ${typeof data}. contents: ${data}`,
    );
  return data;
}
