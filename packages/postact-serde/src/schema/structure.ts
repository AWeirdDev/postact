export enum Primitive {
  String = 0,
  Int32 = 1,
  Float64 = 2,
  Boolean = 3,
  BigInt64 = 4,
}

export type Meta<T extends MetaType, D> = Readonly<{ t: T; d: D }>;
export enum MetaType {
  Optional = 0,
  Vector = 1,
  Complex = 2,
  FixedSizeString = 3,
  Enum = 4,
}

export function isMeta(obj: any): obj is Meta<any, any> {
  return Object.hasOwn(obj, "t");
}

export type Vector = Meta<MetaType.Vector, Schema>;

export type ComplexField = Readonly<{ n: number; s: Schema }>;
export type Complex = Meta<MetaType.Complex, [string, ComplexField][]>;

export type Optional = Meta<MetaType.Optional, Schema>;
export type FixedSizeString = Meta<MetaType.FixedSizeString, number>;
export type Enum = Meta<MetaType.Enum, string[]>;

export type Schema = Primitive | Meta<MetaType, any>;
