import type { Metadata } from "next";
import { calendar } from "@/lib/data";
import { ClubWorkspaceDemo } from "@/components/ClubWorkspaceDemo";

export const metadata: Metadata = { title: "London City · Club workspace demo", robots: { index: false, follow: false } };

export default function ClubDemoPage() {
  const fixture = calendar.find((item) => item.id === "2026-10-18-eve-h");
  return <ClubWorkspaceDemo fixture={{ opponent: fixture?.opponent ?? "Everton", date: fixture?.date ?? "2026-10-18", kickoff: fixture?.kickoff ?? "14:00", venue: fixture?.venue ?? "Bromley" }} />;
}
