import { Conditional } from "@postact/core";

<Conditional condition={true}>{() => <p>cheese</p>}</Conditional>;

async function Data() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const { title } = (await res.json()) as any;

  return <p>You have the todo: {title}</p>;
}

<Data />;
