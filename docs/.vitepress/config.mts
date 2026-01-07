import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Postact",
  description: "Simple web dev.",
  base: "/postact/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
    },
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
          {
            text: "States",
            link: "/states",
          },
          {
            text: "Dependents",
            link: "/dependents",
          },
          {
            text: "Later",
            link: "/later",
          },
          {
            text: "HTML",
            link: "/html",
          },
          {
            text: "Ref",
            link: "/ref",
          },
          {
            text: "Routes",
            link: "/routes",
          },
          {
            text: "Utilities",
            link: "/utilities",
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
