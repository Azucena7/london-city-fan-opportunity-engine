import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/for-clubs", "/case-study", "/cases", "/live/london-city", "/pilot"],
      disallow: ["/app/", "/api/", "/brief", "/opportunity", "/decision-room", "/impact", "/today", "/calendar", "/measurement", "/club-demo"]
    },
    sitemap: "https://avela-growth-intelligence.vercel.app/sitemap.xml"
  };
}
