# Ref
Get a reference to rendered elements with `ref()`.

```ts twoslash
import { ref, select, html } from "@postact/core";

const $div = ref<HTMLDivElement>();

$div.subscribe((div) => {
  console.log("div is rendered:", div.textContent);
});

select("#app").render(html` <div ref=${$div}>Hello!</div> `)
```
