import type { MetadataRoute } from "next";
import { calendar, currentState } from "@/lib/data";

const base = "https://avela-growth-intelligence.vercel.app";
const updated = new Date(currentState.updated_at);

export default function sitemap(): MetadataRoute.Sitemap {
  const matchday = calendar
    .filter((item) => item.homeAway === "home")
    .map((item) => ({
      url: `${base}/matchday/${item.id}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));

  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/for-clubs`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/case-study`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cases`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/live/london-city`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/live/london-city/everton`, lastModified: updated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/live/london-city/brighton`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/pilot`, lastModified: updated, changeFrequency: "monthly", priority: 0.7 },
    ...matchday
  ];
}
