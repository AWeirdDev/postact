# Introduction

Postact is a semi-opinionated yet minimalist library (and a potential framework) for building robust web apps. It mainly comprises two things:

- **HTML creation** — with `html`
- **States (subscribables)** — with `state`, `dependent`, `later`.
  There are also utilities to help you build your web app faster than ever, just like in vanilla Javascript.

If you have your HTML prepared:

```html
<div id="app"></div>
```

Then you can add a <code>{{ '<script>' }}</code> for Postact.

```ts twoslash
import { state, html, select } from "@postact/core";

// Create a new subscribable state
const $count = state<number>(0);

function handleOnClick() {
  $count.update(v => v + 1);
}

// Select your app root, then use `render()` to render 
// the virtual DOM produced by html. Postact manages the 
// DOM automatically for you.
select("#app").render(html`
    <h1>Hello, Postact!</h1>
    <p>Click the button below to add the number for no reason.</p>
    <button onclick=${handleOnClick}>Count: ${$count}</button>
`)
```

<script lang="ts" setup>
import { onMounted } from "vue";
import { select, state, html } from "@postact/core";

onMounted(() => {
  const $count = state<number>(0);

  function handleOnClick() {
    $count.update(v => v + 1);
  }
  
  select('[data-demo="landing-counter"]').render(html`
    <h1>Hello, Postact!</h1>
    <p>Click the button below to add the number for no reason.</p>
    <div style="height: 16px;"></div>
    <button class="postact-btn" onclick=${handleOnClick}>Count: ${$count}</button>
  `)
})
</script>

::: info POSTACT DEMO

<br />

<div data-demo="landing-counter">
    <!-- reserved for postact -->
</div>

<br />

:::
