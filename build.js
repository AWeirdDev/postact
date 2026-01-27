import { $ } from "bun";

const priority = ["serde", "core", "ssr", "jsx", "client-router"];
for (const item of priority) {
  console.log(`======> building ${item}`);
  await $`bun run --filter './packages/${item}' build`;
  console.log(`<====== finished building ${item}\n`);
}

console.log("!====== everything up to date, built successfully");
