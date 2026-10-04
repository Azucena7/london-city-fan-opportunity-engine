import type { MetadataRoute } from "next";

const base = "https://avela-growth-intelligence.vercel.app";
const updated = new Date("2026-10-03T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/for-clubs`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/case-study`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cases`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/live/london-city`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pilot`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 }
  ];
}
