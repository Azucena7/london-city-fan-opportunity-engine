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
// Optional: how the ticket was held. Season-ticket holders are the club's core recurring audience.
const ticketTypes = new Set(["season","single","hospitality","complimentary","unknown"]);

// Breakdowns and audience sizes below this many supporters are suppressed (shown as null), so a
// segment can never single out a handful of people. Audience sizes are also rounded to tens.
export const SMALL_CELL = 10;
const suppress = (count) => (count > 0 && count < SMALL_CELL ? null : count);
const roundedSize = (count) => (count < SMALL_CELL ? null : Math.round(count / 10) * 10);

// Minutes from a scan to kickoff, in London local time. Positive means before kickoff.
function minutesBeforeKickoff(scanTimestamp, kickoff) {
  if (!kickoff?.date || !/^\d{2}:\d{2}$/.test(kickoff.kickoff ?? "")) return null;
  const scan = new Date(scanTimestamp);
  if (Number.isNaN(scan.getTime())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(scan).map((part) => [part.type, part.value]));
  if (`${parts.year}-${parts.month}-${parts.day}` !== kickoff.date) return null;
  const [hour, minute] = kickoff.kickoff.split(":").map(Number);
  return hour * 60 + minute - (Number(parts.hour) * 60 + Number(parts.minute));
}

function entryBand(minutes) {
  if (minutes === null) return "unknown";
  if (minutes > 60) return "more-than-60-before";
  if (minutes > 30) return "60-to-30-before";
  if (minutes >= 0) return "30-to-0-before";
  return "after-kickoff";
}

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
    if (row.ticket_type !== undefined && row.ticket_type !== null && !ticketTypes.has(row.ticket_type)) errors.push(`${ref}: invalid ticket_type`);
    if (ticketIds.has(row.ticket_id_hash)) errors.push(`${ref}: duplicate ticket_id_hash`);
    ticketIds.add(row.ticket_id_hash);
  }

  return errors;
}

/**
 * @param records ticket-grain rows (external, never stored)
 * @param options.kickoffs fixtureId → { date: "YYYY-MM-DD", kickoff: "HH:MM" } in London time, for entry timing
 */
export function aggregateCrmRecords(records, options = {}) {
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
      postcodeSectors: postcodeSectors.size,
      ...journeyBreakdowns(rows, options.kickoffs?.[fixtureId])
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
  const audienceDefinitions = buildAudienceDefinitions(records, fixtureIds, repeatCohorts);

  return {
    datasetState: "club-aggregate",
    scope: "club-crm-ticketing-aggregate",
    extractedAt,
    note: {
      en: "Authorised club CRM/ticketing data aggregated locally. No supporter, order or ticket hashes are stored in the repository.",
      es: "Datos autorizados de CRM/ticketing del club agregados localmente. No se almacenan hashes de aficionados, pedidos ni entradas en el repositorio."
    },
    privacy: { smallCellThreshold: SMALL_CELL, audienceSizesRoundedTo: 10 },
    fixtureSummaries,
    repeatCohorts,
    audienceDefinitions
  };
}

// Where supporters travel from, by postcode district ("BR1" from sector "BR1 3"): coarser than the
// imported sector, counted once per supporter, small districts folded into "other".
const ORIGIN_DISTRICTS = 12;
function originDistricts(rows) {
  const located = rows.filter((row) => row.postcode_sector);
  if (!located.length) return null;
  const count = (subset) => {
    const bySupporter = new Map(subset.map((row) => [row.supporter_id_hash, row.postcode_sector.split(" ")[0]]));
    const tally = new Map();
    for (const district of bySupporter.values()) tally.set(district, (tally.get(district) ?? 0) + 1);
    const ranked = [...tally].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const shown = ranked.filter(([, n]) => n >= SMALL_CELL).slice(0, ORIGIN_DISTRICTS);
    const other = bySupporter.size - shown.reduce((sum, [, n]) => sum + n, 0);
    return {
      supporters: suppress(bySupporter.size),
      districts: shown.map(([district, supporters]) => ({ district, supporters })),
      // Everyone outside the shown districts, itself suppressed when small.
      otherSupporters: suppress(other)
    };
  };
  const season = located.filter((row) => row.ticket_type === "season");
  return { all: count(located), seasonTicketHolders: season.length ? count(season) : null };
}

// Season-ticket attendance and entry timing for one fixture, with small cells suppressed.
function journeyBreakdowns(rows, kickoff) {
  const typed = rows.filter((row) => ticketTypes.has(row.ticket_type));
  const byType = {};
  for (const type of ticketTypes) {
    const ofType = typed.filter((row) => row.ticket_type === type);
    if (!ofType.length) continue;
    byType[type] = { tickets: suppress(ofType.length), scans: suppress(ofType.filter((row) => row.scan_status === "scanned").length) };
  }
  const season = typed.filter((row) => row.ticket_type === "season");
  const seasonScans = season.filter((row) => row.scan_status === "scanned").length;

  let entryTiming = null;
  if (kickoff) {
    const bands = { "more-than-60-before": 0, "60-to-30-before": 0, "30-to-0-before": 0, "after-kickoff": 0, unknown: 0 };
    for (const row of rows.filter((item) => item.scan_status === "scanned")) bands[entryBand(minutesBeforeKickoff(row.scan_timestamp, kickoff))] += 1;
    entryTiming = Object.fromEntries(Object.entries(bands).map(([band, count]) => [band, suppress(count)]));
  }

  return {
    // Null when the export carries no ticket_type, so "not supplied" never reads as zero.
    ticketTypes: typed.length ? byType : null,
    seasonTicketScanRate: season.length >= SMALL_CELL ? seasonScans / season.length : null,
    entryTiming,
    origins: originDistricts(rows)
  };
}

// Segment definitions the club's CRM can build and send. AVELA shares criteria and a rounded
// size only: never a list of supporters. Consented supporters only.
function buildAudienceDefinitions(records, fixtureIds, repeatCohorts) {
  const definitions = [];
  const consented = records.filter((row) => row.consent_status === "consented");
  for (const cohort of repeatCohorts) {
    if (cohort.sourceFixtureId >= cohort.targetFixtureId) continue;
    definitions.push({
      id: `repeat-non-returners:${cohort.sourceFixtureId}:${cohort.targetFixtureId}`,
      purpose: "repeat-attendance",
      criteria: { boughtFixture: cohort.sourceFixtureId, notBoughtFixture: cohort.targetFixtureId, consent: "consented" },
      estimatedSize: roundedSize(cohort.addressableConsentedNonReturners)
    });
  }
  for (const fixtureId of fixtureIds) {
    const rows = consented.filter((row) => row.fixture_id === fixtureId);
    const seasonNoShows = new Set(rows.filter((row) => row.ticket_type === "season" && row.scan_status === "not_scanned").map((row) => row.supporter_id_hash));
    const firstTimers = new Set(rows.filter((row) => row.first_time_buyer).map((row) => row.supporter_id_hash));
    definitions.push(
      {
        id: `season-no-shows:${fixtureId}`,
        purpose: "season-ticket-retention",
        criteria: { fixture: fixtureId, ticketType: "season", scanStatus: "not_scanned", consent: "consented" },
        estimatedSize: roundedSize(seasonNoShows.size)
      },
      {
        id: `first-time-buyers:${fixtureId}`,
        purpose: "second-visit",
        criteria: { fixture: fixtureId, firstTimeBuyer: true, consent: "consented" },
        estimatedSize: roundedSize(firstTimers.size)
      }
    );
  }
  return definitions.map((definition) => ({ ...definition, execution: "club-crm" }));
}
