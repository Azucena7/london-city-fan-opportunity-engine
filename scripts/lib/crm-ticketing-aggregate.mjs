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

export function validateCrmRecords(records) {
  const errors = [];
  const ticketIds = new Set();

  if (!Array.isArray(records) || records.length === 0) {
    return ["Import requires at least one ticket-grain record."];
  }

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
    if (typeof row.realised_unit_price !== "number" || row.realised_unit_price < 0) errors.push(`${ref}: realised_unit_price must be a non-negative number`);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.supporter_id_hash ?? "")) errors.push(`${ref}: supporter_id_hash is invalid`);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.order_id_hash ?? "")) errors.push(`${ref}: order_id_hash is invalid`);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(row.ticket_id_hash ?? "")) errors.push(`${ref}: ticket_id_hash is invalid`);
    if (row.scan_status === "scanned" && !row.scan_timestamp) errors.push(`${ref}: scanned ticket requires scan_timestamp`);
    if (row.scan_status !== "scanned" && row.scan_timestamp) errors.push(`${ref}: unscanned ticket cannot have scan_timestamp`);
    if (row.postcode_sector && !/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9]$/.test(row.postcode_sector)) errors.push(`${ref}: postcode_sector must be aggregated to sector level`);
    if (ticketIds.has(row.ticket_id_hash)) errors.push(`${ref}: duplicate ticket_id_hash`);
    ticketIds.add(row.ticket_id_hash);
  }

  return errors;
}

export function aggregateCrmRecords(records) {
  const errors = validateCrmRecords(records);
  if (errors.length) throw new Error(errors.join("\n"));

  const fixtureIds = [...new Set(records.map((row) => row.fixture_id))].sort();

  const fixtureSummaries = fixtureIds.map((fixtureId) => {
    const rows = records.filter((row) => row.fixture_id === fixtureId);
    const buyers = new Set(rows.map((row) => row.supporter_id_hash));
    const firstTimeBuyers = new Set(rows.filter((row) => row.first_time_buyer).map((row) => row.supporter_id_hash));
    const consentedBuyers = new Set(rows.filter((row) => row.consent_status === "consented").map((row) => row.supporter_id_hash));
    const postcodeSectors = new Set(rows.map((row) => row.postcode_sector).filter(Boolean));
    const scans = rows.filter((row) => row.scan_status === "scanned").length;
    const noShows = rows.filter((row) => row.scan_status === "not_scanned").length;
    const grossTicketRevenue = rows.reduce((sum, row) => sum + row.realised_unit_price, 0);

    return {
      fixtureId,
      tickets: rows.length,
      uniqueBuyers: buyers.size,
      scans,
      noShows,
      grossTicketRevenue,
      averageTicketValue: rows.length ? grossTicketRevenue / rows.length : null,
      firstTimeBuyers: firstTimeBuyers.size,
      consentedBuyers: consentedBuyers.size,
      campaignAttributedTickets: rows.filter((row) => row.campaign_id).length,
      postcodeSectors: postcodeSectors.size
    };
  });

  const repeatCohorts = [];
  for (const sourceFixtureId of fixtureIds) {
    for (const targetFixtureId of fixtureIds) {
      if (sourceFixtureId === targetFixtureId) continue;
      const sourceRows = records.filter((row) => row.fixture_id === sourceFixtureId);
      const targetRows = records.filter((row) => row.fixture_id === targetFixtureId);
      const sourceBuyers = new Set(sourceRows.map((row) => row.supporter_id_hash));
      const sourceConsentedBuyers = new Set(sourceRows.filter((row) => row.consent_status === "consented").map((row) => row.supporter_id_hash));
      const targetBuyers = new Set(targetRows.map((row) => row.supporter_id_hash));

      let alreadyPurchasedTarget = 0;
      let addressableConsentedNonReturners = 0;
      for (const supporterId of sourceConsentedBuyers) {
        if (targetBuyers.has(supporterId)) alreadyPurchasedTarget += 1;
        else addressableConsentedNonReturners += 1;
      }

      repeatCohorts.push({
        sourceFixtureId,
        targetFixtureId,
        sourceBuyers: sourceBuyers.size,
        sourceConsentedBuyers: sourceConsentedBuyers.size,
        alreadyPurchasedTarget,
        addressableConsentedNonReturners
      });
    }
  }

  const extractedAt = records.map((row) => row.extracted_at).filter(Boolean).sort().at(-1) ?? null;

  return {
    datasetState: "club-aggregate",
    scope: "club-crm-ticketing-aggregate",
    extractedAt,
    note: {
      en: "Authorised club CRM/ticketing data aggregated locally. No supporter, order or ticket hashes are stored in the repository.",
      es: "Datos autorizados de CRM/ticketing del club agregados localmente. No se almacenan hashes de aficionados, pedidos ni entradas en el repositorio."
    },
    fixtureSummaries,
    repeatCohorts
  };
}
