import { state, dependent, html } from "./src";

const $t = state(false);
const $v = dependent($t, (t) => (t ? html`<div>wtf?</div>` : "no"));

console.log($v.value);
