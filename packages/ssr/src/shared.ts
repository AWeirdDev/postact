import type { VirtualElement } from "@postact/core";
import { ChunksReader, ChunksWriter, deserializeFrom, serializeInto, t } from "@postact/serde";

export enum EventType {
  Code = 0, // runnable code on client-side
  Vdom = 1, // static virtual dom
  Action = 2, // for server actions
}

export const CodeEvent = t.object({
  content: t.field(t.string()).order(0),
});
export type CodeEvent = t.infer<typeof CodeEvent>;

export namespace Transmitable {
  export enum VdomType {
    Element = 0,
    Fragment = 1,
    TextNode = 2,
  }

  export const VirtualElement = t.object({
    tag: t.field(t.string()).order(0),
    attributes: t.field(t.array(t.tuple(t.string(), t.string()))).order(1),
  });
  export type VirtualElement = t.infer<typeof VirtualElement>;

  export const VirtualTextNode = t.object({
    data: t.field(t.string()).order(0),
  });
  export type VirtualTextNode = t.infer<typeof VirtualTextNode>;
}

export class TransmitWriter {
  #writer: ChunksWriter;

  constructor(eventType: EventType) {
    this.#writer = new ChunksWriter();

    // we'll set the event type as the header
    this.#writer.putU8(eventType);
  }

  placeVe({ tag, attributes }: VirtualElement) {
    // first the header
    this.#writer.putU8(Transmitable.VdomType.Element);
    serializeInto(this.#writer, Transmitable.VirtualElement, {
      tag,
      attributes: attributes
        .entries()
        .filter(([_, value]) => typeof value !== "undefined" && value !== null)
        .map(([key, value]) => [key, value!.toString()])
        .toArray(),
    });
  }

  finish(): ArrayBuffer {
    return this.#writer.finish();
  }
}

export class TransmitReader {
  #reader: ChunksReader;

  constructor(buf: ArrayBuffer) {
    this.#reader = new ChunksReader(buf);
  }

  getEventType(): EventType {
    const repr = this.#reader.readU8();
    if (!Object.values(EventType).includes(repr))
      throw new TypeError("unknown event type, not one of EventType");
    return repr;
  }

  getVdomType(): Transmitable.VdomType {
    const repr = this.#reader.readU8();
    if (!Object.values(Transmitable.VdomType).includes(repr))
      throw new TypeError("unknown vdom type, not one of Transmitable.VdomType");
    return repr;
  }

  getVe(): Transmitable.VirtualElement {
    return deserializeFrom(this.#reader, Transmitable.VirtualElement);
  }
}
