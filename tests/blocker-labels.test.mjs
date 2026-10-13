import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("every player blocker code has a plain-language label", () => {
  const source = readFileSync("src/lib/clubStrategy.ts", "utf8");
  const start = source.indexOf("export function activationBlockers");
  const body = source.slice(start, source.indexOf("\n}\n", start));
  const codes = new Set([...body.matchAll(/reasons\.push\("([a-zA-Z]+)"\)/g)].map((match) => match[1]));
  codes.add("budget");
  const labels = source.slice(source.indexOf("export const BLOCKER_LABELS"), source.indexOf("export function blockerLabel"));
  assert.ok(codes.size >= 10, "expected the activationBlockers codes to be found");
  for (const code of codes) assert.match(labels, new RegExp(`\\b${code}: "`), `${code} has no label`);
});

test("the constraints step lists who is affected before the recommendation", () => {
  const planner = readFileSync("src/components/PlayerAssetPlanner.tsx", "utf8");
  assert.match(planner, /aria-label="Constraints affecting this campaign"/);
  assert.ok(planner.indexOf('id="constraints"') < planner.indexOf('id="packs"'));
  assert.match(planner, /item\.blockers\.map\(blockerLabel\)/);
});
