import { dependent, state } from "./src";

const $age = state(0);
const $name = state("John");

const $user = dependent([$age, $name], ([age, name]) => {
  return { age, name };
});

$user.subscribe((item) => {
  console.log(item);
});

$age.update(1);
