import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/learningRecommendation.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { deriveNextFixtureLearning } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const opportunity = { fixtureId: "fixture-a" };
const measured = (overrides) => ({
  state: "measured",
  repeatPurchaseRate: 0.25,
  scanRate: 0.9,
  campaignAttributedTickets: 40,
  ...overrides
});

test("without measured results the learning stays provisional", () => {
  const learning = deriveNextFixtureLearning(opportunity, { state: "requires-club-data" });
  assert.equal(learning.evidenceState, "missing");
  assert.equal(learning.confidence, "Low");
  assert.match(learning.change, /Do not increase campaign scope or spend based on unmeasured outcomes/);
});

test("a missing scan rate never triggers a reminder-timing change", () => {
  const learning = deriveNextFixtureLearning(opportunity, measured({ scanRate: null }));
  assert.doesNotMatch(learning.change, /Tighten pre-match reminder timing/);
  assert.match(learning.change, /Connect scan status/);
  assert.equal(learning.evidenceState, "descriptive");
});

test("a measured low scan rate does recommend tighter reminders", () => {
  const learning = deriveNextFixtureLearning(opportunity, measured({ scanRate: 0.6 }));
  assert.match(learning.change, /Tighten pre-match reminder timing/);
});

test("a missing repeat rate is reported as unknown, not as weak repeat behaviour", () => {
  const learning = deriveNextFixtureLearning(opportunity, measured({ repeatPurchaseRate: null }));
  assert.match(learning.learned, /not measured yet/);
  assert.match(learning.repeat, /until repeat purchase is measured/);
  assert.equal(learning.confidence, "Low");
});

test("missing attribution asks for campaign identifiers, not a holdout", () => {
  const learning = deriveNextFixtureLearning(opportunity, measured({ campaignAttributedTickets: null }));
  assert.match(learning.measure, /Require campaign identifiers/);
  assert.equal(learning.evidenceState, "descriptive");
});

test("complete measured evidence gives medium confidence without causal claims", () => {
  const learning = deriveNextFixtureLearning(opportunity, measured({}));
  assert.equal(learning.evidenceState, "measured");
  assert.equal(learning.confidence, "Medium");
  assert.match(learning.measure, /holdout or credible comparison group/);
  assert.match(learning.rationale, /does not treat attributed tickets as causal lift/);
});
