import test from "node:test";
import assert from "node:assert/strict";
import { parseRoadDisruptions, HAYES_LANE } from "../scripts/lib/tfl-road.mjs";

const near = { lon: 0.02, lat: 51.40 };
const payload = [
  { id: "TIMS-1", point: `[${near.lon},${near.lat}]`, location: "[A21] Bromley Road", severity: "Moderate", category: "Works", subCategory: "Utility works", startDateTime: "2026-11-01T07:00:00Z", endDateTime: "2026-11-10T19:00:00Z", streets: [{ closure: "Partial Closure" }] },
  { id: "TIMS-2", point: "[0.03,51.395]", location: "Hayes Street", severity: "Minimal", category: "Works", subCategory: "Minor works", startDateTime: "2026-10-14T07:00:00Z", endDateTime: "2026-10-15T19:00:00Z", streets: [{ closure: "Open" }] },
  { id: "TIMS-3", point: "[-0.45,51.47]", location: "Heathrow", severity: "Serious", category: "Collisions", startDateTime: "2026-10-14T07:00:00Z" },
  { id: "TIMS-4", point: null, location: "No point", severity: "Severe" }
];

test("only incidents within the radius of Hayes Lane are kept, material ones first", () => {
  const incidents = parseRoadDisruptions(payload);
  assert.deepEqual(incidents.map((item) => item.id), ["TIMS-1", "TIMS-2"]);
  assert.equal(incidents[0].material, true, "a partial closure is material");
  assert.equal(incidents[1].material, false, "minimal works with the road open are not");
  assert.equal(incidents[0].startDate, "2026-11-01");
  assert.equal(incidents[0].endDate, "2026-11-10");
  assert.ok(incidents[0].distanceKm > 0 && incidents[0].distanceKm < 2);
});

test("WKT points are read too, and a malformed payload fails loudly", () => {
  const [item] = parseRoadDisruptions([{ id: "W", point: `POINT (${HAYES_LANE.lon} ${HAYES_LANE.lat})`, severity: "Severe" }]);
  assert.equal(item.distanceKm, 0);
  assert.equal(item.material, true);
  assert.throws(() => parseRoadDisruptions({ message: "error" }), /not a list/);
});
