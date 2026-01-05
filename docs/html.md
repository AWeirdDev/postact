# HTML <Badge type="warning" text="beta" />
The `html` function provided by Postact serves a similar purposes as [uhtml](https://github.com/WebReflection/uhtml), 
[lit-html](https://lit.dev/) and [htm](https://github.com/developit/htm).
It aims to be lightweight, fast, responsive to states, and runnable even in server-side environments.

```ts twoslash
import { select, html } from "@postact/core";

select("#app").render(html`
    <h1>Hello, world!</h1>
    <p>You see, it's just as simple as that.</p>
    <button>Button!</button>
`)
```

::: info POSTACT DEMO

<br />

<div data-demo="landing-counter">
    <h1>Hello, world!</h1>
    <p>You see, it's just as simple as that.</p>
    <button class="postact-btn">Button!</button>
</div>

<br />

:::

## Virtual DOM
What `html` returns is **never** the actual DOM you create with `window.document`.
Instead, it returns a virtual fragment, containing only minimal necessary information.

For example, an HTML like:

```html
<p>Howdy</p>
```

The `html` function returns:

```ts
{
  __p: 3,  // 3 - virtual fragment
  children: [
    {
      __p: 2,  // 2 - virtual element
      tag: "p",
      attributes: {},
      children: [
        {
          __p: 4,  // 4 - virtual text node
          data: "Howdy",
          subscribable: undefined,
        }
      ],
      listeners: [],
    },
  ],
}
```

It contains all the necessary information for Postact to build the actual DOM.
