import type { Metadata } from "next";
import { LocalizedToday } from "@/components/LocalizedToday";
import { calendar, currentState, fixtures, liveSignals, postMatchScorecards, roadmapItems } from "@/lib/data";
import { nextHomeFixture } from "@/lib/fixtures";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  const fixture = nextHomeFixture(fixtures);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextMatch = [...calendar]
    .filter((item) => item.status === "scheduled" && new Date(`${item.date}T12:00:00`).getTime() >= today.getTime())
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  if (!fixture) return null;

  return <LocalizedToday
    fixture={fixture}
    nextMatch={nextMatch}
    signals={liveSignals}
    current={currentState}
    scorecard={postMatchScorecards.find((item) => item.mode === "public") ?? null}
    roadmap={roadmapItems}
  />;
}
