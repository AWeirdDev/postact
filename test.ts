import { state, text } from "./src";

const $count = state(0);
const $label = text`Current: ${$count}`;

console.log($label.value); // "Current: 0"

// Now we update the $count
$count.update(1);
console.log($label.value); // "Current: 1
