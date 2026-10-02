import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const metrics = compile(await readFile(new URL("../src/lib/crmTicketingMetrics.ts", import.meta.url), "utf8"));
const source = (await readFile(new URL("../src/lib/postmatch.ts", import.meta.url), "utf8")).replace('"./crmTicketingMetrics"', JSON.stringify(metrics));
const { buildPostMatchScorecards } = await import(compile(source));
const fixture = { id: "test", date: "2026-09-26", opponent: "Test" };
const review = { fixtureId: "test", result: "2–0", attendance: 4177, attendanceState: "reported", dataGaps: ["tickets sold"] };
const build = row => buildPostMatchScorecards([fixture], [row], { fixtureId: "absent" }, new Date("2026-10-02"))[0];
test("reported attendance without tickets or occupancy renders pending rather than crashing", () => {
  const card = build(review);
  const byId = Object.fromEntries(card.metrics.map(m => [m.id, m]));
  assert.equal(byId.attendance.value, "4,177");
  assert.equal(byId.attendance.state, "public-reported");
  for (const id of ["tickets", "occupancy"]) {
    assert.equal(byId[id].value, "Pending");
    assert.equal(byId[id].state, "requires-access");
  }
});
test("missing or invalid counts are not converted to zero or claimed as evidence", () => {
  for (const value of [undefined, null, NaN, -1, Infinity]) {
    const card = build({ ...review, attendance: value, ticketsSold: value });
    for (const id of ["tickets", "attendance"]) assert.equal(card.metrics.find(m => m.id === id).state, "requires-access");
  }
  const zero = build({ ...review, ticketsSold: 0 }).metrics.find(m => m.id === "tickets");
  assert.equal(zero.value, "0");
  assert.equal(zero.state, "public-reported");
});
