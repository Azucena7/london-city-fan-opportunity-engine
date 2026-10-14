import test from "node:test";
import assert from "node:assert/strict";
import { parseRailStatus, railStatusUrl } from "../scripts/lib/tfl-rail.mjs";

test("only disrupted line statuses are kept, once per line and status", () => {
  const payload = [
    { id: "southeastern", name: "Southeastern", lineStatuses: [
      { statusSeverityDescription: "Part Closure", reason: "Southeastern:  No trains between Hayes and Elmers End  due to engineering works.", validityPeriods: [{ fromDate: "2026-11-08T00:00:00Z" }] },
      { statusSeverityDescription: "Part Closure", reason: "Southeastern:  No trains between Hayes and Elmers End  due to engineering works.", validityPeriods: [{ fromDate: "2026-11-08T12:00:00Z" }] }
    ] },
    { id: "thameslink", name: "Thameslink", lineStatuses: [{ statusSeverityDescription: "Good Service" }] }
  ];
  assert.deepEqual(parseRailStatus(payload), [
    { line: "Southeastern", status: "Part Closure", reason: "Southeastern: No trains between Hayes and Elmers End due to engineering works." }
  ]);
  assert.deepEqual(parseRailStatus([{ name: "Thameslink", lineStatuses: [{ statusSeverityDescription: "Information" }] }]), []);
  assert.throws(() => parseRailStatus({ message: "error" }), /not a list/);
});

test("each fixture day is read as its own date range", () => {
  const url = railStatusUrl("2026-11-08");
  assert.equal(url.pathname, "/Line/southeastern,thameslink/Status/2026-11-08T00:00:00/to/2026-11-08T23:59:59");
  assert.equal(url.searchParams.get("app_key"), null);
  assert.equal(railStatusUrl("2026-11-08", "k").searchParams.get("app_key"), "k");
});
