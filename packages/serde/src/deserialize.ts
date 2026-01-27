import { ChunksReader } from "./chunks";
import {
  isMeta,
  MetaTag,
  Primitive,
  type Complex,
  type Enum,
  type FixedSizeString,
  type Optional,
  type Schema,
  type Vector,
} from "./schema";
import type { Tuple } from "./schema/structure";
import type { SchemaOfType } from "./schema/typing";

// this function is **recursive!**
// since the `schema` is defined by the developer, we do not need to
// do much on refraining the program from exceeding max recursion,
// as developers are smart.

export function deserializeFrom(chunks: ChunksReader, schema: Schema): any {
  if (isMeta(schema)) {
    switch (schema.t) {
      case MetaTag.Complex:
        // safety: schema is defined by the dev
        const complex: Record<string, any> = {};
        for (const [k, s] of (schema as Complex).d) {
          complex[k] = deserializeFrom(chunks, s.s);
        }
        return complex;

      case MetaTag.Enum:
        const estr = chunks.getString();
        if (!(schema as Enum).d.includes(estr))
          throw new TypeError(`expected enum value, one of: ${schema.d.join(", ")}`);
        return estr;

      case MetaTag.FixedSizeString:
        return chunks.getFixedString((schema as FixedSizeString).d);

      case MetaTag.Optional:
        const hasData = chunks.readU8();
        if (!hasData) return null;
        return deserializeFrom(chunks, (schema as Optional).d);

      case MetaTag.Vector:
        const arr = [];
        const arrLength = chunks.readU32();
        for (let i = 0; i < arrLength; i++) {
          arr.push(deserializeFrom(chunks, (schema as Vector).d));
        }
        return arr;

      case MetaTag.Tuple:
        const tpl = [];
        const tplLength = (schema as Tuple).d.length;
        for (let i = 0; i < tplLength; i++) {
          tpl.push(deserializeFrom(chunks, (schema as Tuple).d[i]!));
        }
        return tpl;
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
      case Primitive.Uint8:
        return chunks.readU8();
      case Primitive.String:
        return chunks.getString();
    }
  }
}

/**
 * Deserialize an encoded buffer created with `serialize()`.
 * @param schema The schema definition.
 * @param buf The buffer.
 *
 * @example
 * ```ts
 * const Coffee = t.object({
 *   name: t.field(t.string()).order(0),
 *   rating: t.field(t.int()).order(1),
 * });
 * type Coffee = t.infer<typeof Coffee>;
 *
 * const espresso = { name: "Espresso", rating: 10 } satisfies Coffee;
 * const bytes = serialize(Coffee, espresso);
 *
 * console.log(deserialize(bytes));
 * // Output: { name: "Espresso", rating: 10 }
 * ```
 */
export function deserialize<T>(schema: SchemaOfType<T>, buf: ArrayBuffer): T {
  const chunks = new ChunksReader(buf);
  return deserializeFrom(chunks, schema);
}
