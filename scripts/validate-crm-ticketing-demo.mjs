import { readFile } from "node:fs/promises";

const path = new URL("../data/demo/brighton-crm-ticketing.synthetic.json", import.meta.url);
const dataset = JSON.parse(await readFile(path, "utf8"));
const required = ["schema_version", "fixture_id", "channel", "supporter_id_hash", "order_id_hash", "ticket_id_hash", "order_timestamp", "ticket_product", "quantity", "realised_unit_price", "currency", "scan_status", "consent_status", "source_system", "extracted_at"];
const forbidden = ["name", "email", "phone", "full_postcode", "date_of_birth", "payment_details"];
const channels = new Set(["owned", "partner", "broadcast", "paid", "organic", "direct", "community", "unknown"]);
const scanStates = new Set(["scanned", "not_scanned", "unknown"]);
const consentStates = new Set(["consented", "not_consented", "unknown"]);
const ticketIds = new Set();
const errors = [];

if (dataset.datasetState !== "synthetic-demo") errors.push("Dataset must be labelled synthetic-demo");
for (const [index, row] of dataset.records.entries()) {
  const ref = `row ${index + 1}`;
  for (const field of required) if (row[field] === undefined || row[field] === null || row[field] === "") errors.push(`${ref}: missing ${field}`);
  for (const field of forbidden) if (field in row) errors.push(`${ref}: forbidden field ${field}`);
  if (row.schema_version !== "1.0") errors.push(`${ref}: unsupported schema_version`);
  if (row.fixture_id !== dataset.fixtureId) errors.push(`${ref}: fixture_id does not match dataset fixture`);
  if (!channels.has(row.channel)) errors.push(`${ref}: invalid channel`);
  if (!scanStates.has(row.scan_status)) errors.push(`${ref}: invalid scan_status`);
  if (!consentStates.has(row.consent_status)) errors.push(`${ref}: invalid consent_status`);
  if (row.quantity !== 1) errors.push(`${ref}: quantity must be 1 at ticket grain`);
  if (row.currency !== "GBP") errors.push(`${ref}: currency must be GBP`);
  if (row.realised_unit_price < 0) errors.push(`${ref}: negative realised_unit_price`);
  if (row.scan_status === "scanned" && !row.scan_timestamp) errors.push(`${ref}: scanned ticket requires scan_timestamp`);
  if (row.scan_status !== "scanned" && row.scan_timestamp) errors.push(`${ref}: unscanned ticket cannot have scan_timestamp`);
  if (ticketIds.has(row.ticket_id_hash)) errors.push(`${ref}: duplicate ticket_id_hash`);
  ticketIds.add(row.ticket_id_hash);
  if (row.postcode_sector && !/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9]$/.test(row.postcode_sector)) errors.push(`${ref}: postcode_sector is not aggregated to sector level`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  const scans = dataset.records.filter((row) => row.scan_status === "scanned").length;
  const noShows = dataset.records.filter((row) => row.scan_status === "not_scanned").length;
  const buyers = new Set(dataset.records.map((row) => row.supporter_id_hash));
  const revenue = dataset.records.reduce((sum, row) => sum + row.realised_unit_price, 0);
  const attributed = dataset.records.filter((row) => row.campaign_id).length;

  if (dataset.records.length !== 12) errors.push("Synthetic rehearsal should contain 12 ticket rows");
  if (buyers.size !== 10) errors.push("Synthetic rehearsal should contain 10 unique buyers");
  if (scans !== 10) errors.push("Synthetic rehearsal should contain 10 scans");
  if (noShows !== 2) errors.push("Synthetic rehearsal should contain 2 no-shows");
  if (revenue !== 156) errors.push("Synthetic rehearsal gross ticket revenue should equal GBP 156");
  if (attributed !== 10) errors.push("Synthetic rehearsal should contain 10 campaign-attributed tickets");

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      state: dataset.datasetState,
      records: dataset.records.length,
      uniqueTickets: ticketIds.size,
      uniqueBuyers: buyers.size,
      scans,
      noShows,
      grossTicketRevenue: revenue,
      campaignAttributedTickets: attributed
    }, null, 2));
  }
}
