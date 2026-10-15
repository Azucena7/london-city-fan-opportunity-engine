import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compile = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
// Stub the data module: two fixtures and no live aggregate.
const dataStub = compile(`export const calendar = [
  { id: "2026-09-04-mun-h", date: "2026-09-04", opponent: "Manchester United" },
  { id: "2026-09-26-bha-h", date: "2026-09-26", opponent: "Brighton" },
  { id: "2026-10-18-eve-h", date: "2026-10-18", opponent: "Everton" }
];
export const crmTicketingLive = { datasetState: "requires-access", fixtureSummaries: [], repeatCohorts: [] };`);
const serverStub = compile("export const supabaseConfigured = () => false; export const supabaseRequest = async () => { throw new Error('no network in tests'); };");
const validatorUrl = new URL("../scripts/lib/crm-aggregate-validate.mjs", import.meta.url).href;
const source = (await readFile(new URL("../src/lib/supporterJourney.ts", import.meta.url), "utf8"))
  .replace('"@/lib/data"', JSON.stringify(dataStub))
  .replace('"@/lib/supabaseServer"', JSON.stringify(serverStub))
  .replace('"../../scripts/lib/crm-aggregate-validate.mjs"', JSON.stringify(validatorUrl));
const journey = await import(compile(source));

const aggregate = {
  datasetState: "club-aggregate",
  fixtureSummaries: [{ fixtureId: "2026-09-26-bha-h", tickets: 40 }],
  repeatCohorts: [],
  audienceDefinitions: [
    { id: "repeat-non-returners:2026-09-04-mun-h:2026-10-18-eve-h", purpose: "repeat-attendance", criteria: { boughtFixture: "2026-09-04-mun-h", notBoughtFixture: "2026-10-18-eve-h", consent: "consented" }, estimatedSize: 120, execution: "club-crm" },
    { id: "season-no-shows:2026-09-04-mun-h", purpose: "season-ticket-retention", criteria: { fixture: "2026-09-04-mun-h", ticketType: "season", scanStatus: "not_scanned", consent: "consented" }, estimatedSize: 30, execution: "club-crm" },
    { id: "season-no-shows:2026-09-26-bha-h", purpose: "season-ticket-retention", criteria: { fixture: "2026-09-26-bha-h", ticketType: "season", scanStatus: "not_scanned", consent: "consented" }, estimatedSize: 40, execution: "club-crm" },
    { id: "first-time-buyers:2026-09-26-bha-h", purpose: "second-visit", criteria: { fixture: "2026-09-26-bha-h", firstTimeBuyer: true, consent: "consented" }, estimatedSize: null, execution: "club-crm" }
  ]
};

test("before a fixture, AVELA suggests its non-returners and the latest earlier fixture's segments", () => {
  const ids = journey.audiencesForFixture(aggregate, "2026-10-18-eve-h").map((item) => item.id);
  assert.deepEqual(ids, ["repeat-non-returners:2026-09-04-mun-h:2026-10-18-eve-h", "season-no-shows:2026-09-26-bha-h", "first-time-buyers:2026-09-26-bha-h"]);
});

test("audiences read as plain criteria and never show a withheld size as a number", () => {
  const [repeat, , , firstTimers] = aggregate.audienceDefinitions;
  assert.equal(journey.describeAudience(repeat), "bought Manchester United (2026-09-04) · has not bought Everton (2026-10-18) · has consented to contact");
  assert.equal(journey.describeAudience(aggregate.audienceDefinitions[2]), "holds a season ticket · did not scan in at Brighton (2026-09-26) · has consented to contact");
  assert.equal(journey.audienceSizeLabel(repeat.estimatedSize), "About 120");
  assert.equal(journey.audienceSizeLabel(firstTimers.estimatedSize), "Under 10 · size withheld");
});

test("without an authorised club aggregate there is no journey and no audience", () => {
  const missing = { datasetState: "requires-access", fixtureSummaries: [{ fixtureId: "2026-09-26-bha-h" }], repeatCohorts: [], audienceDefinitions: aggregate.audienceDefinitions };
  assert.equal(journey.journeyForFixture(missing, "2026-09-26-bha-h"), null);
  assert.deepEqual(journey.audiencesForFixture(missing, "2026-10-18-eve-h"), []);
  assert.equal(journey.journeyForFixture(aggregate, "2026-09-26-bha-h").tickets, 40);
});

test("without club storage, every screen reads the repository dataset", async () => {
  assert.equal((await journey.getSupporterAggregate("club-1")).datasetState, "requires-access");
  assert.equal((await journey.getSupporterAggregate()).datasetState, "requires-access");
});
