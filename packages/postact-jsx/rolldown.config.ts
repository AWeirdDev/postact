import { defineConfig } from "rolldown";

export default defineConfig({
  input: ["./jsx-runtime.ts", "./jsx-dev-runtime.ts"],
  output: [
    {
      dir: "./dist",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [],
});
