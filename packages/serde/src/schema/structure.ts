export enum Primitive {
  String = 0,
  Int32 = 1,
  Float64 = 2,
  Boolean = 3,
  BigInt64 = 4,
  Uint8 = 5,
}

export type Meta<T extends MetaTag, D> = Readonly<{ t: T; d: D }>;
export enum MetaTag {
  Optional = 0,
  Vector = 1,
  Complex = 2,
  FixedSizeString = 3,
  Enum = 4,
  Tuple = 5,
}

/**
 * Check if `obj` is a meta type.
 * @param obj The object to check.
 */
export function isMeta(obj: any): obj is Meta<any, any> {
  return Object.hasOwn(obj, "t");
}

// literally just array. just sounds more fancy!
// ...and just so it doesn't coerce with the default type
export type Vector = Meta<MetaTag.Vector, Schema>;

// essentially structs (aka. objects if you're a super javascript guy)
export type ComplexField = { n: number; s: Schema };
export type Complex = Meta<MetaTag.Complex, [string, ComplexField][]>;

// optional (T | undefined | null), but when serialized & deserialized,
// it's always null if there's no data
export type Optional = Meta<MetaTag.Optional, Schema>;

// fixed size string, which checks the encoded length (utf-8)
export type FixedSizeString = Meta<MetaTag.FixedSizeString, number>;

// enum
export type Enum = Meta<MetaTag.Enum, string[]>;

// tuple
export type Tuple = Meta<MetaTag.Tuple, Schema[]>;

// the schema, use isMeta() to differ them
export type Schema = Primitive | Meta<MetaTag, any>;
