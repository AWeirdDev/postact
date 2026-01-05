import { dependent, html, route, select, state, text } from "./src";

route("/hello/*", () => {
  console.log("boo!");
});
