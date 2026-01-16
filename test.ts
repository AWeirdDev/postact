import { html } from "./src";

console.dir(
  html`<div>
    <div><div>Hello: ${100} and i love choco</div></div>
  </div>`,
  { depth: 100 },
);
