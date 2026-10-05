import type { CalendarFixture, CampaignPlanData, EventLandscapeData } from "@/lib/models";

export type CalendarRelationshipType =
  | "conflict"
  | "piggyback"
  | "sequence"
  | "bundling"
  | "audience-transfer"
  | "content-transfer"
  | "resource-efficiency"
  | "avoidance";

export type CalendarRelationship = {
  id: string;
  type: CalendarRelationshipType;
  secondaryTypes: CalendarRelationshipType[];
  strength: "high" | "medium" | "context";
  date: string;
  endDate?: string | null;
  title: string;
  rationale: string;
  fixtureIds: string[];
  sourceKind: "fixture" | "campaign" | "external-event";
  sourceLabel: string;
  sourceUrl?: string | null;
  evidence: string[];
  action: string;
};

function dayNumber(date: string) {
  const value = Date.parse(date + "T12:00:00Z");
  return Number.isNaN(value) ? null : Math.floor(value / 86400000);
}

function daysBetween(a: string, b: string) {
  const left = dayNumber(a);
  const right = dayNumber(b);
  return left === null || right === null ? null : Math.abs(right - left);
}

function fixtureLabel(fixture: CalendarFixture) {
  return (fixture.homeAway === "home" ? "v " : "at ") + fixture.opponent;
}

function dedupe(items: CalendarRelationship[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = [item.type,item.date,item.title,...item.fixtureIds].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildCalendarRelationships({
  fixtures,
  campaignPlans,
  eventLandscape,
  fromDate
}: {
  fixtures: CalendarFixture[];
  campaignPlans: CampaignPlanData;
  eventLandscape: EventLandscapeData;
  fromDate: string;
}): CalendarRelationship[] {
  const relationships: CalendarRelationship[] = [];
  const scheduled = fixtures
    .filter((fixture) => fixture.date >= fromDate)
    .sort((a,b) => a.date.localeCompare(b.date));

  for (const event of eventLandscape.events) {
    for (const score of event.fixtureScores ?? []) {
      if (score.level === "context" || score.score < 45) continue;
      const fixture = fixtures.find((item) => item.id === score.fixtureId);
      if (!fixture || fixture.date < fromDate) continue;

      const high = score.level === "high" || score.score >= 70;
      relationships.push({
        id: "external:" + event.id + ":" + fixture.id,
        type: high ? "conflict" : "avoidance",
        secondaryTypes: [],
        strength: high ? "high" : "medium",
        date: event.date,
        title: event.name + " competes with " + fixtureLabel(fixture),
        rationale: score.reasons.map((reason) => reason.en).join(" · ") || "External attention competition overlaps the fixture window.",
        fixtureIds: [fixture.id],
        sourceKind: "external-event",
        sourceLabel: event.sourceName ?? eventLandscape.source.name,
        sourceUrl: event.sourceUrl ?? event.url,
        evidence: [
          "Event score " + score.score,
          score.timeGapMinutes === null ? "Kick-off gap unknown" : score.timeGapMinutes + " min kick-off gap",
          event.city ? "Location: " + event.city : ""
        ].filter(Boolean),
        action: high
          ? "Review acquisition timing, channel pressure and operational load before committing the match plan."
          : "Keep the event visible when choosing campaign timing; no automatic plan change is implied."
      });
    }
  }

  for (let index = 0; index < scheduled.length - 1; index += 1) {
    const current = scheduled[index];
    const next = scheduled[index + 1];
    const gap = daysBetween(current.date,next.date);
    if (gap === null) continue;

    if (gap <= 4) {
      relationships.push({
        id: "fixture-pressure:" + current.id + ":" + next.id,
        type: "conflict",
        secondaryTypes: ["avoidance"],
        strength: gap <= 2 ? "high" : "medium",
        date: current.date,
        endDate: next.date,
        title: "Compressed fixture window · " + fixtureLabel(current) + " → " + fixtureLabel(next),
        rationale: "Only " + gap + " day" + (gap === 1 ? "" : "s") + " separate the two fixtures, increasing production, approval and player-coordination pressure.",
        fixtureIds: [current.id,next.id],
        sourceKind: "fixture",
        sourceLabel: "Official club calendar",
        evidence: [gap + "-day turnaround", current.competition, next.competition],
        action: "Sequence production and approvals across both fixtures before adding new scope."
      });
      continue;
    }

    if (gap <= 10 && next.homeAway === "home") {
      relationships.push({
        id: "fixture-sequence:" + current.id + ":" + next.id,
        type: "sequence",
        secondaryTypes: ["content-transfer","resource-efficiency"],
        strength: gap <= 7 ? "high" : "medium",
        date: current.date,
        endDate: next.date,
        title: "Sequence opportunity · " + fixtureLabel(current) + " → " + fixtureLabel(next),
        rationale: gap + " days separate the fixtures, creating a plausible window to reuse content, audience follow-up and production effort for the next home match.",
        fixtureIds: [current.id,next.id],
        sourceKind: "fixture",
        sourceLabel: "Official club calendar",
        evidence: [gap + "-day gap", "Next fixture is home: " + next.opponent],
        action: "Review whether content capture, CRM follow-up or production can be designed once for both fixture windows."
      });
    }
  }

  for (const campaign of campaignPlans.campaigns) {
    for (const item of campaign.schedule.filter((entry) => entry.state !== "complete")) {
      const clashes = scheduled.filter((fixture) => {
        if (fixture.id === campaign.fixtureId) return false;
        const gap = daysBetween(item.date,fixture.date);
        return gap !== null && gap <= 1;
      });

      for (const fixture of clashes) {
        const gap = daysBetween(item.date,fixture.date) ?? 0;
        relationships.push({
          id: "campaign-clash:" + campaign.id + ":" + item.date + ":" + fixture.id,
          type: "conflict",
          secondaryTypes: gap === 0 ? ["avoidance"] : [],
          strength: gap === 0 ? "high" : "medium",
          date: item.date < fixture.date ? item.date : fixture.date,
          endDate: item.date > fixture.date ? item.date : fixture.date,
          title: "Campaign work overlaps " + fixtureLabel(fixture),
          rationale: item.action.en + " for " + campaign.title.en + " is scheduled " + (gap === 0 ? "on the same day as" : "within one day of") + " another club fixture.",
          fixtureIds: [campaign.fixtureId,fixture.id],
          sourceKind: "campaign",
          sourceLabel: "AVELA campaign plan",
          evidence: [item.action.en, "Campaign date: " + item.date, "Fixture date: " + fixture.date],
          action: "Check team capacity and dependencies before keeping both execution windows unchanged."
        });
      }
    }
  }

  const priority = { high: 0, medium: 1, context: 2 } as const;
  return dedupe(relationships)
    .sort((a,b) => priority[a.strength] - priority[b.strength] || a.date.localeCompare(b.date))
    .slice(0, 40);
}
