import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Postact",
  description: "Simple web dev.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/intro" },
    ],

    sidebar: [
      {
        text: "Docs",
        items: [
          {
            text: "Introduction",
            link: "/intro",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    // Explicitly load these languages for types highlighting
    languages: ["js", "jsx", "ts", "tsx"],
  },
});
