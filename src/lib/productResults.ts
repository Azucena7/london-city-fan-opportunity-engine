import { calendar, crmTicketingLive } from "@/lib/data";
import { buildRepeatCohort, summariseCrmTicketing } from "@/lib/crmTicketingMetrics";
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
};

export function getCurrentProductResults(): ProductResults | null {
  const opportunity = getCurrentProductOpportunity();
  if (!opportunity) return null;

  if (crmTicketingLive.datasetState !== "club-live") {
    return {
      fixtureId: opportunity.fixtureId,
      state: "requires-club-data",
      addressableRepeatCohort: null,
      campaignAttributedTickets: null,
      repeatPurchaseRate: null,
      grossTicketRevenue: null,
      scanRate: null,
      noShowRate: null,
      extractedAt: null
    };
  }

  const currentRecords = crmTicketingLive.records.filter(
    (row) => row.fixture_id === opportunity.fixtureId
  );

  if (!currentRecords.length) {
    return {
      fixtureId: opportunity.fixtureId,
      state: "requires-club-data",
      addressableRepeatCohort: opportunity.audience.value,
      campaignAttributedTickets: null,
      repeatPurchaseRate: null,
      grossTicketRevenue: null,
      scanRate: null,
      noShowRate: null,
      extractedAt: crmTicketingLive.extractedAt
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

  const summary = summariseCrmTicketing(currentRecords);
  const cohort = previousFixture
    ? buildRepeatCohort(crmTicketingLive.records, previousFixture.id, opportunity.fixtureId)
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
    noShowRate: summary.noShowRate,
    extractedAt: crmTicketingLive.extractedAt
  };
}
