import { html, state, type VirtualItem } from "./src";

function Counter(): VirtualItem {
  const $count = state(0);

  return html`<button onclick=${() => $count.update((v) => v + 1)}>
    ${$count}
  </button>`;
}

html`<${Counter} />`;
