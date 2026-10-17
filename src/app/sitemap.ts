import type { MetadataRoute } from "next";
import { currentState } from "@/lib/data";

const base = "https://avela-growth-intelligence.vercel.app";
const updated = new Date(currentState.updated_at);

// The fan matchday pages are an independent demonstration surface and are deliberately not indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/for-clubs`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/case-study`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cases`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/live/london-city`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/live/london-city/everton`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/live/london-city/brighton`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/pilot`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 }
  ];
}
