import { calendar, campaignPlans, fixtures } from "@/lib/data";

export type ProductCase = {
  fixtureId: string | null;
  date: string;
  opponent: string;
  opportunityType: "repeat" | "acquisition" | "defend-core" | "yield" | "other";
  planningScore: number;
  decision: string;
  product: string;
  channel: string;
  message: string;
  territory: string;
  evidenceState: "live-decision-case" | "planning-model";
  campaignState: string | null;
};

function classify(product: string, decision: string): ProductCase["opportunityType"] {
  const text = (product + " " + decision).toLowerCase();
  if (text.includes("repeat") || text.includes("retention")) return "repeat";
  if (text.includes("holder utilisation") || decision === "DEFEND CORE") return "defend-core";
  if (text.includes("premium") || text.includes("vip")) return "yield";
  if (text.includes("first-timer") || text.includes("family") || text.includes("derby")) return "acquisition";
  return "other";
}

export function getProductCases(): ProductCase[] {
  return fixtures
    .map((fixture) => {
      const calendarFixture = calendar.find((item) =>
        item.date === fixture.date && item.opponent === fixture.opponent && item.homeAway === "home"
      ) ?? null;
      const campaign = calendarFixture
        ? campaignPlans.campaigns.find((item) => item.fixtureId === calendarFixture.id) ?? null
        : null;

      return {
        fixtureId: calendarFixture?.id ?? null,
        date: fixture.date,
        opponent: fixture.opponent,
        opportunityType: classify(fixture.product, fixture.decision),
        planningScore: fixture.planningScore,
        decision: fixture.decision,
        product: fixture.product,
        channel: fixture.channel,
        message: fixture.message,
        territory: fixture.targetTerritory,
        evidenceState: campaign ? "live-decision-case" : "planning-model",
        campaignState: campaign?.status ?? null
      };
    })
    .filter((item) => new Date(item.date + "T12:00:00").getTime() >= new Date("2026-09-23T00:00:00Z").getTime())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getFeaturedProductCases() {
  const cases = getProductCases();
  const preferredTypes: ProductCase["opportunityType"][] = ["repeat", "defend-core", "acquisition"];
  const selected: ProductCase[] = [];

  for (const type of preferredTypes) {
    const match = cases.find((item) => item.opportunityType === type && !selected.some((chosen) => chosen.opponent === item.opponent));
    if (match) selected.push(match);
  }

  return selected;
}
