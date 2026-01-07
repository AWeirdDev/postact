# Dependents <Badge type="warning" text="beta" />
Dependents are a kind of *subscribable*, which can be subscribed via `.subscribe()`.
They update as the dependencies specified change.

| Identifier          | Availability |
|---------------------|--------------|
| `Dependent` (`0`)   | ⚠️ in beta   |


For one dependent, you can add one or multiple subscribable dependencies.

```ts twoslash
import { state, dependent } from "@postact/core";

const $count = state(0);
const $label = dependent($count, (value) => {
  // This function is the "dependent dispatch"
  return `Count is ${value}`;
});

// The dependent dispatch gets executed immediately, 
// so let's check the initial value.
console.log($label.value);
// Console: Count is 0

// Whenever $count changes, $label changes
$label.subscribe((value) => {
  console.log("updated,", value);
});

$count.update(1);
// Console: updated, Count is 1
```

## Multiple dependencies
You can add multiple dependencies. When any of them changes, the dependent dispatch gets executed, updating the value of the dependent.

```ts twoslash
import { state, dependent } from "@postact/core";

const $name = state("John");
const $age = state(32);

const $payload = dependent([$name, $age], ([name, age]) => {
  return { name, age };
});

$payload.subscribe((value) => {
  console.log(value);
});

$name.update("Walter White");
// Console: { name: "Walter White", age: 32 }
```

## Rendering logic
You can apply rendering logic using `dependent`. In the example below, `dependent` serves as a toggle for conditional rendering.

::: tip 💡 TIP

If you'd like, you can rename it to `d` for quicker access.

:::

```ts twoslash
import { state, select, html, dependent as d } from "@postact/core";

const $toggled = state(false);

select("#app").render(html`
    <div>${d($toggled, t => t ? html`<h1>Boo!</h1>` : null)}</div>
    <button onclick=${() => $toggled.update(t => !t)}>Toggle</button>
`);
```

::: info POSTACT DEMO

<br />

<div data-demo="dependents-rendering-logic">
    <!-- reserved for postact -->
</div>

<br />

:::


<script lang="ts" setup>
import { onMounted } from "vue";
import { select, state, html, dependent as d } from "@postact/core";

onMounted(() => {
  (() => {
    const $toggled = state(false);
  
    select('[data-demo="dependents-rendering-logic"]').render(html`
        <div>
            ${d($toggled, (t) => t ? html`<h1>Boo!</h1>` : null)}
        </div>
        <button class="postact-btn" onclick=${() => $toggled.update(t => !t)}>Toggle</button>
    `);
  })();
})
</script>
