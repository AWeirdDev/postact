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
