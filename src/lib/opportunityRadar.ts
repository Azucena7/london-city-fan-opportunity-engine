import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export type OpportunityRadarItem = {
  fixtureId: string;
  opponent: string;
  date: string;
  kickoff?: string;
  competition: string;
  venue: string;
  opportunity: string;
  opportunityLabel: string;
  confidence: "High" | "Medium" | "Low";
  decisionState: "READY FOR REVIEW" | "HOLD";
  daysToFixture: number;
  signalCount: number;
  materialSignalCount: number;
  lens: string[];
  radarState: "Act now" | "Review" | "Monitor";
  rank: number;
};

function priorityRank(
  score: number | null,
  confidence: "High" | "Medium" | "Low",
  daysToFixture: number,
  materialSignalCount: number,
  ready: boolean
) {
  const potential = score ?? 45;
  const confidenceWeight = confidence === "High" ? 14 : confidence === "Medium" ? 8 : 2;
  const urgencyWeight = daysToFixture <= 7 ? 14 : daysToFixture <= 21 ? 9 : daysToFixture <= 35 ? 5 : 1;
  const evidenceWeight = Math.min(materialSignalCount * 2, 10);
  return potential + confidenceWeight + urgencyWeight + evidenceWeight + (ready ? 8 : 0);
}

function radarState(rank: number, daysToFixture: number): OpportunityRadarItem["radarState"] {
  if (rank >= 92 || daysToFixture <= 7) return "Act now";
  if (rank >= 70 || daysToFixture <= 28) return "Review";
  return "Monitor";
}

export function buildOpportunityRadar(fixtureIds: string[]): OpportunityRadarItem[] {
  return fixtureIds
    .map((fixtureId) => getCurrentProductOpportunity(fixtureId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => {
      const materialSignalCount = item.liveSignals.filter((signal) => signal.materiality !== "low").length;
      const rank = priorityRank(
        item.score,
        item.confidence.label,
        item.daysToFixture,
        materialSignalCount,
        item.decisionState === "READY FOR REVIEW"
      );

      return {
        fixtureId: item.fixtureId,
        opponent: item.fixture.opponent,
        date: item.fixture.date,
        kickoff: item.fixture.kickoff,
        competition: item.fixture.competition,
        venue: item.fixture.venue,
        opportunity: item.opportunity,
        opportunityLabel: item.opportunityLabel,
        confidence: item.confidence.label,
        decisionState: item.decisionState,
        daysToFixture: item.daysToFixture,
        signalCount: item.liveSignals.length,
        materialSignalCount,
        lens: Array.from(new Set(item.liveSignals.map((signal) => signal.lens)))
          .filter((lens) => lens !== "General context")
          .slice(0, 3),
        radarState: radarState(rank, item.daysToFixture),
        rank
      };
    })
    .sort((a, b) => b.rank - a.rank || a.date.localeCompare(b.date));
}
