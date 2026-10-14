import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/morningReadDigest.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { renderMorningReadDigest, movesDueThisWeek } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const move = (fixtureId, prepareBy, late = false) => ({
  fixtureId, opponent: fixtureId, date: "2026-10-28", move: `Move for ${fixtureId}.`, moveRecordedAt: null,
  ownerRole: "Ticketing & CRM", prepareBy, late, because: [], gates: [], measurement: ""
});
const lines = [
  { id: "pressure", label: "Attendance pressure", headline: "1 of the next 4 home fixtures face external attendance pressure", detail: "Everton <script>", state: "live" },
  { id: "transport", label: "Transport", headline: "Road and rail disruption is not connected yet", detail: null, state: "not-connected" }
];
const input = {
  today: "2026-10-14",
  refreshedAt: "2026-10-14T00:17:40.385Z",
  nextFixture: { opponent: "Everton", timingLabel: "T-4" },
  lines,
  moves: [move("later", "2026-10-30"), move("soon", "2026-10-21"), move("late", "2026-10-14", true)],
  siteUrl: "https://example.test/"
};

test("only drafts due within seven days are listed, late ones first", () => {
  assert.deepEqual(movesDueThisWeek(input.moves, input.today).map((item) => item.fixtureId), ["late", "soon"]);
});

test("the digest carries every line, its live state and the unapproved drafts", () => {
  const digest = renderMorningReadDigest(input);
  assert.equal(digest.subject, "AVELA Morning Commercial Read · Wed 14 Oct · Everton T-4");
  assert.match(digest.text, /TRANSPORT \[Not connected\]/);
  assert.match(digest.text, /ATTENDANCE PRESSURE \[Live\]/);
  assert.match(digest.text, /Move for soon\. Owner: Ticketing & CRM\. Prepare by Wed 21 Oct\. Not approved\./);
  assert.doesNotMatch(digest.text, /Move for later/);
  assert.match(digest.text, /https:\/\/example\.test\/app\/executive/);
  assert.match(digest.text, /demonstration environment/);
});

test("the HTML version escapes content and says when nothing is due", () => {
  const digest = renderMorningReadDigest({ ...input, moves: [] });
  assert.match(digest.html, /Everton &lt;script&gt;/);
  assert.doesNotMatch(digest.html, /<script>/);
  assert.match(digest.html, /No engine draft is due in the next seven days/);
});

test("the daily refresh sends the read only on daily runs, with recipients from secrets", () => {
  const workflow = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");
  const step = workflow.slice(workflow.indexOf("Send the Morning Commercial Read"));
  assert.match(step, /github\.event_name != 'push'/);
  assert.match(step, /continue-on-error: true/);
  assert.match(step, /MORNING_READ_TO: \$\{\{ secrets\.MORNING_READ_TO \}\}/);
  const script = readFileSync("scripts/send-morning-read.ts", "utf8");
  assert.doesNotMatch(script, /@(gmail|outlook|hotmail)\.com/);
  assert.match(script, /GITHUB_STEP_SUMMARY/);
  assert.match(readFileSync("package.json", "utf8"), /"send:morning-read": "npx -y tsx@4\.19\.2/);
});
