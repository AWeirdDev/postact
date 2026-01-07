# Later
The `later()` function creates a subscribable, allowing you to subscribe to the results of asynchronous operations.

```ts twoslash
import { later } from "@postact/core";

const $data = later<string>(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve("boo!"), 100);
  })
});
```
