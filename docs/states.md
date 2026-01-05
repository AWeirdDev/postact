# States <Badge type="tip" text="stable" />
States are a kind of *subscribable*, which can be subscribed via `.subscribe()`.
They hold data and and allow you to keep track of specific app or component states.

| Identifier      | Availability |
|-----------------|--------------|
| `State` (`1`)   | ✅ available |

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
console.log($count.value); // Console: 100
```

2. Via function dispatches, taking the current state value as the argument:

```ts
const $count = state(0);

$count.update(v => v + 100);
console.log($count.value); // Console: 100
```

## Getting value
For general use, access the `value` attribute to get the current value:

```ts
const $count = state(0);

console.log("value is", $count.value);
// Console: value is 0
```

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

<!-- DEMO -->

::: info POSTACT DEMO

<br />

<div data-demo="states-getting-value-directly">
    <!-- reserved for postact -->
</div>

<br />

:::

<!-- /DEMO -->

However, if you add `.value`, it gets accepted as a normal string and gets statically rendered.

```jsx
    // note: don't do this unless you're freezing the data
    <h1>Hello, ${$name}!</h1> // [!code --]
    <h1>Hello, ${$name.value}!</h1> // [!code ++]
```

<!-- DEMO -->

::: info POSTACT DEMO

<br />

<div data-demo="states-getting-value-dot-value">
    <!-- reserved for postact -->
</div>

<br />

:::

<!-- /DEMO -->

As you can see, nothing gets updated because it's been statically rendered.

## Scoping
You can use `state()` anywhere you want. It could be for a single component, or for the whole app.
For global (app) states, you can prefix variables with double dollar signs instead (`$$`) to show their significance.

## Typing
Typing is fully supported for `state()`. For example, an app that needs to keep track of the WebSocket state:

```ts twoslash
import { state } from "@postact/core";

interface WebSocketState {
  connected: boolean;
  history: string[];
}

// WebSocket state
const $wsState = state<WebSocketState>({ connected: false, history: [] });
//    ^?
```

<script lang="ts" setup>
import { onMounted } from "vue";
import { select, state, html } from "@postact/core";

onMounted(() => {
  (() => {
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
  })();
  
  (() => {
    // they won't notice. but it's just how it works.
    select('[data-demo="states-getting-value-dot-value"]').render(html`
        <input type="text" class="postact-input" placeholder="Enter name" />
        <br />
        <br />
        <h1>Hello, John!</h1>
    `)
  })();
})
</script>
