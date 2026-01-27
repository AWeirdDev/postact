import { MetaTag, Primitive, type ComplexField, type Schema } from "./structure";

declare const __type_ident: unique symbol;

interface OfType<T> {
  readonly [__type_ident]: T;
}

export type SchemaOfType<T> = Schema & OfType<T>;
export type FieldOfType<T> = ComplexField & OfType<T>;

/**
 * Infer the type of a schema, turning value -> typescript type.
 */
type Infer<T extends OfType<any>> = T[typeof __type_ident];

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
    t: MetaTag.Vector,
    d: inner as Schema,
  } satisfies Schema) as any;
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
 *   name: t.field(t.string()).order(0),
 *   description: t.field(t.string()).order(1),
 *   rating: t.field(t.int()).order(2),
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
function object_<T extends Record<string, FieldOfType<any>>>(
  inner: T,
): SchemaOfType<SchemaFromFields<T>> {
  return Object.freeze({
    t: MetaTag.Complex,
    d: Object.entries(inner)
      .map<[string, ComplexField]>(([k, v]) => [k, v as ComplexField])
      .sort(([_, { n: a }], [__, { n: b }]) => a - b),
  } satisfies Schema) as any;
}

type FieldBuilder<T> = {
  /**
   * Set the order of the field. Serde will serialize fields
   * from the lowest ordering to the highest (in ascending order).
   * This keeps data persistent across platforms when serializing/deserializing.
   * If you only need typing capabilities, then this is not needed at all.
   *
   * @param ord The ordering.
   * @example
   * ```ts
   * const Cake = t.object({
   *   name: t.field(t.string()).order(0),
   *   sweetness: t.field(t.int()).order(1),
   * })
   * ```
   */
  order: (ord: number) => Readonly<FieldOfType<T>>;
};

/**
 * Creates a field for an object (`struct`).
 *
 * @param order The ordering number of the field. The smaller the ordering number is, the former the position of the field is.
 * @param inner The type of the field.
 *
 * @example
 * ```ts
 * const User = t.object({
 *   name: t.field(t.string()).order(0),
 *   age: t.field(t.int()).order(1),
 * });
 * ````
 */
function field<T>(inner: SchemaOfType<T>): FieldOfType<T> & FieldBuilder<T> {
  return {
    n: 0,
    s: inner,
    order(ord: number): FieldOfType<T> {
      return Object.freeze({ n: ord, s: this.s }) satisfies ComplexField as any;
    },
  } satisfies ComplexField & FieldBuilder<T> as any;
}

/**
 * Represents an enum type.
 * @param inner A list of possible string values.
 */
function enum_<const T extends readonly string[]>(inner: T): SchemaOfType<T[number]> {
  return Object.freeze({
    t: MetaTag.Enum,
    d: inner,
  } satisfies Schema) as any;
}

/**
 * Represents an optional type, marking `T` as `T | undefined | null`.
 * @param inner The type to mark as "optional."
 */
function optional<T>(inner: SchemaOfType<T>): SchemaOfType<T | undefined | null> {
  return Object.freeze({
    t: MetaTag.Optional,
    d: inner,
  } satisfies Schema) as any;
}

type ExtractTupleTypeSchemas<T extends readonly unknown[]> = { [K in keyof T]: SchemaOfType<T[K]> };

/**
 * Represents a tuple type.
 * @param types The types of elements in this tuple.
 */
function tuple<const T extends unknown[]>(...types: ExtractTupleTypeSchemas<T>): SchemaOfType<T> {
  return Object.freeze({
    t: MetaTag.Tuple,
    d: types,
  } satisfies Schema) as any;
}

export {
  field,
  array,
  optional,
  tuple,
  object_ as "object",
  int_ as "int",
  float_ as "float",
  bigint_ as "bigint",
  string_ as "string",
  boolean_ as "boolean",
  enum_ as "enum",
};
export type { Infer as "infer" };
