import { deserialize, t } from "@postact/serde";

import { Transmitable, TransmitWriter } from "./shared";

interface CallActionParams<T, R> {
  ident: string;
  paramsSchema: t.SchemaOfType<T>;
  params: T;
  returnSchema: t.SchemaOfType<R>;
}

/**
 * **(client-side)** `@postact/serde` client.
 */
export class SerdeClient {
  #url: string;

  constructor(url: string) {
    this.#url = url;
  }

  async callAction<T, R>({
    ident,
    paramsSchema,
    params,
    returnSchema,
  }: CallActionParams<T, R>): Promise<R> {
    const writer = new TransmitWriter(Transmitable.EventType.Action);
    writer.placeAction(ident, paramsSchema, params);

    const result = await fetch(this.#url, {
      method: "POST",
      body: writer.finish(),
    });
    if (!result.ok) throw new Error(`failed, got response with status ${result.status}`);

    const streamReader = result.body?.getReader()!;
    const content = await streamReader.read();

    return deserialize(returnSchema, content.value!.buffer);
  }
}
