// rolldown.config.ts
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
      minify: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      minify: true,
    },
  ],
  external: [],
});
