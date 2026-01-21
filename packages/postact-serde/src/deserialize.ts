import { ChunksReader } from "./chunks";
import {
  isMeta,
  MetaType,
  Primitive,
  type Complex,
  type Enum,
  type FixedSizeString,
  type Optional,
  type Schema,
  type Vector,
} from "./schema";
import type { SchemaOfType } from "./schema/typing";

export function deserializeFrom(chunks: ChunksReader, schema: Schema): any {
  if (isMeta(schema)) {
    switch (schema.t) {
      case MetaType.Complex:
        // safety: schema is defined by the user
        const complex: Record<string, any> = {};
        for (const [k, s] of (schema as Complex).d) {
          complex[k] = deserializeFrom(chunks, s.s);
        }
        return complex;

      case MetaType.Enum:
        const estr = chunks.getString();
        if (!(schema as Enum).d.includes(estr))
          throw new TypeError(`expected enum value, one of: ${schema.d.join(", ")}`);
        return estr;

      case MetaType.FixedSizeString:
        return chunks.getFixedString((schema as FixedSizeString).d);

      case MetaType.Optional:
        const hasData = chunks.readU8();
        if (!hasData) return null;
        return deserializeFrom(chunks, (schema as Optional).d);

      case MetaType.Vector:
        const arr = [];
        const length = chunks.readU32();
        for (let i = 0; i < length; i++) {
          arr.push(deserializeFrom(chunks, (schema as Vector).d));
        }
        return arr;
    }
  } else {
    switch (schema) {
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

export function deserialize<T>(schema: SchemaOfType<T>, buf: ArrayBuffer): T {
  const chunks = new ChunksReader(buf);
  return deserializeFrom(chunks, schema);
}
