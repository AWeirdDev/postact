import { later, state } from "./src";

const $data = later(async () => {
  return "wowie";
});
$data.subscribe((value) => {
  console.log("value!", value);
});
