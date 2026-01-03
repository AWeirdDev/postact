import { html, select, state, text } from "./src";

const $count = state(0);
const $label = text`Count is now: ${$count}`;

select("#app").render(
  html`<div>
    <button data-text=${$label} onclick=${() => $count.update((v) => v + 1)}>
      ${$label}
    </button>
  </div>`,
);
