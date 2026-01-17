# @postact/core
Simple, fast, zero-dependency web dev.

```html
<div id="app"></div>
```

```ts
import { 
  select,
  state
  html,
} from "@postact/core";


const $count = state(0);

function onClick() {
  $count.update(v => v + 1)
}

return html`
  <button onclick=${onClick}>${$count}</button>
`

select("#app").render(createApp())
```
