import "./style.css";

import { dependent, For, ref, select, state, Suspense } from "@postact/core";

function sleep(ms: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function Data() {
  const res = await fetch("https://jsonplaceholder.typicode.com/albums/");
  const todos = ((await res.json()) as any[]).slice(10);

  return (
    <ul>
      <For each={todos}>{(todo) => <li>{todo.title}</li>}</For>
    </ul>
  );
}

function App() {
  const $id = state<string>("");
  const $inputRef = ref<HTMLInputElement>();

  return (
    <div>
      <input
        type="text"
        ref={$inputRef}
        onchange={() => $id.update($inputRef.value!.value)}
      />

      {dependent($id, () => (
        <Suspense fallback={<p>Hardly loading lmfao</p>}>
          <Data id="2" />
        </Suspense>
      ))}
    </div>
  );
}

select("#app").render(<App />);
