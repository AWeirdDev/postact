import {
  select,
  html,
  type VirtualItem,
  state,
  dependent as d,
  css,
} from "./src";

function createApp(): VirtualItem {
  const $count = state(0);

  function handleOnClick() {
    $count.update((v) => v + 1);
  }

  const stylesheet = css`
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
    }

    h1,
    p,
    button {
      font-family: sans-serif;
    }

    button {
      font-size: 16px;
      width: 100px;
      height: 40px;
    }
  `;
  const bigger = css({ fontSize: "20px" });

  return html`
    <div class="center">
      <style>
        ${stylesheet}
      </style>
      <h1>Postact</h1>
      <p>
        Postact is a simple, cross-platform library designed to build reactive
        apps.
      </p>
      <p>
        You can try it out in <code>index.ts</code>. Then, just see the magic
        happens.
      </p>
      <button onclick=${handleOnClick}>
        ${d($count, (v) =>
          v > 0 ? html`<b style=${bigger}>${v}</b>` : "Click me!",
        )}
      </button>
    </div>
  `;
}

select("#app").render(createApp());
