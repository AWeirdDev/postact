import { MetaType, Primitive, type ComplexField, type Schema } from "./structure";

interface OfType<T> {
  readonly _type: T;
}

export type SchemaOfType<T> = Schema & OfType<T>;
export type FieldOfType<T> = ComplexField & OfType<T>;

type Infer<T extends OfType<any>> = T["_type"];

/**
 * Represents the integer (`int32`) type.
 */
function int_(): SchemaOfType<number> {
  return Primitive.Int32 satisfies Schema as any;
}

/**
 * Represents the float (`float64`) type.
 */
function float_(): SchemaOfType<number> {
  return Primitive.Float64 satisfies Schema as any;
}

/**
 * Represents the bigint (`int64`) type.
 */
function bigint_(): SchemaOfType<bigint> {
  return Primitive.BigInt64 satisfies Schema as any;
}

/**
 * Represents the string type.
 */
function string_(): SchemaOfType<string> {
  return Primitive.String satisfies Schema as any;
}

/**
 * Represents the boolean type.
 */
function boolean_(): SchemaOfType<boolean> {
  return Primitive.Boolean satisfies Schema as any;
}

/**
 * Represents the array of `T` type.
 *
 * @param inner The inner element type.
 *
 * @example
 * ```ts
 * const Foods = t.array(t.string());
 * type Foods = t.infer<typeof Foods>;
 *
 * ["chocolate", "milk"] satisfies Foods
 * ```
 */
function array<T>(inner: SchemaOfType<T>): SchemaOfType<T[]> {
  return Object.freeze({
    t: MetaType.Vector,
    d: inner as Schema,
  }) satisfies Schema as any;
}

type IsOptional<T> = undefined extends T ? true : null extends T ? true : false;

// [ai-generated]
type SchemaFromFields<T extends Record<string, FieldOfType<any>>> =
  // required keys
  {
    [K in keyof T as IsOptional<Infer<T[K]>> extends true ? never : K]: Infer<T[K]>;
  } &
    // optional keys
    {
      [K in keyof T as IsOptional<Infer<T[K]>> extends true ? K : never]?: Exclude<
        Infer<T[K]>,
        undefined
      >;
    };
// [/ai-generated]

/**
 * Represents the object (`struct`) type.
 *
 * @param inner The fields of this object.
 *
 * @example
 * ```ts
 * const Food = t.object({
 *   name: t.field(0, t.string()),
 *   description: t.field(1, t.string()),
 *   rating: t.field(2, t.int())
 * });
 * type Food = t.infer<typeof Food>;
 *
 * {
 *   name: "Souffle",
 *   description: "Fricking good",
 *   rating: 10
 * } satisfies Food
 * ```
 */
function object<T extends Record<string, FieldOfType<any>>>(
  inner: T,
): SchemaOfType<SchemaFromFields<T>> {
  return Object.freeze({
    t: MetaType.Complex,
    d: Object.entries(inner)
      .map<[string, ComplexField]>(([k, v]) => [k, v as ComplexField])
      .sort(([_, { n: a }], [__, { n: b }]) => a - b),
  }) satisfies Schema as any;
}

/**
 * Creates a field for an object (`struct`).
 *
 * @param order The ordering number of the field. The smaller the ordering number is, the former the position of the field is.
 * @param inner The type of the field.
 *
 * @example
 * ```ts
 * const User = t.object({
 *   name: t.field(0, t.string()),
 *   age: t.field(1, t.int())
 * });
 * ````
 */
function field<T>(order: number, inner: SchemaOfType<T>): FieldOfType<T> {
  if (!Number.isInteger(order)) throw new TypeError("expected integer for field number");

  return Object.freeze({ n: order, s: inner }) as any;
}

/**
 * Represents an enum type.
 * @param inner A list of possible string values.
 */
function enum_<const T extends readonly string[]>(inner: T): SchemaOfType<T[number]> {
  return Object.freeze({
    t: MetaType.Enum,
    d: inner,
  }) satisfies Schema as any;
}

/**
 * Represents an optional type, marking `T` as `T | undefined | null`.
 * @param inner The type to mark as "optional."
 */
function optional<T>(inner: SchemaOfType<T>): SchemaOfType<T | undefined | null> {
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
