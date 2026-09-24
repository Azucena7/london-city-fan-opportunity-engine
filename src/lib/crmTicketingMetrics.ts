import type { CrmTicketingRecord } from "./models";

export type CrmTicketingChannelSummary = {
  channel: CrmTicketingRecord["channel"];
  tickets: number;
  scans: number;
  revenue: number;
};

export type CrmTicketingSummary = {
  tickets: number;
  uniqueBuyers: number;
  scans: number;
  noShows: number;
  noShowRate: number | null;
  grossTicketRevenue: number;
  averageTicketValue: number | null;
  firstTimeBuyers: number;
  consentedBuyers: number;
  campaignAttributedTickets: number;
  campaignAttributionRate: number | null;
  postcodeSectors: number;
  channels: CrmTicketingChannelSummary[];
};

export function summariseCrmTicketing(records: CrmTicketingRecord[]): CrmTicketingSummary {
  if (!records.length) {
    return {
      tickets: 0,
      uniqueBuyers: 0,
      scans: 0,
      noShows: 0,
      noShowRate: null,
      grossTicketRevenue: 0,
      averageTicketValue: null,
      firstTimeBuyers: 0,
      consentedBuyers: 0,
      campaignAttributedTickets: 0,
      campaignAttributionRate: null,
      postcodeSectors: 0,
      channels: []
    };
  }

  const buyers = new Set<string>();
  const firstTimeBuyers = new Set<string>();
  const consentedBuyers = new Set<string>();
  const postcodeSectors = new Set<string>();
  const channelMap = new Map<CrmTicketingRecord["channel"], CrmTicketingChannelSummary>();

  let scans = 0;
  let noShows = 0;
  let grossTicketRevenue = 0;
  let campaignAttributedTickets = 0;

  for (const row of records) {
    buyers.add(row.supporter_id_hash);
    if (row.first_time_buyer) firstTimeBuyers.add(row.supporter_id_hash);
    if (row.consent_status === "consented") consentedBuyers.add(row.supporter_id_hash);
    if (row.postcode_sector) postcodeSectors.add(row.postcode_sector);

    if (row.scan_status === "scanned") scans += 1;
    if (row.scan_status === "not_scanned") noShows += 1;
    if (row.campaign_id) campaignAttributedTickets += 1;

    grossTicketRevenue += row.realised_unit_price;

    const existing = channelMap.get(row.channel) ?? {
      channel: row.channel,
      tickets: 0,
      scans: 0,
      revenue: 0
    };
    existing.tickets += 1;
    existing.scans += row.scan_status === "scanned" ? 1 : 0;
    existing.revenue += row.realised_unit_price;
    channelMap.set(row.channel, existing);
  }

  const decidedScanCount = scans + noShows;

  return {
    tickets: records.length,
    uniqueBuyers: buyers.size,
    scans,
    noShows,
    noShowRate: decidedScanCount ? noShows / decidedScanCount : null,
    grossTicketRevenue,
    averageTicketValue: grossTicketRevenue / records.length,
    firstTimeBuyers: firstTimeBuyers.size,
    consentedBuyers: consentedBuyers.size,
    campaignAttributedTickets,
    campaignAttributionRate: campaignAttributedTickets / records.length,
    postcodeSectors: postcodeSectors.size,
    channels: [...channelMap.values()].sort((a, b) => b.tickets - a.tickets || a.channel.localeCompare(b.channel))
  };
}


export type RepeatCohortSummary = {
  sourceFixtureId: string;
  targetFixtureId: string;
  sourceBuyers: number;
  sourceConsentedBuyers: number;
  alreadyPurchasedTarget: number;
  addressableConsentedNonReturners: number;
};

export function buildRepeatCohort(
  records: CrmTicketingRecord[],
  sourceFixtureId: string,
  targetFixtureId: string
): RepeatCohortSummary {
  const sourceBuyerIds = new Set<string>();
  const sourceConsentedIds = new Set<string>();
  const targetBuyerIds = new Set<string>();

  for (const row of records) {
    if (row.fixture_id === sourceFixtureId) {
      sourceBuyerIds.add(row.supporter_id_hash);
      if (row.consent_status === "consented") {
        sourceConsentedIds.add(row.supporter_id_hash);
      }
    }
    if (row.fixture_id === targetFixtureId) {
      targetBuyerIds.add(row.supporter_id_hash);
    }
  }

  let alreadyPurchasedTarget = 0;
  let addressableConsentedNonReturners = 0;

  for (const supporterId of sourceConsentedIds) {
    if (targetBuyerIds.has(supporterId)) {
      alreadyPurchasedTarget += 1;
    } else {
      addressableConsentedNonReturners += 1;
    }
  }

  return {
    sourceFixtureId,
    targetFixtureId,
    sourceBuyers: sourceBuyerIds.size,
    sourceConsentedBuyers: sourceConsentedIds.size,
    alreadyPurchasedTarget,
    addressableConsentedNonReturners
  };
}
