# @postact/serde
Serialization/deserialization and typing system crafted to align with [Postact](https://github.com/AWeirdDev/postact) and other workflows.

## At a glance
serde provides a clean API that's similar to Zod, but you can take more control over how the data is structured.

```ts
import { t, serialize, deserialize } from "@postact/serde";

// Create a schema
const Product = t.object({
  name: t.field(t.string()).order(0),
  description: t.field(t.string()).order(1),
  price: t.field(t.int()).order(2),
});

// Extract the type from the schema
type Product = t.infer<typeof Product>;

const product = {
  name: "Ice cream",
  description: "Creamy and nice.",
  price: 3,
} satisfies Product;

// Serialize it into a buffer
const buf = serialize(Product, product);
console.log(buf); // ArrayBuffer(37) [ 9, 0, 0, 0, 73, 99, ... ]

// Deserialize the serialized data
const deserialized = deserialize(Product, buf);
console.log(deserialized); // { name: "Ice cream", (...) }
```

## Drawbacks
You cannot write documentation for each field or type, as it's not a TypeScript `interface`. Therefore, the field names & type names **must** be implicit. They can be as long as you wish, as they're just labels and will not be serialized.
