import { state, select } from "@postact/core";

function Counter() {
  const $count = state(0);
  return <button onclick={() => $count.update((v) => v + 1)}>Current: {$count}</button>;
}

select("#app").render(<Counter />);
