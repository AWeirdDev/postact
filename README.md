# Postact
[🚧 **Docs**](https://aweirddev.github.io/postact) · [**GitHub**](https://github.com/AWeirdDev/postact)

Postact is a zero-dependency, semi-opinionated yet minimalist library (and a potential framework) for building robust web apps. It mainly consists of a few things:

- **HTML creation** — with `html`
- **States (subscribables)** — with `state`, `dependent`, `later`.
  There are also utilities to help you build your web app even faster, just like in vanilla Javascript.
- **Client-side routing** — `route`

Installation (or with `bun`, `pnpm`, `yarn`, etc.):

```sh
$ npm i @postact/core
```

## At a glance

If you have your HTML prepared:

```html
<div id="app"></div>
```

You can get started with Postact:

```ts
import { 
  select,
  state
  html,
} from "@postact/core";

function createApp() {
  const $count = state(0);

  function onClick() {
    $count.update(v => v + 1)
  }

  return html`
    <button onclick=${onClick}>${$count}</button>
  `
}

select("#app").render(createApp())
```

## States
States in Postact are one of the must-mention features. Under the hood, they are subscribables, and as the name suggests, they can be subscribed via `.subscribe()` whenever the state value changes.

For example, a simple state:

```ts
const $count = state<number>(0);

// subscribe to state changes
$count.subscribe(value => {
  console.log("count is now", value);
})

// updates the state with value
$count.update(100);

// updates the state with a dispatch,
// taking the current state value, and 
// the dispatch must return the new value.
$count.update(currentValue => {
  return currentValue + 1;
})
```

> [!NOTE]
> **About the "$"**<br />
> It's a recommended way of writing states/subscribables as it differentiates regular variables from states.


It's also worth noting that Postact **does not** check for value equalities. They should be done on your end, because sometimes deep equality checks are really costly, and the best practice would be to **not do any checks** and be sure of whether or not the value actually changes.

However, Postact provides a clean checker API if checks are a requisite.

```ts
function nameChecker(current: string, other: string): boolean {
  // if the desired value to update (`other`) is not "Waltuh",
  // Postact updates the state.
  return other !== "Waltuh"
}

const $name = state("John").withChecker(namesChecker);

$name.update("Jesse") // updates $name
$name.update("Waltuh") // doesn't pass checker; doesn't update $name
```

### Dependents

It's also worth mentioning that states can also be **depended** upon with `dependent`:

```ts
const $data = state({ username: "Walter" });

// when $data updates, $userName updates
const $userName = dependent($data, (data) => {
  // you can also do work here:
  // doSomeWork();
  return data.username;
});
```

In the above example, whenever `$data` (a general state) updates, `$userName` (a *dependent* state) gets updated.

## What's so different?
Consider the following piece of code:

```tsx
// react code
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(v => v + 1)}>{count}</button>
  )
}
```

When you click on the button, the count goes up by one. As React detects a state change, it *re-runs* the `Counter` component, checks which part of the component HTML has changed, before finally re-rendering the component. Checking which part has changed This is because React doesn't know where it has changed until they compare previous ones node-by-node. This is apparently inefficient (and a bit cute). Postact takes a different approach. Right as you create HTML with `html`, Postact locates where in the HTML has variable states, so whenever one of the states changes, Postact only updates the contents at the state usage location. For example:

```ts
const $name = state("John");
html`
  <div>
    <p>Hello, ${$name}</p>
  </div>
`
```

This becomes:

```ts
{
  tag: "div",
  attributes: {},
  children: [
    {
      tag: "p",
      attributes: {},
      children: [
        "Hello, "
        "John"  // (*)
      ]
    }
  ]
}
```

## Future plans
In the future. Maybe. Okay yeah I will.

- [x] `route()` full context interface
- [x] **IMPORTANT: Rewrite `vdom/client.ts`**
- [x] Virtual fragment (w/ `subscribables` field) support
- [x] Insertions after regular tags
- [ ] Component-like insertions `<${...}>`
- [x] References (`ref`)
- [ ] Classes support
- [ ] Style support (CSS support with `css`)
