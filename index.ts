import { select, html, type VirtualItem, state, dependent as d } from "./src";

function Counter(): VirtualItem {
  const $count = state(0);

  return html`<button onclick=${() => $count.update((v) => v + 1)}>
    ${$count}
  </button>`;
}

function createApp(): VirtualItem {
  const $count = state(0);

  function handleOnClick() {
    $count.update((v) => v + 1);
  }

  return html`
    <div class="center">
      <h1>Postact</h1>
      <p>
        Postact is a simple, cross-platform library designed to build reactive
        apps.
      </p>
      <p>
        You can try it out in <code>index.ts</code>. Then, just see the magic
        happen.
      </p>
      <${Counter} />
      <button onclick=${handleOnClick}>
        ${d($count, (v) => (v > 0 ? html`<b>${v}</b>` : "Click me!"))}
      </button>
    </div>
  `;
}

select("#app").render(createApp());
