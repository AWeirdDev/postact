import { ChunksReader } from "./chunks";
import { MAX_RECURSION_DEPTH } from "./constants";
import {
  isMeta,
  MetaType,
  Primitive,
  type Complex,
  type FixedSizeString,
  type Optional,
  type Schema,
  type Vector,
} from "./schema";
import { validateMetaOrThrow, validateSchemaOrThrow } from "./schema/validate";

export function deserializeFrom(schema: Schema, chunks: ChunksReader, depth: number = 0): any {
  if (depth > MAX_RECURSION_DEPTH.value)
    throw new Error(`max recursion depth reached: ${MAX_RECURSION_DEPTH}`);

  if (isMeta(schema)) {
    switch (schema.t) {
      case MetaType.Complex:
        const m = new Map();
        (schema as Complex).d.forEach(([key, { s }]) => {
          const d = validateSchemaOrThrow(s, deserializeFrom(s, chunks, depth + 1));
          m.set(key, d);
        });
        return m;
      case MetaType.Enum:
        return validateMetaOrThrow(schema, chunks.getString());
      case MetaType.FixedSizeString:
        return validateMetaOrThrow(schema, chunks.getFixedString((schema as FixedSizeString).d));
      case MetaType.Optional:
        const presence = chunks.readU8();
        if (presence === 1)
          return validateMetaOrThrow(
            schema,
            deserializeFrom((schema as Optional).d, chunks, depth + 1),
          );
        else return null;
      case MetaType.Vector:
        const length = chunks.readU32();
        return Array.apply(null, Array(length)).map(() =>
          validateSchemaOrThrow(schema.d, deserializeFrom((schema as Vector).d, chunks, depth + 1)),
        );
    }
  } else {
    switch (schema as Primitive) {
      case Primitive.BigInt64:
        return chunks.readI64();
      case Primitive.Boolean:
        return Boolean(chunks.readU8());
      case Primitive.Float64:
        return chunks.readF64();
      case Primitive.Int32:
        return chunks.readI32();
      case Primitive.String:
        return chunks.getString();
    }
  }
}

export function deserialize(schema: Schema, buf: ArrayBuffer): any {
  const chunks = new ChunksReader(buf);
  return deserializeFrom(schema, chunks);
}
