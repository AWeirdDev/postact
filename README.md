# postact
another way of web development that has nothing to do with the evil triangle company

expected usage:

```html
<!-- index.html -->
<div id="app"></div>
<script src="./script.js"></script>
```

```ts
// script.js
function Button() {
  // states are optimized for every type
  // "maybe" type (aka. T | null) is coming soon, maybe
  const $count = state.number(0);

  return html`<button onclick=${() => $count.add(1)}>
                ${$count}
              </button>`;
}

select("#app").render(Button());
```

essentially, the states themselves register updates for you, so the "entire" component would only render once, then the states will help with the small changes to the children, if needed.

alternatively, if you hate the react-like component naming convention, or you have ssr ready, you can use `select()` to deal with most things

```html
<!-- index.html -->
<button>0</button>
<script src="./script.js"></script>
```

```ts
// script.js
const button = select("button");
const $count = state.number(0);

button.on("click", () => {
  $count.add(1);
});

$count.subscribe((value) => {
  button.textContent = value;
})
```
