# States
States are a kind of *subscribable*, which can be subscribed via `.subscribe()`.

The core idea of state updates in Postact is that **you are the one who determines whether to update the state**.
Therefore, every `update()` you call triggers all subscribers of this state even if the value is of no difference.

::: warning

The state value should never be of type `Function` as Postact might mistake it for [a way of updating states](#updating)
when you run `update()`.

:::

```ts twoslash
import { state } from "@postact/core";

const $name = state<string>("jimmy");

// Subscribe to this state
$name.subscribe((name) => {
  console.log("name is now", name);
});

$name.update("Walter");
// Console: name is now walter

$name.update(prev => prev.slice(0, -2) + "uh");
// Console: name is now waltuh

$name.update("waltuh")
// Console: name is now waltuh
```

::: info

A conventional way of differentiating a normal value and a subscribable is to add a dollar sign ($) as the prefix.
For example:

- `apples`: No `$` at front, possibly a normal Javascript value.
- `$apples`: `$` at front, inferred to be a subscribable.
:::

## Updating
There are two ways of updating a state.

1. Via direct value passing:

```ts
const $count = state(0);

$count.update(100);
console.log($count.value); // 100
```

2. Via function dispatches, taking the current state value as the argument:

```ts
const $count = state(0);

$count.update(v => v + 100);
console.log($count.value); // 100
```

## Getting value
When using states in `html` or `text` contexts, pass them in directly:

```ts twoslash
import { state, html, select } from "@postact/core";

const $name = state("John");

function onInput(e: any) {
  $name.update(e.currentTarget.value);
}

select("#app").render(html`
    <input type="text" oninput=${onInput} placeholder="Enter name" />
    <h1>Hello, ${$name}!</h1>
`)
```

<script lang="ts" setup>
import { onMounted } from "vue";
import { select, state, html } from "@postact/core";

onMounted(() => {
  const $name = state("John");
  
  function onInput(e: any) {
    $name.update(e.currentTarget.value);
  }
  
  select('[data-demo="states-getting-value-directly"]').render(html`
      <input type="text" oninput=${onInput} class="postact-input" placeholder="Enter name" />
      <br />
      <br />
      <h1>Hello, ${$name}!</h1>
  `)
})
</script>

::: info POSTACT DEMO

<br />

<div data-demo="states-getting-value-directly">
    <!-- reserved for postact -->
</div>

<br />

:::
