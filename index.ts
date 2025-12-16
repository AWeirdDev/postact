import { later, state, html, select } from "./src";

const $count = state(0);

select("#app").render(html`
  <div>Hello, world!</div>
  <button onclick=${() => $count.update((v) => v + 1)}>${$count}</button>
`);
