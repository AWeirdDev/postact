module.exports = {
  // Core Site Metadata
  siteTitle: "Postact",
  // Define a base URL for your site, crucial for SEO and absolute paths
  // No trailing slash
  siteUrl: "", // Replace with your actual deployed URL

  // Logo Configuration
  logo: {
    light: "", // Path relative to outputDir root
    dark: "", // Path relative to outputDir root
    alt: "logo", // Alt text for the logo
    href: "/", // Link for the logo, defaults to site root
  },

  // Directory Configuration
  srcDir: "docs", // Source directory for Markdown files
  outputDir: "site", // Directory for generated static site

  // Search Configuration
  search: true, // Enable/disable search functionality

  // Build Options
  minify: true, // Enable/disable HTML/CSS/JS minification

  // Sidebar Configuration
  sidebar: {
    collapsible: true, // or false to disable
    defaultCollapsed: false, // or true to start collapsed
  },

  // Theme Configuration
  theme: {
    name: "sky", // Themes: 'default', 'sky'
    defaultMode: "light", // Initial color mode: 'light' or 'dark'
    enableModeToggle: true, // Show UI button to toggle light/dark modes
    positionMode: "top", // 'top' or 'bottom' for the theme toggle
    codeHighlight: true, // Enable/disable codeblock highlighting and import of highlight.js
    customCss: [
      // Array of paths to custom CSS files
      // '/assets/css/custom.css', // Custom TOC styles
    ],
  },

  // Custom JavaScript Files
  customJs: [
    // Array of paths to custom JS files, loaded at end of body
    // '/assets/js/custom-script.js', // Paths relative to outputDir root
    "/assets/js/docmd-image-lightbox.js", // Image lightbox functionality
    "/assets/js/previews.mjs",
  ],

  // Content Processing
  autoTitleFromH1: true, // Set to true to automatically use the first H1 as page title
  copyCode: true, // Enable/disable the copy code button on code blocks

  // Plugins Configuration
  // Plugins are configured here. docmd will look for these keys.
  plugins: {
    // SEO Plugin Configuration
    // Most SEO data is pulled from page frontmatter (title, description, image, etc.)
    // These are fallbacks or site-wide settings.
    seo: {
      defaultDescription: "Simple web development, again.",
      openGraph: {
        // For Facebook, LinkedIn, etc.
        // siteName: 'docmd Documentation', // Optional, defaults to config.siteTitle
        // Default image for og:image if not specified in page frontmatter
        // Path relative to outputDir root
        defaultImage: "/assets/images/docmd-preview.png",
      },
      twitter: {
        // For Twitter Cards
        cardType: "summary_large_image", // 'summary', 'summary_large_image'
        // siteUsername: '@docmd_handle',    // Your site's Twitter handle (optional)
        // creatorUsername: '@your_handle',  // Default author handle (optional, can be overridden in frontmatter)
      },
    },
    // Analytics Plugin Configuration
    analytics: {
      // fuck trackers
    },
    // Enable Sitemap plugin
    sitemap: {
      defaultChangefreq: "weekly",
      defaultPriority: 0.8,
    },
    // Add other future plugin configurations here by their key
  },

  // "Edit this page" Link Configuration
  editLink: {
    enabled: true,
    // The URL to the folder containing your docs in the git repo
    // Note: It usually ends with /edit/main/docs or /blob/main/docs
    baseUrl: "https://github.com/AWeirdDev/postact/edit/main/docs",
    text: "Edit on GitHub",
  },

  // Navigation Structure (Sidebar)
  // Icons are kebab-case names from Lucide Icons (https://lucide.dev/)
  navigation: [
    { title: "Home", path: "/", icon: "home" },
    { title: "Dependent", path: "/dependent", icon: "" },
    {
      title: "Getting Started",
      icon: "rocket",
      path: "#",
      collapsible: false,
      children: [
        {
          title: "Documentation",
          path: "https://docmd.mgks.dev",
          icon: "scroll",
          external: true,
        },
        {
          title: "Installation",
          path: "https://docmd.mgks.dev/getting-started/installation",
          icon: "download",
          external: true,
        },
        {
          title: "Basic Usage",
          path: "https://docmd.mgks.dev/getting-started/basic-usage",
          icon: "play",
          external: true,
        },
        {
          title: "Content",
          path: "https://docmd.mgks.dev/content",
          icon: "layout-template",
          external: true,
        },
      ],
    },
    // External links:
    {
      title: "GitHub",
      path: "https://github.com/AWeirdDev/postact",
      icon: "github",
      external: true,
    },
  ],

  pageNavigation: true,

  footer: "© " + new Date().getFullYear() + " AWeirdDev",

  favicon: "/assets/favicon.ico",
};
