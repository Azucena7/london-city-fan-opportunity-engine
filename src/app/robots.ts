import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/for-clubs", "/case-study", "/live/london-city", "/pilot"],
      disallow: ["/app/", "/api/"]
    },
    sitemap: "https://avela-growth-intelligence.vercel.app/sitemap.xml"
  };
}
