import { select, html, type VirtualItem, state, dependent } from "./src";

function createApp(): VirtualItem {
  const $count = state(0);
  const $element = dependent($count, (count) => {
    return count > 4 ? "WOW!" : "";
  });

  return html`<div>
    <button onclick=${() => $count.update((v) => v + 1)}>
      <h1>${$count}</h1>
    </button>
    <div id="display">${$element}</div>
  </div>`;
}

select("#app").render(createApp());
