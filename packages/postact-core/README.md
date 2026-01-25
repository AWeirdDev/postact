# @postact/core
Simple, fast, lightweight web dev.

[GitHub](https://github.com/AWeirdDev/postact)

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
