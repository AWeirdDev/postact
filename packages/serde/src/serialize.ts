import { ChunksWriter } from "./chunks";
import {
  isMeta,
  MetaTag,
  Primitive,
  validatePrimitiveOrThrow,
  type Complex,
  type Enum,
  type FixedSizeString,
  type Optional,
  type Schema,
  type Vector,
} from "./schema";
import type { Tuple } from "./schema/structure";

export function serializeInto(chunks: ChunksWriter, schema: Schema, data: any) {
  if (isMeta(schema)) {
    switch (schema.t) {
      case MetaTag.Complex:
        for (const [k, s] of (schema as Complex).d) {
          serializeInto(chunks, s.s, data[k]);
        }
        break;

      case MetaTag.Enum:
        validatePrimitiveOrThrow(Primitive.String, data);
        if (!(schema as Enum).d.includes(data))
          throw new TypeError(`key "${data}" does not exist for enum ${JSON.stringify(schema.d)}`);
        chunks.placeString(data as string);
        break;

      case MetaTag.FixedSizeString:
        validatePrimitiveOrThrow(Primitive.String, data);
        const encoder = new TextEncoder();
        const inputLength = encoder.encode(data as string).length;
        if (inputLength !== (schema as FixedSizeString).d)
          throw new TypeError(
            `expected a fixed size (utf-8 encoded) string of length ${schema.d}, got length ${inputLength}`,
          );
        chunks.placeFixedString(data as string);
        break;

      case MetaTag.Optional:
        if (typeof data !== "undefined" && data !== null) {
          chunks.putU8(1);
          // validations will be done later. if there are errors, it gets stopped
          serializeInto(chunks, (schema as Optional).d, data);
        } else {
          chunks.putU8(0);
        }
        break;

      case MetaTag.Vector:
        if (!Array.isArray(data))
          throw new TypeError(`expected an array, got type ${typeof data}, contents: ${data}`);
        chunks.putU32(data.length);
        (data as any[]).forEach((item) => {
          serializeInto(chunks, (schema as Vector).d, item);
        });
        break;

      case MetaTag.Tuple:
        if (!Array.isArray(data))
          throw new TypeError(
            `expected an array (tuple), got type ${typeof data}, contents: ${data}`,
          );
        (data as any[]).forEach((item, idx) => {
          serializeInto(chunks, (schema as Tuple).d[idx]!, item);
        });
        break;
    }
  } else {
    validatePrimitiveOrThrow(schema, data);
    switch (schema as Primitive) {
      case Primitive.BigInt64:
        chunks.putI64(data);
        break;
      case Primitive.Boolean:
        chunks.putU8(+data);
        break;
      case Primitive.Float64:
        chunks.putF64(data);
        break;
      case Primitive.Int32:
        chunks.putI32(data);
        break;
      case Primitive.String:
        chunks.placeString(data);
        break;
    }
  }
}

/**
 * Serialize data into bytes while checking types.
 *
 * @param schema The defined schema.
 * @param data The data.
 */
export function serialize(schema: Schema, data: any): ArrayBuffer {
  const chunks = new ChunksWriter();
  serializeInto(chunks, schema, data);

  return chunks.finish();
}
