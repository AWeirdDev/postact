/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  // ---- Library mode (optional) ----
  // Uncomment if you want Vite to build the lib for preview
  // build: {
  //   lib: {
  //     entry: 'src/index.ts',
  //     formats: ['es', 'cjs'],
  //     fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
  //   },
  //   rollupOptions: { external: [] },
  // },
});

// fyi i used ai here because idk how to deal with ts
// fuck it
