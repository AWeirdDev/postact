import { MetaType, Primitive, type ComplexField, type Schema, type Vector } from "./structure";

interface OfType<T> {
  readonly _type: T;
}

type SchemaOfType<T> = Schema & OfType<T>;

type Infer<T extends OfType<any>> = T["_type"];

function int_(): SchemaOfType<number> {
  return Primitive.Int32 satisfies Schema as any;
}

function float_(): SchemaOfType<number> {
  return Primitive.Float64 satisfies Schema as any;
}

function bigint_(): SchemaOfType<bigint> {
  return Primitive.BigInt64 satisfies Schema as any;
}

function string_(): SchemaOfType<string> {
  return Primitive.String satisfies Schema as any;
}

function boolean_(): SchemaOfType<boolean> {
  return Primitive.Boolean satisfies Schema as any;
}

function array<T>(inner: SchemaOfType<T>): SchemaOfType<T[]> {
  return Object.freeze({
    t: MetaType.Vector,
    d: inner as Schema,
  }) satisfies Schema as any;
}

type FieldOfType<T> = ComplexField & OfType<T>;
function object<T extends Record<string, FieldOfType<any>>>(
  inner: T,
): SchemaOfType<{ [K in keyof T]: Infer<T[K]> }> {
  return Object.freeze({
    t: MetaType.Complex,
    d: Object.entries(inner)
      .map<[string, ComplexField]>(([k, v]) => [k, v as ComplexField])
      .sort(([_, { n: a }], [__, { n: b }]) => a - b),
  }) satisfies Schema as any;
}

function field<T>(n: number, inner: SchemaOfType<T>): FieldOfType<T> {
  if (!Number.isInteger(n)) throw new TypeError("expected integer for field number");

  return Object.freeze({ n, s: inner }) as any;
}

function enum_<const T extends readonly string[]>(inner: T): SchemaOfType<T[number]> {
  return Object.freeze({
    t: MetaType.Enum,
    d: inner,
  }) satisfies Schema as any;
}

function optional<T>(inner: SchemaOfType<T>): SchemaOfType<T | null> {
  return Object.freeze({
    t: MetaType.Optional,
    d: inner,
  }) satisfies Schema as any;
}

export {
  object,
  field,
  array,
  optional,
  int_ as "int",
  float_ as "float",
  bigint_ as "bigint",
  string_ as "string",
  boolean_ as "boolean",
  enum_ as "enum",
};
export type { Infer as "infer" };
