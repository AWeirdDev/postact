import { defineConfig } from "rolldown";

export default defineConfig({
  input: "./index.tsx",
  output: [
    {
      dir: "./dist",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [],
  jsx: {
    mode: "automatic",
    jsxImportSource: "@postact/jsx",
  },
});
