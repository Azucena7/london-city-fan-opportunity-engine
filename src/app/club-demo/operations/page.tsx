import type { Metadata } from "next";
import { calendar } from "@/lib/data";
import { ClubOperationsDemo } from "@/components/ClubOperationsDemo";

export const metadata: Metadata = { title: "Club operations · Full rehearsal", robots: { index: false, follow: false } };

export default function ClubOperationsPage() {
  const fixture = calendar.find((item) => item.id === "2026-10-18-eve-h");
  return <ClubOperationsDemo fixture={{ opponent: fixture?.opponent ?? "Everton", date: fixture?.date ?? "2026-10-18", venue: fixture?.venue ?? "Bromley" }} />;
}
