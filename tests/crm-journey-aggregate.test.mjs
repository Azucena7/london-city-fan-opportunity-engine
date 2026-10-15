import test from "node:test";
import assert from "node:assert/strict";
import { aggregateCrmRecords, SMALL_CELL } from "../scripts/lib/crm-ticketing-aggregate.mjs";

// Synthetic ticket-grain rows generated in the test; nothing here is club data.
function row(index, overrides = {}) {
  return {
    schema_version: "1.0",
    fixture_id: "2026-10-18-eve-h",
    channel: "owned",
    supporter_id_hash: `supporter${String(index).padStart(4, "0")}`,
    order_id_hash: `order${String(index).padStart(5, "0")}`,
    ticket_id_hash: `ticket${String(index).padStart(5, "0")}`,
    order_timestamp: "2026-10-10T10:00:00Z",
    ticket_product: "Adult",
    quantity: 1,
    realised_unit_price: 12,
    currency: "GBP",
    scan_status: "scanned",
    // 18 Oct 2026 is British Summer Time: 12:30Z is 13:30 in London, 30 minutes before a 14:00 kickoff.
    scan_timestamp: "2026-10-18T12:30:00Z",
    consent_status: "consented",
    source_system: "test",
    extracted_at: "2026-10-19T09:00:00Z",
    ...overrides
  };
}

const kickoffs = { "2026-10-18-eve-h": { date: "2026-10-18", kickoff: "14:00" } };

test("season-ticket attendance is reported, with small groups suppressed", () => {
  const rows = [
    ...Array.from({ length: 20 }, (_, i) => row(i, { ticket_type: "season", scan_status: i < 15 ? "scanned" : "not_scanned", scan_timestamp: i < 15 ? "2026-10-18T12:30:00Z" : undefined })),
    ...Array.from({ length: 4 }, (_, i) => row(100 + i, { ticket_type: "hospitality" }))
  ];
  const [summary] = aggregateCrmRecords(rows, { kickoffs }).fixtureSummaries;
  assert.deepEqual(summary.ticketTypes.season, { tickets: 20, scans: 15 });
  assert.equal(summary.seasonTicketScanRate, 0.75);
  // Four hospitality tickets could single people out.
  assert.deepEqual(summary.ticketTypes.hospitality, { tickets: null, scans: null });
});

test("an export without ticket_type reports breakdowns as not supplied, never zero", () => {
  const [summary] = aggregateCrmRecords(Array.from({ length: 12 }, (_, i) => row(i)), { kickoffs }).fixtureSummaries;
  assert.equal(summary.ticketTypes, null);
  assert.equal(summary.seasonTicketScanRate, null);
});

test("entry timing groups scans by London time before kickoff", () => {
  const times = { "2026-10-18T11:30:00Z": 12, "2026-10-18T12:10:00Z": 11, "2026-10-18T12:45:00Z": 10, "2026-10-18T13:05:00Z": 3 };
  let index = 0;
  const rows = Object.entries(times).flatMap(([scan, count]) => Array.from({ length: count }, () => row(index++, { scan_timestamp: scan })));
  const [summary] = aggregateCrmRecords(rows, { kickoffs }).fixtureSummaries;
  assert.deepEqual(summary.entryTiming, {
    "more-than-60-before": 12,
    "60-to-30-before": 11,
    "30-to-0-before": 10,
    "after-kickoff": null,
    unknown: 0
  });
  assert.equal(aggregateCrmRecords(rows).fixtureSummaries[0].entryTiming, null, "without a kickoff there is no timing");
});

test("audiences are criteria for the club CRM with rounded sizes, never supporter lists", () => {
  const opener = Array.from({ length: 40 }, (_, i) => row(i, { fixture_id: "2026-09-04-mun-h", first_time_buyer: i < 25 }));
  const everton = Array.from({ length: 13 }, (_, i) => row(i, { ticket_id_hash: `evticket${String(i).padStart(4, "0")}`, order_id_hash: `evorder${String(i).padStart(4, "0")}` }));
  const output = aggregateCrmRecords([...opener, ...everton], { kickoffs });
  const repeat = output.audienceDefinitions.find((item) => item.id === "repeat-non-returners:2026-09-04-mun-h:2026-10-18-eve-h");
  assert.equal(repeat.estimatedSize, 30, "27 non-returners round to 30");
  assert.equal(repeat.execution, "club-crm");
  assert.deepEqual(repeat.criteria, { boughtFixture: "2026-09-04-mun-h", notBoughtFixture: "2026-10-18-eve-h", consent: "consented" });
  // Only forward-in-time cohorts become audiences.
  assert.equal(output.audienceDefinitions.some((item) => item.id.startsWith("repeat-non-returners:2026-10-18")), false);
  const firstTimers = output.audienceDefinitions.find((item) => item.id === "first-time-buyers:2026-09-04-mun-h");
  assert.equal(firstTimers.estimatedSize, 30, "25 first-time buyers round to the nearest ten");
  assert.equal(output.audienceDefinitions.find((item) => item.id === "season-no-shows:2026-09-04-mun-h").estimatedSize, null);
  for (const item of output.audienceDefinitions) assert.ok(item.estimatedSize === null || item.estimatedSize >= SMALL_CELL);
  assert.deepEqual(output.privacy, { smallCellThreshold: 10, audienceSizesRoundedTo: 10 });
  const serialised = JSON.stringify(output);
  assert.doesNotMatch(serialised, /supporter0|order0|ticket0|evticket/, "no supporter, order or ticket keys leave the importer");
});

test("an unknown ticket_type is rejected at import", () => {
  assert.throws(() => aggregateCrmRecords([row(1, { ticket_type: "vip" })]), /invalid ticket_type/);
});

test("supporter origins are postcode districts, counted once per supporter, with small districts folded away", () => {
  const rows = [
    // 14 supporters from BR1 (two sectors), one of them buying two tickets.
    ...Array.from({ length: 14 }, (_, i) => row(i, { postcode_sector: i % 2 ? "BR1 3" : "BR1 4", ticket_type: i < 11 ? "season" : "single" })),
    row(14, { supporter_id_hash: "supporter0000", postcode_sector: "BR1 4", ticket_id_hash: "ticket99999", order_id_hash: "order99999" }),
    // 12 from SE9 and 3 from DA1, which is too small to list.
    ...Array.from({ length: 12 }, (_, i) => row(100 + i, { postcode_sector: "SE9 5" })),
    ...Array.from({ length: 3 }, (_, i) => row(200 + i, { postcode_sector: "DA1 2" }))
  ];
  const { origins } = aggregateCrmRecords(rows, { kickoffs }).fixtureSummaries[0];
  assert.deepEqual(origins.all, {
    supporters: 29,
    districts: [{ district: "BR1", supporters: 14 }, { district: "SE9", supporters: 12 }],
    otherSupporters: null
  });
  assert.deepEqual(origins.seasonTicketHolders, { supporters: 11, districts: [{ district: "BR1", supporters: 11 }], otherSupporters: 0 });
  assert.doesNotMatch(JSON.stringify(origins), /BR1 3|BR1 4|DA1/, "sectors and small districts never appear");
});

test("an export without postcode sectors has no origins rather than empty ones", () => {
  assert.equal(aggregateCrmRecords(Array.from({ length: 12 }, (_, i) => row(i)), { kickoffs }).fixtureSummaries[0].origins, null);
});

test("the shared validator rejects supporter keys, small cells, fine origins and member lists", async () => {
  const { validateAggregate } = await import("../scripts/lib/crm-aggregate-validate.mjs");
  const output = aggregateCrmRecords(Array.from({ length: 30 }, (_, i) => row(i, { postcode_sector: "BR1 3", ticket_type: "season" })), { kickoffs });
  assert.deepEqual(validateAggregate(output), []);
  const tampered = structuredClone(output);
  tampered.fixtureSummaries[0].supporter_id_hash = "supporter0001";
  tampered.fixtureSummaries[0].entryTiming["after-kickoff"] = 3;
  tampered.fixtureSummaries[0].origins.all.districts.push({ district: "BR1 3", supporters: 12 });
  tampered.audienceDefinitions[0].members = ["supporter0001"];
  const errors = validateAggregate(tampered).join("\n");
  for (const expected of [/forbidden repository field supporter_id_hash/, /entryTiming.after-kickoff: small cell/, /postcode districts, never finer/, /never a list of supporters/]) {
    assert.match(errors, expected);
  }
  assert.deepEqual(validateAggregate(null), ["dataset must be an object"]);
});

test("the next fixture without sales still gets repeat audiences, marked as of the export", () => {
  const opener = Array.from({ length: 34 }, (_, i) => row(i, { fixture_id: "2026-09-04-mun-h" }));
  const everton = Array.from({ length: 12 }, (_, i) => row(100 + i));
  const output = aggregateCrmRecords([...opener, ...everton], { kickoffs, upcomingFixtureIds: ["2026-10-28-cry-h", "2026-10-18-eve-h", "2026-09-04-mun-h"] });
  const ahead = output.audienceDefinitions.filter((item) => item.criteria.notBoughtFixture === "2026-10-28-cry-h");
  assert.deepEqual(ahead.map((item) => [item.criteria.boughtFixture, item.estimatedSize]), [["2026-09-04-mun-h", 30], ["2026-10-18-eve-h", 10]]);
  assert.ok(ahead.every((item) => item.targetSalesInExport === false && item.execution === "club-crm"));
  // Fixtures already in the export, or before it, never get the "no sales yet" variant.
  assert.equal(output.audienceDefinitions.some((item) => item.targetSalesInExport === false && item.criteria.notBoughtFixture !== "2026-10-28-cry-h"), false);
});
