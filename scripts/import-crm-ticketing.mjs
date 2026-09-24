import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error("Usage: npm run import:crm -- <path-to-authorised-json-export>");
  process.exit(1);
}

const sourcePath = resolve(process.cwd(), sourceArg);
const targetPath = resolve(process.cwd(), "data/live/crm-ticketing.json");
const parsed = JSON.parse(await readFile(sourcePath, "utf8"));
const records = Array.isArray(parsed) ? parsed : parsed.records;

if (!Array.isArray(records) || records.length === 0) {
  console.error("Import requires a non-empty JSON array or an object with a non-empty records array.");
  process.exit(1);
}

const required = [
  "schema_version","fixture_id","channel","supporter_id_hash","order_id_hash","ticket_id_hash",
  "order_timestamp","ticket_product","quantity","realised_unit_price","currency","scan_status",
  "consent_status","source_system","extracted_at"
];
const forbidden = new Set([
  "name","first_name","last_name","email","phone","mobile","address","full_postcode",
  "date_of_birth","dob","payment_details","card_number","customer_name"
]);
const channels = new Set(["owned","partner","broadcast","paid","organic","direct","community","unknown"]);
const scanStates = new Set(["scanned","not_scanned","unknown"]);
const consentStates = new Set(["consented","not_consented","unknown"]);
const ticketIds = new Set();
const errors = [];

for (const [index, row] of records.entries()) {
  const ref = `row ${index + 1}`;

  if (!row || typeof row !== "object" || Array.isArray(row)) {
    errors.push(`${ref}: must be an object`);
    continue;
  }

  for (const key of Object.keys(row)) {
    if (forbidden.has(key.toLowerCase())) errors.push(`${ref}: forbidden direct-identifier field ${key}`);
  }

  for (const field of required) {
    if (row[field] === undefined || row[field] === null || row[field] === "") {
      errors.push(`${ref}: missing ${field}`);
    }
  }

  if (row.schema_version !== "1.0") errors.push(`${ref}: schema_version must be 1.0`);
  if (!channels.has(row.channel)) errors.push(`${ref}: invalid channel`);
  if (!scanStates.has(row.scan_status)) errors.push(`${ref}: invalid scan_status`);
  if (!consentStates.has(row.consent_status)) errors.push(`${ref}: invalid consent_status`);
  if (row.quantity !== 1) errors.push(`${ref}: quantity must equal 1`);
  if (row.currency !== "GBP") errors.push(`${ref}: currency must be GBP`);
  if (typeof row.realised_unit_price !== "number" || row.realised_unit_price < 0) {
    errors.push(`${ref}: realised_unit_price must be a non-negative number`);
  }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.supporter_id_hash ?? "")) {
    errors.push(`${ref}: supporter_id_hash is invalid`);
  }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.order_id_hash ?? "")) {
    errors.push(`${ref}: order_id_hash is invalid`);
  }
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.ticket_id_hash ?? "")) {
    errors.push(`${ref}: ticket_id_hash is invalid`);
  }
  if (row.scan_status === "scanned" && !row.scan_timestamp) {
    errors.push(`${ref}: scanned ticket requires scan_timestamp`);
  }
  if (row.scan_status !== "scanned" && row.scan_timestamp) {
    errors.push(`${ref}: unscanned ticket cannot have scan_timestamp`);
  }
  if (row.postcode_sector && !/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9]$/.test(row.postcode_sector)) {
    errors.push(`${ref}: postcode_sector must be aggregated to sector level`);
  }
  if (ticketIds.has(row.ticket_id_hash)) errors.push(`${ref}: duplicate ticket_id_hash`);
  ticketIds.add(row.ticket_id_hash);
}

if (errors.length) {
  console.error("CRM/ticketing import rejected:\n" + errors.join("\n"));
  process.exit(1);
}

const extractedAtValues = records.map((row) => row.extracted_at).filter(Boolean).sort();
const extractedAt = extractedAtValues.at(-1) ?? new Date().toISOString();

const output = {
  datasetState: "club-live",
  scope: "club-crm-ticketing",
  extractedAt,
  note: {
    en: "Authorised consent-safe club CRM/ticketing export. Direct identifiers remain outside scope.",
    es: "Export autorizado y seguro de CRM/ticketing del club. Los identificadores directos permanecen fuera de alcance."
  },
  records
};

await writeFile(targetPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  imported: records.length,
  uniqueTickets: ticketIds.size,
  fixtureIds: [...new Set(records.map((row) => row.fixture_id))].sort(),
  target: "data/live/crm-ticketing.json",
  state: "club-live"
}, null, 2));
