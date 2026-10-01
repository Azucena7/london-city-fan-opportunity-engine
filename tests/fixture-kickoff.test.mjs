import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { reviewedKickoff } from "../scripts/lib/fixture-kickoff.mjs";

test("Everton's reviewed official time survives the generic feed and expires on a date change", () => {
  const calendar = JSON.parse(readFileSync(new URL("../data/seed/calendar.json", import.meta.url)));
  const everton = calendar.find((f) => f.id === "2026-10-18-eve-h");
  assert.equal(reviewedKickoff(everton, everton.date, "15:00"), "14:00");
  assert.equal(reviewedKickoff(everton, "2026-10-19", "16:00"), "16:00");
});

test("an unreviewed fixture continues to use the feed", () => {
  assert.equal(reviewedKickoff({ date: "2026-10-18" }, "2026-10-18", "15:00"), "15:00");
});
