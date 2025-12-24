---
title: Dependent
---

# Dependent
*Dependents* are a kind of subscribable that updates as `$state` changes. Dependent names should also be prefixed with a dollar sign (`$`) by convention.

```ts
import { 
  select,
  state,
  dependent,
  html,
} from "@ramptix/postact";

function createApp() {
  const $count = state(0);
  const $message = dependent($count, (count) => {
    if (count < 10) {
      return "Click!"
    } else if (count < 20) {
      return "Go on, let's see what you've got."
    } else if (count == 20) {
      return "I'm tired. I'll just count for you at this point."
    } else {
      return `${count}...`
    }
  });

  function onClick() {
    $count.update(v => v + 1);
  }

  return html`
    <h1>${$message}</h1>
    <button onclick=${onClick}>${$count}</button>
  `
}

select("#app").render(createApp())
```

::: card App

<div data-preview="2">
<p>Loading preview...</p>
</div>

:::
