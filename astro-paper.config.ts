import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://ryanchristensen.net/",
    title: "Ryan Christensen",
    description:
      "Field notes on homelabs, infrastructure, and the software around them.",
    author: "Ryan Christensen",
    profile: "https://ryanchristensen.net/",
    ogImage: "og.png",
    lang: "en",
    timezone: "America/Chicago",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/d4rk22/ryanchristensen.net/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/d4rk22",
      linkTitle: "Ryan Christensen on GitHub",
    },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
