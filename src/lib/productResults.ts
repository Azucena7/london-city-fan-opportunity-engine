import { calendar, crmTicketingLive } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export type ProductResultsState = "measured" | "requires-club-data";

export type ProductResults = {
  fixtureId: string;
  state: ProductResultsState;
  addressableRepeatCohort: number | null;
  campaignAttributedTickets: number | null;
  repeatPurchaseRate: number | null;
  grossTicketRevenue: number | null;
  scanRate: number | null;
  noShowRate: number | null;
  extractedAt: string | null;
  interpretation: {
    attribution: "descriptive";
    incrementality: "not-established";
    causalClaim: false;
    requirement: string;
  };
};

export function getCurrentProductResults(): ProductResults | null {
  const opportunity = getCurrentProductOpportunity();
  if (!opportunity) return null;

  if (crmTicketingLive.datasetState !== "club-aggregate") {
    return {
      fixtureId: opportunity.fixtureId,
      state: "requires-club-data",
      addressableRepeatCohort: null,
      campaignAttributedTickets: null,
      repeatPurchaseRate: null,
      grossTicketRevenue: null,
      scanRate: null,
      noShowRate: null,
      extractedAt: null,
      interpretation: {
        attribution: "descriptive" as const,
        incrementality: "not-established" as const,
        causalClaim: false as const,
        requirement: "Requires a randomized holdout, credible control group, or pre-agreed counterfactual baseline."
      }
    };
  }

  const summary =
    crmTicketingLive.fixtureSummaries.find((item) => item.fixtureId === opportunity.fixtureId) ?? null;

  if (!summary) {
    return {
      fixtureId: opportunity.fixtureId,
      state: "requires-club-data",
      addressableRepeatCohort: opportunity.audience.value,
      campaignAttributedTickets: null,
      repeatPurchaseRate: null,
      grossTicketRevenue: null,
      scanRate: null,
      noShowRate: null,
      extractedAt: crmTicketingLive.extractedAt,
      interpretation: {
        attribution: "descriptive" as const,
        incrementality: "not-established" as const,
        causalClaim: false as const,
        requirement: "Requires a randomized holdout, credible control group, or pre-agreed counterfactual baseline."
      }
    };
  }

  const currentFixture = calendar.find((item) => item.id === opportunity.fixtureId) ?? null;
  const previousFixture = currentFixture
    ? calendar
        .filter((item) =>
          item.homeAway === "home" &&
          item.date < currentFixture.date &&
          (item.status === "final" || item.status === "completed-pending-data")
        )
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
    : null;

  const cohort = previousFixture
    ? crmTicketingLive.repeatCohorts.find(
        (item) =>
          item.sourceFixtureId === previousFixture.id &&
          item.targetFixtureId === opportunity.fixtureId
      ) ?? null
    : null;

  const scanBase = summary.scans + summary.noShows;
  const repeatPurchaseRate =
    cohort && cohort.sourceConsentedBuyers > 0
      ? cohort.alreadyPurchasedTarget / cohort.sourceConsentedBuyers
      : null;

  return {
    fixtureId: opportunity.fixtureId,
    state: "measured",
    addressableRepeatCohort: cohort?.addressableConsentedNonReturners ?? opportunity.audience.value,
    campaignAttributedTickets: summary.campaignAttributedTickets,
    repeatPurchaseRate,
    grossTicketRevenue: summary.grossTicketRevenue,
    scanRate: scanBase > 0 ? summary.scans / scanBase : null,
    noShowRate: scanBase > 0 ? summary.noShows / scanBase : null,
    extractedAt: crmTicketingLive.extractedAt,
    interpretation: {
        attribution: "descriptive" as const,
        incrementality: "not-established" as const,
        causalClaim: false as const,
        requirement: "Requires a randomized holdout, credible control group, or pre-agreed counterfactual baseline."
      }
  };
}
