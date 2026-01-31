import "./style.css";

import { Conditional, dependent, For, ref, select, state } from "@postact/core";

function App() {
  const $inputRef = ref<HTMLInputElement>();
  const $todos = state<string[]>([]);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if ($inputRef.value === null) return;
    const { value } = $inputRef.value;

    if (!value) return;

    $todos.update((arr) => {
      arr.push(value);
      return arr;
    });

    $inputRef.value.value = "";
  }

  return (
    <div>
      <h1>Todos</h1>

      <form
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "8px",
        }}
        onsubmit={handleSubmit}
      >
        <input type="text" ref={$inputRef} required />
        <button type="submit">+ Add</button>
      </form>

      <ul>
        <For each={$todos}>
          {(todo) => <li style={{ textAlign: "start" }}>{todo}</li>}
        </For>
      </ul>
    </div>
  );
}

select("#app").render(<App />);
