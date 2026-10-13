// Lead attribution keeps the visitor's first external campaign. Internal CTA links carry their own
// utm_* tags (utm_medium=internal_cta) so the site can measure which button worked; without this,
// a visitor who arrived from a LinkedIn post and then clicked "Request pilot" in the nav would be
// recorded as coming from the nav.

export type CampaignTags = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
};

export const FIRST_TOUCH_KEY = "avela:first-touch";
const MAX_AGE_DAYS = 30;

export function campaignTags(search: string): CampaignTags {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content")
  };
}

/** The campaign tags of an external arrival, or null for a direct visit or an internal CTA. */
export function externalCampaign(search: string): CampaignTags | null {
  const tags = campaignTags(search);
  if (!tags.utmSource || tags.utmMedium === "internal_cta") return null;
  return tags;
}

/** Reads a stored first touch, ignoring malformed or expired values. */
export function readFirstTouch(raw: string | null, now = Date.now()): CampaignTags | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as { savedAt?: number; tags?: CampaignTags };
    if (!stored.tags?.utmSource || typeof stored.savedAt !== "number") return null;
    if (now - stored.savedAt > MAX_AGE_DAYS * 86_400_000) return null;
    return stored.tags;
  } catch {
    return null;
  }
}

export function serialiseFirstTouch(tags: CampaignTags, now = Date.now()) {
  return JSON.stringify({ savedAt: now, tags });
}

/** The first external campaign wins; otherwise the tags on the current page. */
export function leadAttribution(currentSearch: string, storedRaw: string | null, now = Date.now()): CampaignTags {
  return readFirstTouch(storedRaw, now) ?? campaignTags(currentSearch);
}
