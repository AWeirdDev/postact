export class ChunksWriter {
  // baseline 2023: ArrayBuffer.prototype.resize()
  readonly #buf: ArrayBuffer;
  readonly #arr: Uint8Array;
  readonly #view: DataView;

  #offset: number;

  constructor() {
    this.#buf = new ArrayBuffer(512, { maxByteLength: 104_857_600 });
    this.#arr = new Uint8Array(this.#buf);
    this.#view = new DataView(this.#buf);
    this.#offset = 0;
  }

  /**
   * Ensure allocation so that data of size `size` can fit.
   * @param size The size of the next data to fit.
   */
  ensureAlloc(size: number) {
    const needed = this.#offset + size;
    if (needed > this.#arr.length) {
      const toAlloc = Math.ceil((needed - this.#arr.length) / 512) * 512;
      this.#buf.resize(this.#arr.length + toAlloc);
    }
  }

  /**
   * Put a `u8` (unsigned 8, of size 1 byte) to the array.
   * @param d The data.
   */
  putU8(d: number) {
    this.ensureAlloc(1);
    this.#view.setUint8(this.#offset, d);
    this.#offset += 1;
  }

  /**
   * Put a `u32` (unsigned 32, of size 4 bytes) to the array.
   * This is `usize` on most platforms, thus serde will use this
   * for length declaration.
   * @param d The data.
   */
  putU32(d: number) {
    this.ensureAlloc(4);
    this.#view.setUint32(this.#offset, d, true);
    this.#offset += 4;
  }

  /**
   * Put a `i32` (signed 32, of size 4 bytes) to the array.
   * @param d The data.
   */
  putI32(d: number) {
    this.ensureAlloc(4);
    this.#view.setInt32(this.#offset, d, true);
    this.#offset += 4;
  }

  /**
   * Put a `i64` (signed 64, of size 8 bytes) to the array.
   * @param d The data. Takes a `bigint`.
   */
  putI64(d: bigint) {
    this.ensureAlloc(8);
    this.#view.setBigInt64(this.#offset, d, true);
    this.#offset += 8;
  }

  /**
   * Put a `f32` (float 32, of size 4 bytes) to the array.
   * @param d The data.
   */
  putF32(d: number) {
    this.ensureAlloc(4);
    this.#view.setFloat32(this.#offset, d, true);
    this.#offset += 4;
  }

  /**
   * Put a `f64` (float 64, of size 8 bytes) to the array.
   * @param d The data.
   */
  putF64(d: number) {
    this.ensureAlloc(8);
    this.#view.setFloat64(this.#offset, d, true);
    this.#offset += 8;
  }

  /**
   * Place a string with a known length into the chunk.
   * @param s The string.
   */
  placeFixedString(s: string) {
    // baseline: widely available
    const encoder = new TextEncoder();
    const result = encoder.encode(s);

    this.ensureAlloc(result.length);
    this.#arr.set(result, this.#offset);

    this.#offset += result.length;
  }

  /**
   * Place a string inside the chunk. The size is unknown.
   * That is, the size information (of size 4B) will be added.
   * @param s The string.
   */
  placeString(s: string) {
    // baseline: widely available
    const encoder = new TextEncoder();
    const result = encoder.encode(s);

    this.ensureAlloc(result.length + 4);

    this.putU32(result.length);
    this.#arr.set(result, this.#offset);

    this.#offset += result.length;
  }

  /**
   * Shrinks the size of {@link ArrayBuffer} to the
   * exact bytes size used.
   */
  shrinkToFit(): ArrayBuffer {
    return this.#buf.resize(this.#offset);
  }

  /**
   * Finish writing, ending this series.
   */
  finish(): ArrayBuffer {
    this.shrinkToFit();
    return this.#buf;
  }
}

export class ChunksReader {
  readonly #buf: ArrayBuffer;
  readonly #view: DataView;
  readonly #arr: Uint8Array;

  #offset: number;

  constructor(buf: ArrayBuffer) {
    this.#buf = buf;
    this.#view = new DataView(this.#buf);
    this.#arr = new Uint8Array(this.#buf);
    this.#offset = 0;
  }

  readU8(): number {
    const d = this.#view.getUint8(this.#offset);
    this.#offset += 1;
    return d;
  }

  readU32(): number {
    const d = this.#view.getUint32(this.#offset, true);
    this.#offset += 4;
    return d;
  }

  readI32(): number {
    const d = this.#view.getInt32(this.#offset, true);
    this.#offset += 4;
    return d;
  }

  readI64(): bigint {
    const d = this.#view.getBigInt64(this.#offset, true);
    this.#offset += 8;
    return d;
  }

  readF32(): number {
    const d = this.#view.getFloat32(this.#offset, true);
    this.#offset += 4;
    return d;
  }

  readF64(): number {
    const d = this.#view.getFloat64(this.#offset, true);
    this.#offset += 8;
    return d;
  }

  getString(): string {
    const length = this.readU32();
    return this.getFixedString(length);
  }

  getFixedString(length: number): string {
    const decoder = new TextDecoder();
    const text = decoder.decode(this.#arr.subarray(this.#offset, this.#offset + length));
    this.#offset += length;
    return text;
  }
}
