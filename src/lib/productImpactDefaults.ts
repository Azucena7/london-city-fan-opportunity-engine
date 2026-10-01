import { calendar, crmTicketingLive } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export type ProductImpactDefaults = {
  audience: number | null;
  audienceSource: "measured" | "missing";
  conversionRate: number | null;
  conversionSource: "measured-history" | "illustrative";
  conversionLabel: string;
  ticketValue: number | null;
  ticketValueSource: "measured-history" | "illustrative";
  ticketValueLabel: string;
};

function priorHomeFixtures(currentFixtureId: string) {
  const current = calendar.find((item) => item.id === currentFixtureId);
  if (!current) return [];

  return calendar
    .filter((item) =>
      item.homeAway === "home" &&
      item.date < current.date &&
      (item.status === "final" || item.status === "completed-pending-data")
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getCurrentImpactDefaults(): ProductImpactDefaults {
  const opportunity = getCurrentProductOpportunity();

  if (!opportunity || crmTicketingLive.datasetState !== "club-aggregate") {
    return {
      audience: opportunity?.audience.value ?? null,
      audienceSource: opportunity?.audience.state === "measured" ? "measured" : "missing",
      conversionRate: null,
      conversionSource: "illustrative",
      conversionLabel: "No measured repeat-conversion baseline connected",
      ticketValue: null,
      ticketValueSource: "illustrative",
      ticketValueLabel: "No measured ticket-value baseline connected"
    };
  }

  const prior = priorHomeFixtures(opportunity.fixtureId);
  const latestPrior = prior[0] ?? null;
  const secondPrior = prior[1] ?? null;

  const latestSummary = latestPrior
    ? crmTicketingLive.fixtureSummaries.find((item) => item.fixtureId === latestPrior.id) ?? null
    : null;

  const historicalRepeat = latestPrior && secondPrior
    ? crmTicketingLive.repeatCohorts.find(
        (item) =>
          item.sourceFixtureId === secondPrior.id &&
          item.targetFixtureId === latestPrior.id
      ) ?? null
    : null;

  const conversionRate =
    historicalRepeat && historicalRepeat.sourceConsentedBuyers > 0
      ? historicalRepeat.alreadyPurchasedTarget / historicalRepeat.sourceConsentedBuyers
      : null;

  return {
    audience: opportunity.audience.value,
    audienceSource: opportunity.audience.state === "measured" ? "measured" : "missing",
    conversionRate,
    conversionSource: conversionRate === null ? "illustrative" : "measured-history",
    conversionLabel:
      conversionRate === null || !latestPrior || !secondPrior
        ? "No measured repeat-conversion baseline connected"
        : `Observed repeat purchase from ${secondPrior.opponent} → ${latestPrior.opponent}`,
    ticketValue: latestSummary?.averageTicketValue ?? null,
    ticketValueSource: latestSummary?.averageTicketValue === null || latestSummary?.averageTicketValue === undefined
      ? "illustrative"
      : "measured-history",
    ticketValueLabel:
      latestSummary?.averageTicketValue === null || latestSummary?.averageTicketValue === undefined || !latestPrior
        ? "No measured ticket-value baseline connected"
        : `Observed average ticket value · ${latestPrior.opponent}`
  };
}
