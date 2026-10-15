// Privacy and consistency rules for a club journey aggregate. Shared by the local validator
// (scripts/validate-crm-ticketing-live.mjs) and the server that stores club uploads, so both
// reject exactly the same things: supporter keys, small cells, finer-than-district origins,
// and audiences that carry member lists.

/** @returns {string[]} errors; empty when the dataset is safe to store */
export function validateAggregate(dataset) {
  if (!dataset || typeof dataset !== "object" || Array.isArray(dataset)) return ["dataset must be an object"];
  const errors = [];
  const forbiddenKeys = new Set([
    "records","supporter_id_hash","order_id_hash","ticket_id_hash","name","email","phone",
    "full_postcode","date_of_birth","payment_details"
  ]);

  function scanForbidden(value, ref = "dataset") {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scanForbidden(item, `${ref}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeys.has(key)) errors.push(`${ref}: forbidden repository field ${key}`);
      scanForbidden(child, `${ref}.${key}`);
    }
  }

  scanForbidden(dataset);

  if (!["requires-access","club-aggregate"].includes(dataset.datasetState)) {
    errors.push("datasetState must be requires-access or club-aggregate");
  }
  if (dataset.scope !== "club-crm-ticketing-aggregate") {
    errors.push("scope must be club-crm-ticketing-aggregate");
  }
  if (!Array.isArray(dataset.fixtureSummaries)) errors.push("fixtureSummaries must be an array");
  if (!Array.isArray(dataset.repeatCohorts)) errors.push("repeatCohorts must be an array");

  if (dataset.datasetState === "requires-access") {
    if (dataset.extractedAt !== null) errors.push("requires-access dataset must have extractedAt=null");
    if (dataset.fixtureSummaries?.length) errors.push("requires-access dataset must not contain fixture summaries");
    if (dataset.repeatCohorts?.length) errors.push("requires-access dataset must not contain repeat cohorts");
  }

  if (dataset.datasetState === "club-aggregate") {
    if (!dataset.extractedAt) errors.push("club-aggregate dataset requires extractedAt");
    if (!dataset.fixtureSummaries?.length) errors.push("club-aggregate dataset requires fixture summaries");
  }

  const fixtureIds = new Set();
  for (const [index, item] of (dataset.fixtureSummaries ?? []).entries()) {
    const ref = `fixtureSummaries[${index}]`;
    if (!item.fixtureId) errors.push(`${ref}: missing fixtureId`);
    if (fixtureIds.has(item.fixtureId)) errors.push(`${ref}: duplicate fixtureId`);
    fixtureIds.add(item.fixtureId);

    for (const field of [
      "tickets","uniqueBuyers","scans","noShows","grossTicketRevenue","firstTimeBuyers",
      "consentedBuyers","campaignAttributedTickets","postcodeSectors"
    ]) {
      if (typeof item[field] !== "number" || item[field] < 0) {
        errors.push(`${ref}: ${field} must be a non-negative number`);
      }
    }
    if (item.averageTicketValue !== null &&
        (typeof item.averageTicketValue !== "number" || item.averageTicketValue < 0)) {
      errors.push(`${ref}: averageTicketValue must be null or non-negative`);
    }
    if (item.scans + item.noShows > item.tickets) errors.push(`${ref}: scans + noShows cannot exceed tickets`);
    if (item.campaignAttributedTickets > item.tickets) errors.push(`${ref}: attributed tickets cannot exceed tickets`);
    if (item.consentedBuyers > item.uniqueBuyers) errors.push(`${ref}: consented buyers cannot exceed unique buyers`);
  }

  const cohortKeys = new Set();
  for (const [index, item] of (dataset.repeatCohorts ?? []).entries()) {
    const ref = `repeatCohorts[${index}]`;
    const key = `${item.sourceFixtureId}->${item.targetFixtureId}`;
    if (!item.sourceFixtureId || !item.targetFixtureId) errors.push(`${ref}: fixture ids are required`);
    if (item.sourceFixtureId === item.targetFixtureId) errors.push(`${ref}: source and target fixtures must differ`);
    if (cohortKeys.has(key)) errors.push(`${ref}: duplicate cohort pair`);
    cohortKeys.add(key);

    for (const field of [
      "sourceBuyers","sourceConsentedBuyers","alreadyPurchasedTarget","addressableConsentedNonReturners"
    ]) {
      if (typeof item[field] !== "number" || item[field] < 0) {
        errors.push(`${ref}: ${field} must be a non-negative number`);
      }
    }
    if (item.sourceConsentedBuyers > item.sourceBuyers) errors.push(`${ref}: consented source buyers cannot exceed source buyers`);
    if (item.alreadyPurchasedTarget + item.addressableConsentedNonReturners !== item.sourceConsentedBuyers) {
      errors.push(`${ref}: repeat cohort must partition consented source buyers`);
    }
  }

  // Journey breakdowns and audience definitions (optional, from the aggregate importer) must never
  // expose a small group: every count is 0, null (suppressed) or at least the small-cell threshold.
  const threshold = dataset.privacy?.smallCellThreshold ?? 10;
  if (dataset.privacy && threshold < 10) errors.push("privacy.smallCellThreshold cannot be below 10");
  const safeCount = (value) => value === null || value === 0 || (Number.isInteger(value) && value >= threshold);
  for (const [index, item] of (dataset.fixtureSummaries ?? []).entries()) {
    const ref = `fixtureSummaries[${index}]`;
    for (const [type, counts] of Object.entries(item.ticketTypes ?? {})) {
      for (const [field, value] of Object.entries(counts ?? {})) if (!safeCount(value)) errors.push(`${ref}.ticketTypes.${type}.${field}: small cell must be suppressed`);
    }
    for (const [band, value] of Object.entries(item.entryTiming ?? {})) if (!safeCount(value)) errors.push(`${ref}.entryTiming.${band}: small cell must be suppressed`);
    for (const [group, origin] of Object.entries(item.origins ?? {})) {
      if (!origin) continue;
      if (!safeCount(origin.supporters) || !safeCount(origin.otherSupporters)) errors.push(`${ref}.origins.${group}: small cell must be suppressed`);
      for (const district of origin.districts ?? []) {
        if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?$/.test(district.district ?? "")) errors.push(`${ref}.origins.${group}: origins are postcode districts, never finer`);
        if (!(Number.isInteger(district.supporters) && district.supporters >= threshold)) errors.push(`${ref}.origins.${group}.${district.district}: districts under ${threshold} supporters must not be listed`);
      }
    }
    if (item.seasonTicketScanRate !== undefined && item.seasonTicketScanRate !== null &&
        (typeof item.seasonTicketScanRate !== "number" || item.seasonTicketScanRate < 0 || item.seasonTicketScanRate > 1)) {
      errors.push(`${ref}: seasonTicketScanRate must be null or between 0 and 1`);
    }
  }
  const audienceIds = new Set();
  for (const [index, item] of (dataset.audienceDefinitions ?? []).entries()) {
    const ref = `audienceDefinitions[${index}]`;
    if (!item.id || audienceIds.has(item.id)) errors.push(`${ref}: id must be present and unique`);
    audienceIds.add(item.id);
    if (item.execution !== "club-crm") errors.push(`${ref}: audiences are executed in the club CRM`);
    if (item.criteria?.consent !== "consented") errors.push(`${ref}: audiences are consented supporters only`);
    if (!(item.estimatedSize === null || (Number.isInteger(item.estimatedSize) && item.estimatedSize >= threshold && item.estimatedSize % 10 === 0))) {
      errors.push(`${ref}: estimatedSize must be null or a rounded size of at least ${threshold}`);
    }
    if (Array.isArray(item.members) || Array.isArray(item.supporters)) errors.push(`${ref}: audiences carry criteria, never a list of supporters`);
  }
  return errors;
}
