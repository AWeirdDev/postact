import {
  isVe,
  isVtn,
  isFr,
  isPromise,
  PostactIdentifier,
  type VirtualElement,
  type VirtualFragment,
  type VirtualItem,
  type VirtualTextNode,
} from "@postact/core";
import {
  ChunksReader,
  ChunksWriter,
  deserializeFrom,
  serializeInto,
  t,
  type Schema,
} from "@postact/serde";

export namespace Transmitable {
  export enum EventType {
    Code = 0, // runnable code on client-side
    Vdom = 1, // static virtual dom
    Action = 2, // for server actions
  }

  export const CodePayload = t.object({
    ident: t.field(t.string()).order(0),
    content: t.field(t.string()).order(1),
  });
  export type CodePayload = t.infer<typeof CodePayload>;

  export interface ActionPayload {
    ident: string;
    data: any;
  }

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

  constructor(eventType: Transmitable.EventType) {
    this.#writer = new ChunksWriter();

    // we'll set the event type as the header
    this.#writer.putU8(eventType);
  }

  placeVe({ tag, attributes, children }: VirtualElement) {
    // first the header
    this.#writer.putU8(Transmitable.VdomType.Element);
    serializeInto(this.#writer, Transmitable.VirtualElement, {
      tag,
      attributes: attributes
        .entries()
        .filter(([_, value]) => typeof value !== "undefined" && value !== null)
        .map<[string, string]>(([key, value]) => [key, value!.toString()])
        .toArray(),
    } satisfies Transmitable.VirtualElement);

    const length = children.length;
    this.#writer.putU32(length);
    children.forEach((vi) => this.placeVirtualItem(vi));
  }

  placeVtn({ data }: VirtualTextNode) {
    this.#writer.putU8(Transmitable.VdomType.TextNode);
    serializeInto(this.#writer, Transmitable.VirtualTextNode, {
      data,
    } satisfies Transmitable.VirtualTextNode);
  }

  placeVf({ children }: VirtualFragment) {
    if (!children.length) return;
    this.#writer.putU8(Transmitable.VdomType.Fragment);
    this.#writer.putU32(children.length);
    children.forEach((vi) => this.placeVirtualItem(vi));
  }

  placeVirtualItem(vi: VirtualItem) {
    if (typeof vi === "undefined" || vi === null) return;
    if (isVe(vi)) {
      this.placeVe(vi);
    } else if (isVtn(vi)) {
      this.placeVtn(vi);
    } else if (isFr(vi)) {
      this.placeVirtualItem(vi.render());
    } else if (isPromise(vi)) {
      throw new TypeError("promise objects are not supported");
    } else {
      this.placeVf(vi);
    }
  }

  placeCode(payload: Transmitable.CodePayload) {
    serializeInto(this.#writer, Transmitable.CodePayload, payload);
  }

  placeAction(ident: string, paramsSchema: Schema, params: any) {
    this.#writer.placeString(ident);
    serializeInto(this.#writer, paramsSchema, params);
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

  getEventType(): Transmitable.EventType {
    const repr = this.#reader.readU8();
    if (!Object.values(Transmitable.EventType).includes(repr))
      throw new TypeError("unknown event type, not one of EventType");
    return repr;
  }

  getVdomType(): Transmitable.VdomType {
    const repr = this.#reader.readU8();
    if (!Object.values(Transmitable.VdomType).includes(repr))
      throw new TypeError("unknown vdom type, not one of Transmitable.VdomType");
    return repr;
  }

  getVe(): VirtualElement {
    const ve: Transmitable.VirtualElement = deserializeFrom(
      this.#reader,
      Transmitable.VirtualElement,
    );
    const length = this.#reader.readU32();
    const children: VirtualItem[] = [];
    for (let i = 0; i < length; i++) {
      children.push(this.getVirtualItem());
    }

    return {
      __p: PostactIdentifier.VirtualElement,
      tag: ve.tag,
      attributes: new Map(ve.attributes),
      listeners: [],
      children,
    };
  }

  getVtn(): VirtualTextNode {
    const vtn: Transmitable.VirtualTextNode = deserializeFrom(
      this.#reader,
      Transmitable.VirtualTextNode,
    );
    return {
      __p: PostactIdentifier.VirtualTextNode,
      data: vtn.data,
    };
  }

  getVf(): VirtualFragment {
    const length = this.#reader.readU32();
    const children: VirtualItem[] = [];
    for (let i = 0; i < length; i++) {
      children.push(this.getVirtualItem());
    }

    return {
      __p: PostactIdentifier.VirtualFragment,
      children: children,
    };
  }

  getVirtualItem(): VirtualItem {
    const vdomType = this.getVdomType();
    switch (vdomType) {
      case Transmitable.VdomType.Element:
        return this.getVe();
      case Transmitable.VdomType.Fragment:
        return this.getVf();
      case Transmitable.VdomType.TextNode:
        return this.getVtn();
    }
  }

  getCode(): Transmitable.CodePayload {
    return deserializeFrom(this.#reader, Transmitable.CodePayload);
  }

  getAction(paramsSchema: Schema): Transmitable.ActionPayload {
    const ident = this.#reader.getString();
    return { ident, data: deserializeFrom(this.#reader, paramsSchema) };
  }
}
