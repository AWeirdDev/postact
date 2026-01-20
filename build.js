import { $ } from "bun";

const priority = ["core", "jsx", "client-router"];
for (const item of priority) {
  console.log(`======> building ${item}`);
  await $`bun run --filter './packages/postact-${item}' build`;
  console.log(`<====== finished building ${item}\n`);
}
