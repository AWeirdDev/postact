import { $ } from "bun";

const priority = ["serde", "core", "ssr", "jsx", "client-router"];
for (const item of priority) {
  console.log(`======> building ${item}`);
  console.log(
    `\x1b[2;31m\x1b[1m$\x1b[0m \x1b[2;1mbun run --filter './packages/${item}' build\x1b[0m`,
  );
  await $`bun run --filter './packages/${item}' build`;
  console.log(`<====== finished building ${item}\n`);
}

console.log(
  `everything up to date, built ${priority.length} packages successfully`,
);
