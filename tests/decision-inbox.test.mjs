import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/decisionInbox.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { filterInbox, inboxCounts, inboxOptions, isFiltered, emptyInboxFilter } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const item = (id, priority, extra = {}) => ({
  id, priority, category: "fixture", title: "v " + id, recommendation: "Recommend " + id, why: "Why " + id, changed: "Changed " + id, ...extra
});
const items = [
  item("Everton", "act-now", { owner: "Marketing" }),
  item("Palace", "review", { owner: "Ticketing", onHold: true }),
  item("Season tickets", "blocked", { category: "campaign", owner: "Marketing" }),
  item("Brighton", "review")
];

test("tabs count act-now, review and blocked, with holds counted as blocked", () => {
  assert.deepEqual(inboxCounts(items), { all: 4, "act-now": 1, review: 2, blocked: 2 });
  assert.deepEqual(filterInbox(items, { ...emptyInboxFilter, tab: "blocked" }).map((entry) => entry.id), ["Palace", "Season tickets"]);
});

test("filters narrow the list and never reorder the queue's ranking", () => {
  assert.deepEqual(filterInbox(items, { ...emptyInboxFilter, owner: "Marketing" }).map((entry) => entry.id), ["Everton", "Season tickets"]);
  assert.deepEqual(filterInbox(items, { ...emptyInboxFilter, category: "campaign" }).map((entry) => entry.id), ["Season tickets"]);
  assert.deepEqual(filterInbox(items, { ...emptyInboxFilter, query: "recommend palace" }).map((entry) => entry.id), ["Palace"]);
  assert.deepEqual(filterInbox(items, emptyInboxFilter).map((entry) => entry.id), items.map((entry) => entry.id));
});

test("filter options follow first-seen order and skip missing owners", () => {
  assert.deepEqual(inboxOptions(items, "owner"), ["Marketing", "Ticketing"]);
  assert.deepEqual(inboxOptions(items, "category"), ["fixture", "campaign"]);
  assert.equal(isFiltered(emptyInboxFilter), false);
  assert.equal(isFiltered({ ...emptyInboxFilter, query: "  " }), false);
  assert.equal(isFiltered({ ...emptyInboxFilter, tab: "review" }), true);
});
