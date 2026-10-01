import { readFile } from "node:fs/promises";
import { aggregateCrmRecords } from "./lib/crm-ticketing-aggregate.mjs";

const demo = JSON.parse(await readFile(new URL("../data/demo/brighton-crm-ticketing.synthetic.json", import.meta.url), "utf8"));
const aggregate = aggregateCrmRecords(demo.records);

const currentFixtureId = "2026-09-26-bha-h";
const previousFixtureId = "2026-09-06-mun-h";
const current = aggregate.fixtureSummaries.find((item) => item.fixtureId === currentFixtureId);
const cohort = aggregate.repeatCohorts.find((item) =>
  item.sourceFixtureId === previousFixtureId && item.targetFixtureId === currentFixtureId
);

if (!current) throw new Error("Rehearsal is missing the current Brighton fixture summary.");
if (!cohort) throw new Error("Rehearsal is missing the opener → Brighton repeat cohort.");
if (current.campaignAttributedTickets <= 0) throw new Error("Rehearsal must exercise campaign attribution.");
if (cohort.sourceConsentedBuyers <= 0) throw new Error("Rehearsal must exercise a consented repeat cohort.");

const scanBase = current.scans + current.noShows;
const output = {
  mode: "synthetic-rehearsal",
  productionClaim: false,
  privacy: {
    repositoryStoresRawSupporterRecords: false,
    outputScope: aggregate.scope
  },
  opportunity: {
    audienceState: "measured-in-rehearsal",
    addressableRepeatCohort: cohort.addressableConsentedNonReturners,
    conversionEvidenceConnected: current.campaignAttributedTickets > 0
  },
  results: {
    campaignAttributedTickets: current.campaignAttributedTickets,
    grossTicketRevenue: current.grossTicketRevenue,
    repeatPurchaseRate: cohort.sourceConsentedBuyers > 0 ? cohort.alreadyPurchasedTarget / cohort.sourceConsentedBuyers : null,
    scanRate: scanBase > 0 ? current.scans / scanBase : null
  },
  interpretation: {
    attribution: "descriptive",
    incrementality: "not-established",
    causalClaim: false
  }
};

console.log(JSON.stringify(output, null, 2));
