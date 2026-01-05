# Routes <Badge type="warning" text="beta" />
Postact supports simple client-side routing, either through path (`/a/b/c`) or hash (`#/a/b/c`), at your option.

```ts twoslash
import { route, select, html } from "@postact/core";

route("/", (ctx) => {
  select("#app").render(html`
    <button onclick=${() => ctx.navigate("/foods/chocolate")}>
        Go to /foods/chocolate
    </button>
  `);
});

route("/foods/:name", (ctx) => {
  const { name } = ctx.params;
  
  select("#app").render(html`
    <h1>I like ${name}!</h1>
    <button onclick=${() => ctx.navigate("/")}>Back</button>
  `);
});
```

<!-- DEMO -->

::: info POSTACT DEMO

<br />

<div data-demo="routes-demo">
    <!-- reserved for postact -->
</div>

<br />

:::

<!-- /DEMO -->

## Route context
The route context comprises two main parts:

- `params`: The [path parameters](#path-parameters), if any.
- `navigate()`: A function to [navigate](#navigating) to a different path.

## Path parameters {#path-parameters}
You can add path parameters by appending `:paramName` in a path. Each parameter name should be unique, and parameter values
can be accessed via `ctx.params`.

```ts twoslash
import { route } from "@postact/core";

route("/groceries/:item", (ctx) => {
  const { item } = ctx.params;
  console.log("viewing page", item);
});
```

The path parameter logic for Postact is that **each parameter must be present**.
If any of them is missing, the route handler will not run:

- When you go to `/groceries/apples`, you get: `viewing page apples`
- When you go to `/groceries/bananas`, you get: `viewing page bananas`
- When you go to `/groceries/`, you get nothing at all; the route doesn't match.

However, this logic does not apply to [any path](#any-path).

## Any path {#any-path}
You can specify "any path afterwards" using the asterisk symbol (`*`).
This can only be used at the end of the path definition.

```ts
route("/hello/*", () => {
  console.log("boo!");
});
```

- When you go to `/hello/world`, you get: `boo!`
- When you go to `/hello/taipei/in/taiwan`, you get: `boo!`
- When you go to `/hello/`, you get: `boo!`
- When you go to `/hello`, you get nothing at all; the route doesn't match.

## Navigating
You can navigate to any path using the `navigate()` function provided by the context object.

Under the hood, Postact uses a global router to keep track of path/hash path names, [`History.pushState()`] API to control the browser session history.

```ts
// Navigate to a different path
navigate("/hello");

// Navigate to a different hash-based path
navigate("#/hello");

// Navigate to a different site
navigate("https://github.com");
```


<script lang="ts" setup>
import { onMounted } from "vue";
import { select, state, html } from "@postact/core";

onMounted(() => {
  (() => {
    const $route = state("/");
    
    function a() {
      return html`
      <button class="postact-btn" onclick=${() => $route.update("/foods/chocolate")}>
          Go to /foods/chocolate
      </button>`
    }
    function b() {
      return html`
        <h1>I like chocolate!</h1>
        <br />
        <button class="postact-btn" onclick=${() => $route.update("/")}>Back</button>
      `
    }
    const $comp = state(a());
    $route.subscribe((route) => {
      if (route == "/") $comp.update(a());
      else $comp.update(b());
    });

    select('[data-demo="routes-demo"]').render(html`
        <input type="text" value=${$route} disabled class="postact-input postact-input-smaller" />
        <hr />
        <div>${$comp}</div>
    `)
  })();
})
</script>
