import { html, ref, select } from "./src";

const $div = ref();

$div.subscribe((value) => {
  console.log("got ref", value);
});

const ele = html` <div a="asdf" ref=${$div}>Hello!</div> `;
select("#app").render(ele);
