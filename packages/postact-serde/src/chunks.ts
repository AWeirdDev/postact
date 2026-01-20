export class ChunksWriter {
  // baseline 2023: ArrayBuffer.prototype.resize()
  readonly #buf: ArrayBuffer;
  readonly #arr: Uint8Array;
  readonly #view: DataView;

  #size: number;
  #offset: number;

  constructor() {
    this.#size = 1024;
    this.#buf = new ArrayBuffer(512, { maxByteLength: 4096 });
    this.#arr = new Uint8Array(this.#buf);
    this.#view = new DataView(this.#buf);
    this.#offset = 0;
  }

  ensureAlloc(size: number) {
    if (this.#buf.byteLength + size >= this.#size) {
      const toAlloc = Math.max(Math.floor(size / 1024), 1) * 1024;
      console.log("allocating", toAlloc, "bytes");
      this.#buf.resize((this.#size += toAlloc));
    }
  }

  // just one byte
  putU8(d: number) {
    this.#view.setUint8(this.#offset, d);
    this.#offset += 1;
  }

  // essentially `usize` on most platforms
  putU32(d: number) {
    this.#view.setUint32(this.#offset, d, true);
    this.#offset += 4;
  }

  putI32(d: number) {
    this.#view.setInt32(this.#offset, d, true);
    this.#offset += 4;
  }

  putI64(d: bigint) {
    this.#view.setBigInt64(this.#offset, d, true);
    this.#offset += 8;
  }

  putF32(d: number) {
    this.#view.setFloat32(this.#offset, d, true);
    this.#offset += 4;
  }

  putF64(d: number) {
    this.#view.setFloat64(this.#offset, d, true);
    this.#offset += 8;
  }

  /**
   * Place a string with a known length into the chunk.
   *
   * @param s The string.
   */
  placeFixedString(s: string) {
    // baseline: widely available
    const encoder = new TextEncoder();
    const result = encoder.encodeInto(s, this.#arr.subarray(this.#offset));

    // The number of bytes modified in the destination Uint8Array. (mdn)
    this.#offset += result.written;
  }

  /**
   * Place a string inside the chunk. The size is unknown.
   * That is, the size information (of size 4B) will be added.
   *
   * @param s The string.
   */
  placeString(s: string) {
    this.putU32(s.length);
    this.placeFixedString(s);
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
