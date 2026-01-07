import { sleep } from "bun";
import { state } from "./src";

const $count = state(0);

$count.subscribe(async () => {
  console.log("oh no!");
  await sleep(1000);
});

$count.subscribe(() => {
  console.log("boo!");
});

$count.update(1);
