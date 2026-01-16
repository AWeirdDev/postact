import { component, html, type PropsWithChildren, select } from "./src";

const Page = component(
  ({ children, apples }: PropsWithChildren<{ apples: number }>) => html`
    <div>
      <marquee><h1>Welcome to my site!</h1></marquee>
      <div>we have ${apples} apples</div>
      <div>${children}</div>
    </div>
  `,
);

select("#app").render(html`<${Page({ apples: 100 })}>Hello, world!</${Page}>`);
