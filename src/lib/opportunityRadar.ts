import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import type { ClubOperatingContext } from "@/lib/clubOperatingContext";

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
  clubFit: {
    matchedObjectives: string[];
    activationChannels: string[];
    summary: string;
    affectsRank: false;
  } | null;
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


const objectiveMatchers: Record<string, RegExp> = {
  "Repeat attendance": /repeat|return|reactivat|known supporter|dormant|retention/i,
  "Ticket conversion": /ticket|attendance|conversion|demand|sell[- ]?through/i,
  "Family acquisition": /family|families|grassroots|junior|school/i,
  "Local growth": /local|territor|community|grassroots|borough|nearby/i,
  "Revenue per fan": /revenue|commercial|partner|spend|matchday value|hospitality/i,
  "Retention": /retention|repeat|return|reactivat|known supporter|dormant/i
};

const channelMatchers: Record<string, RegExp> = {
  CRM: /crm|reactivat|retention|repeat|return|known supporter|dormant/i,
  Email: /email|reactivat|retention|repeat|return|known supporter|dormant/i,
  Instagram: /social|player|cultural|family|grassroots|awareness|reach|video/i,
  Facebook: /social|family|grassroots|community|local|awareness/i,
  TikTok: /social|player|cultural|youth|video|reach/i,
  Push: /reminder|matchday|kickoff|urgency|close to/i,
  SMS: /reminder|matchday|kickoff|urgency|close to/i,
  Web: /web|landing|ticket|conversion|information|destination/i
};

function deriveClubFit(
  text: string,
  context: ClubOperatingContext | null
): OpportunityRadarItem["clubFit"] {
  if (!context) return null;

  const matchedObjectives = context.priorityObjectives.filter((objective) =>
    objectiveMatchers[objective]?.test(text)
  );

  const activationChannels = context.connectedChannels.filter((channel) =>
    channelMatchers[channel]?.test(text)
  );

  let summary = "No direct club-priority match detected yet.";
  if (matchedObjectives.length && activationChannels.length) {
    summary = `Matches ${matchedObjectives.join(", ")} and has a plausible route through ${activationChannels.join(", ")}.`;
  } else if (matchedObjectives.length) {
    summary = `Matches ${matchedObjectives.join(", ")}, but no connected execution route is inferred yet.`;
  } else if (activationChannels.length) {
    summary = `No saved objective match, but ${activationChannels.join(", ")} could support execution if the club chooses to act.`;
  }

  return {
    matchedObjectives,
    activationChannels,
    summary,
    affectsRank: false
  };
}

function radarState(rank: number, daysToFixture: number): OpportunityRadarItem["radarState"] {
  if (rank >= 92 || daysToFixture <= 7) return "Act now";
  if (rank >= 70 || daysToFixture <= 28) return "Review";
  return "Monitor";
}

export function buildOpportunityRadar(
  fixtureIds: string[],
  clubContext: ClubOperatingContext | null = null
): OpportunityRadarItem[] {
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

      const clubFitText = [
        item.opportunity,
        item.opportunityLabel,
        item.recommendedAction,
        item.whyNow,
        ...item.liveSignals.flatMap((signal) => [signal.lens, signal.summary])
      ].join(" ");

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
        rank,
        clubFit: deriveClubFit(clubFitText, clubContext)
      };
    })
    .sort((a, b) => b.rank - a.rank || a.date.localeCompare(b.date));
}
