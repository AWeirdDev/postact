import "./style.css";

import {
  Conditional,
  Show,
  dependent,
  For,
  ref,
  select,
  state,
} from "@postact/core";

function App() {
  const $text = state<string>("");

  return (
    <div>
      <h1>Show?</h1>
      <input
        type="text"
        onchange={(e) =>
          $text.update((e.currentTarget! as unknown as { value: string }).value)
        }
      />
      <Show when={$text}>{(text) => <p>Got: {text}</p>}</Show>
    </div>
  );
}

select("#app").render(<App />);
