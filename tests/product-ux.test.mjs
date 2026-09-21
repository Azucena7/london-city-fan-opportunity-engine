import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("source register uses unique ids and declared states", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const states = new Set(["operational", "degraded", "blocked", "not-configured", "requires-access"]);
  assert.equal(new Set(data.sources.map((source) => source.id)).size, data.sources.length);
  assert.ok(data.sources.every((source) => states.has(source.state)));
});

test("actionable source failures name the next owner action", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const actionable = data.sources.filter((source) => ["blocked", "not-configured"].includes(source.state));
  assert.ok(actionable.length > 0);
  assert.ok(actionable.every((source) => source.ownerAction?.en && source.ownerAction?.es));
});

test("operational modules are reachable from global navigation", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const route of ["/access", "/measurement", "/partners", "/sources"]) {
    assert.ok(nav.includes(`\"${route}\"`), `${route} should be visible in global navigation`);
  }
});

test("navigation names describe the internal product and fan-facing output", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const label of ["Fan Experience", "Matchday Access", "Partnerships", "Data & Sources"]) {
    assert.ok(nav.includes(label), `${label} should be visible in English navigation`);
  }
  for (const label of ["Experiencia del aficionado", "Acceso al partido", "Alianzas", "Datos y fuentes"]) {
    assert.ok(nav.includes(label), `${label} should be visible in Spanish navigation`);
  }
  assert.match(nav, /Product evaluation/);
  assert.match(nav, /Operational tools/);
});

test("document language and keyboard bypass are part of the root shell", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /lang=\{initialLang\}/);
  assert.match(layout, /className="skipLink"/);
  assert.match(layout, /href="#main-content"/);
});
