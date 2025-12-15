import { html, select, state } from "./src";
import { virtualItemToFragment } from "./src/vdom/client";

const $counter = state(0);

select("#app").render(
  html`<div>
    <h1 style="color: red;" onclick=${() => alert("no...")}>hello, world!!</h1>
    Tomorrow is going to be a great day! Take a look at this number: ${67}.
    <p>Are you happy? ${() => "you should say yes"}</p>
    <button>${$counter}</button>
  </div>`,
);
