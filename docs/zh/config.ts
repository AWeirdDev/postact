import { createRequire } from "module";
import { defineAdditionalConfig, type DefaultTheme } from "vitepress";

const require = createRequire(import.meta.url);
const pkg = require("vitepress/package.json");

export default defineAdditionalConfig({
  description: "由 Vite 和 Vue 驱动的静态站点生成器",

  themeConfig: {
    nav: [
      { text: "首頁", link: "/zh/" },
      { text: "介紹", link: "/zh/intro" },
    ],

    editLink: {
      text: "在 GitHub 上編輯此頁面",
    },

    docFooter: {
      prev: "上一頁",
      next: "下一頁",
    },

    outline: {
      label: "大綱",
    },

    lastUpdated: {
      text: "最後更新於",
    },

    notFound: {
      title: "這是哪裡？",
      quote:
        "80-90% 是我的問題，只有那微小的概率是你在玩我的網站。如果這裡挺 boring 的話，你可以看看別的地方。",
      linkLabel: "首頁",
      linkText: "首頁",
    },

    langMenuLabel: "選擇語言",
    returnToTopLabel: "回頂部",
    sidebarMenuLabel: "選單",
    darkModeSwitchLabel: "佈景主題",
    lightModeSwitchTitle: "切換到淺色模式",
    darkModeSwitchTitle: "切換到深色模式",
    skipToContentLabel: "跳轉到內容區塊",
  },
});
