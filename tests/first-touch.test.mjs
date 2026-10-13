import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/firstTouch.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { externalCampaign, leadAttribution, readFirstTouch, serialiseFirstTouch } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const linkedIn = "?utm_source=linkedin&utm_medium=social&utm_campaign=launch&utm_content=post-1";
const navCta = "?utm_source=avela_nav&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=desktop";
const now = Date.parse("2026-10-13T12:00:00Z");

test("only external campaigns count as a first touch", () => {
  assert.equal(externalCampaign(linkedIn).utmSource, "linkedin");
  assert.equal(externalCampaign(navCta), null, "internal CTAs are not arrivals");
  assert.equal(externalCampaign(""), null, "direct visits carry no campaign");
});

test("a lead keeps the external campaign the visitor arrived with", () => {
  const stored = serialiseFirstTouch(externalCampaign(linkedIn), now);
  assert.deepEqual(leadAttribution(navCta, stored, now), { utmSource: "linkedin", utmMedium: "social", utmCampaign: "launch", utmContent: "post-1" });
});

test("without a first touch the lead uses the current page tags", () => {
  assert.equal(leadAttribution(navCta, null, now).utmSource, "avela_nav");
  assert.equal(leadAttribution("", null, now).utmSource, null);
});

test("expired or malformed first touches are ignored", () => {
  const old = serialiseFirstTouch(externalCampaign(linkedIn), now - 31 * 86_400_000);
  assert.equal(readFirstTouch(old, now), null);
  assert.equal(readFirstTouch("not json", now), null);
  assert.equal(readFirstTouch(JSON.stringify({ savedAt: now, tags: {} }), now), null);
});

test("the recorder runs on every page and the lead form uses it", async () => {
  const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const form = await readFile(new URL("../src/components/ClubPilotProposition.tsx", import.meta.url), "utf8");
  assert.match(layout, /<FirstTouchRecorder \/>/);
  assert.match(form, /leadAttribution\(window\.location\.search, storedFirstTouch\)/);
});
