import { calendar, campaignPlans, fixtures } from "@/lib/data";

export type ProductCase = {
  fixtureId: string | null;
  date: string;
  opponent: string;
  opportunityType: string;
  planningScore: number;
  decision: string;
  product: string;
  channel: string;
  message: string;
  territory: string;
  evidenceState: "live-decision-case" | "planning-model";
  campaignState: string | null;
};

function buildCase(date: string, opponent: string, opportunityType: string): ProductCase | null {
  const fixture = fixtures.find((item) => item.date === date && item.opponent === opponent);
  if (!fixture) return null;

  const calendarFixture = calendar.find((item) =>
    item.date === fixture.date &&
    item.opponent === fixture.opponent &&
    item.homeAway === "home"
  ) ?? null;

  const campaign = calendarFixture
    ? campaignPlans.campaigns.find((item) => item.fixtureId === calendarFixture.id) ?? null
    : null;

  return {
    fixtureId: calendarFixture?.id ?? null,
    date: fixture.date,
    opponent: fixture.opponent,
    opportunityType,
    planningScore: fixture.planningScore,
    decision: fixture.decision,
    product: fixture.product,
    channel: fixture.channel,
    message: fixture.message,
    territory: fixture.targetTerritory,
    evidenceState: campaign ? "live-decision-case" : "planning-model",
    campaignState: campaign?.status ?? null
  };
}

export function getFeaturedProductCases(): ProductCase[] {
  return [
    buildCase("2026-09-26", "Brighton & Hove Albion", "Repeat attendance"),
    buildCase("2026-10-18", "Everton", "Defend core"),
    buildCase("2026-11-22", "Crystal Palace", "Derby acquisition")
  ].filter((item): item is ProductCase => item !== null);
}
