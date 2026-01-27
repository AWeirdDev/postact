import { defineConfig } from "rolldown";

export default defineConfig({
  input: ["./src/shared.ts", "./src/client.ts", "./src/server.ts"],
  output: [
    {
      dir: "./dist",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [],
});
