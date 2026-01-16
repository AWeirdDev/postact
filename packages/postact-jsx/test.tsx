import { state } from "@postact/core";

function Counter() {
  const $count = state(0);

  return <div>{$count}</div>;
}
