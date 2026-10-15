import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/clubVenues.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { sanitiseVenues, matchVenue, occupancy, venueKey } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("fixture-feed spellings of the same ground resolve to one venue", () => {
  const [home] = sanitiseVenues([{ name: "CopperJax Community Stadium", home: true, totalCapacity: 5000 }]);
  for (const name of ["The CopperJax Community Stadium, Bromley", "The CopperJax Community Stadium", "copperjax community stadium"]) {
    assert.equal(matchVenue(name, [home])?.name, "CopperJax Community Stadium", name);
  }
  assert.equal(matchVenue("The Valley", [home]), null);
  assert.equal(venueKey("St. Andrew's @ Knightshead Park"), "st andrew s knightshead park");
});

test("aliases match too, and duplicates of the venue name are dropped", () => {
  const [venue] = sanitiseVenues([{ name: "Hayes Lane", aliases: ["CopperJax Community Stadium", "Hayes Lane", "", 7] }]);
  assert.deepEqual(venue.aliases, ["CopperJax Community Stadium"]);
  assert.equal(matchVenue("The CopperJax Community Stadium, Bromley", [venue])?.name, "Hayes Lane");
});

test("missing or invalid capacity stays unknown, never zero", () => {
  const venues = sanitiseVenues([
    { name: "A", totalCapacity: 0 },
    { name: "B", totalCapacity: -5, capacityState: "club-confirmed" },
    { name: "C", totalCapacity: "4,000" },
    { name: "D", totalCapacity: 250001 },
    { name: "E", totalCapacity: "3500", sellableCapacity: 4000, capacityState: "club-confirmed" }
  ]);
  for (const venue of venues.slice(0, 4)) {
    assert.equal(venue.totalCapacity, null, venue.name);
    assert.equal(venue.capacityState, "missing", venue.name);
    assert.equal(occupancy(1000, venue), null, venue.name);
  }
  // A sellable figure above the total is not trusted.
  assert.equal(venues[4].totalCapacity, 3500);
  assert.equal(venues[4].sellableCapacity, null);
  assert.equal(venues[4].capacityState, "club-confirmed");
});

test("occupancy uses the sellable figure and refuses unknown attendance", () => {
  const [venue] = sanitiseVenues([{ name: "Ground", totalCapacity: 5000, sellableCapacity: 4500 }]);
  assert.equal(venue.capacityState, "public-reported");
  assert.equal(occupancy(4500, venue), 1);
  assert.equal(occupancy(null, venue), null);
  assert.equal(occupancy(4500, null), null);
});

test("the list is bounded, deduplicated and rejects junk", () => {
  assert.deepEqual(sanitiseVenues("nope"), []);
  const many = sanitiseVenues(Array.from({ length: 15 }, (_, index) => ({ name: `Ground ${index}` })));
  assert.equal(many.length, 10);
  assert.equal(sanitiseVenues([{ name: "Same" }, { name: "The Same" }, null, { name: "  " }]).length, 1);
  const [dated] = sanitiseVenues([{ name: "X", asOf: "2026-13-40" }]);
  assert.equal(dated.asOf, null);
});

test("Club setup stores venues only when sent and keeps loading without the venues column", async () => {
  const route = await readFile(new URL("../src/app/api/club-setup/route.ts", import.meta.url), "utf8");
  assert.match(route, /"venues" in body \? \{ venues: sanitiseVenues\(body\.venues\) \}/);
  assert.match(route, /venuesAvailable/);
  assert.match(route, /venuesSaved = false/);
  const migration = await readFile(new URL("../supabase/migrations/20261015120000_club_setup_venues.sql", import.meta.url), "utf8");
  assert.match(migration, /add column if not exists venues jsonb not null default '\[\]'::jsonb/);
  assert.match(migration, /jsonb_array_length\(venues\) <= 10/);
});

test("the occupancy line names what is missing instead of guessing", async () => {
  const { occupancySummary } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  assert.equal(occupancySummary(4177, "The CopperJax Community Stadium", []).value, "Capacity not configured");
  const venues = sanitiseVenues([
    { name: "CopperJax Community Stadium", aliases: [], totalCapacity: 5000, sellableCapacity: 4600, capacityState: "club-confirmed" },
    { name: "The Valley" }
  ]);
  assert.deepEqual(occupancySummary(4177, "The CopperJax Community Stadium, Bromley", venues), { value: "91% of sellable capacity", detail: "CopperJax Community Stadium · club-confirmed capacity" });
  assert.equal(occupancySummary(undefined, "CopperJax Community Stadium", venues).value, "Attendance not recorded");
  assert.equal(occupancySummary(4177, "The Valley", venues).value, "Capacity missing");
  assert.equal(occupancySummary(4177, "Meadow Lane", venues).value, "Venue not configured");
});
