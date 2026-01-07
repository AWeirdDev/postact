import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Postact",
  description: "Simple web dev.",
  base: "/postact/",

  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    zh: {
      label: "繁體中文",
      lang: "zh-Hant",
      link: "/zh/",
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            // make this `root` if you want to translate the default locale
            translations: {
              button: {
                buttonText: "搜尋",
                buttonAriaLabel: "搜尋",
              },
              modal: {
                displayDetails: "顯示詳細列表",
                resetButtonTitle: "清除",
                backButtonTitle: "關閉",
                noResultsText: "没有找到任何结果。字串：",
                footer: {
                  selectText: "選擇",
                  selectKeyAriaLabel: "輸入",
                  navigateText: "移動",
                  navigateUpKeyAriaLabel: "上箭頭",
                  navigateDownKeyAriaLabel: "下箭頭",
                  closeText: "關閉",
                  closeKeyAriaLabel: "esc",
                },
              },
            },
          },
        },
      },
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Intro", link: "/intro" },
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
            items: [
              {
                text: "Local storage",
                link: "/utilities/local-storage",
              },
            ],
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/AWeirdDev/postact" },
      { icon: "npm", link: "https://npmjs.com/package/@postact/core" },
    ],
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    // Explicitly load these languages for types highlighting
    languages: ["js", "jsx", "ts", "tsx"],
  },
});
