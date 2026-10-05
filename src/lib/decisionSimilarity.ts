import type { CampaignPlan } from "@/lib/models";

export type DecisionProfile = {
  themes: string[];
  audienceIds: string[];
  channels: string[];
  playerLed: boolean;
  partnerLed: boolean;
  approvalCount: number;
  leadDays: number | null;
};

export type DecisionSimilarity = {
  score: number;
  reasons: string[];
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function themeTags(text: string) {
  const tags: string[] = [];
  if (/repeat|return|retention|reactivat/i.test(text)) tags.push("repeat-attendance");
  if (/family|families|grassroots|school|junior/i.test(text)) tags.push("family-grassroots");
  if (/local|bromley|community|borough|territor/i.test(text)) tags.push("local-growth");
  if (/player|player-led|talent|alexia|jugadora/i.test(text)) tags.push("player-led");
  if (/partner|sponsor|commercial/i.test(text)) tags.push("partner-led");
  if (/travel|journey|access|weather|service|confidence/i.test(text)) tags.push("matchday-service");
  if (/ticket|conversion|purchase|attendance/i.test(text)) tags.push("ticket-conversion");
  return unique(tags);
}

function normaliseChannels(campaign: CampaignPlan) {
  const text = campaign.activations.map((activation) => activation.channel.toLowerCase());
  const channels: string[] = [];
  if (text.some((item) => /crm|email/.test(item))) channels.push("crm");
  if (text.some((item) => /paid/.test(item))) channels.push("paid");
  if (text.some((item) => /social|organic|video/.test(item))) channels.push("social");
  if (text.some((item) => /partner/.test(item))) channels.push("partner");
  if (text.some((item) => /community/.test(item))) channels.push("community");
  if (text.some((item) => /owned|web|service/.test(item))) channels.push("owned");
  return unique(channels);
}

export function buildDecisionProfile(campaign: CampaignPlan, fixtureDate: string): DecisionProfile {
  const text = [
    campaign.title.en,
    campaign.objective.en,
    campaign.proposition.en,
    campaign.message.en,
    ...campaign.audiences.map((audience) => audience.label.en),
    ...campaign.activations.flatMap((activation) => [activation.title.en, activation.role.en, activation.asset.en, activation.channel])
  ].join(" ");

  const preFixtureDates = campaign.schedule
    .map((item) => item.date)
    .filter((date) => date <= fixtureDate)
    .map((date) => {
      const fixture = Date.parse(fixtureDate + "T00:00:00Z");
      const action = Date.parse(date + "T00:00:00Z");
      return Number.isNaN(fixture) || Number.isNaN(action) ? null : Math.max(0, Math.round((fixture - action) / 86400000));
    })
    .filter((value): value is number => value !== null);

  return {
    themes: themeTags(text),
    audienceIds: unique(campaign.audiences.map((audience) => audience.id)),
    channels: normaliseChannels(campaign),
    playerLed: /player|player-led|talent|alexia|jugadora/i.test(text),
    partnerLed: /partner|sponsor|commercial/i.test(text),
    approvalCount: campaign.approvals.length,
    leadDays: preFixtureDates.length ? Math.max(...preFixtureDates) : null
  };
}

function overlap(a: string[], b: string[]) {
  const left = new Set(a);
  const right = new Set(b);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  const intersection = [...left].filter((item) => right.has(item)).length;
  return intersection / union.size;
}

export function compareDecisionProfiles(current: DecisionProfile, historical: DecisionProfile): DecisionSimilarity {
  let score = 0;
  const reasons: string[] = [];

  const themeOverlap = overlap(current.themes, historical.themes);
  if (themeOverlap > 0) {
    score += Math.round(themeOverlap * 35);
    reasons.push("Shared campaign theme");
  }

  const audienceOverlap = overlap(current.audienceIds, historical.audienceIds);
  if (audienceOverlap > 0) {
    score += Math.round(audienceOverlap * 15);
    reasons.push("Similar audience definition");
  }

  const channelOverlap = overlap(current.channels, historical.channels);
  if (channelOverlap > 0) {
    score += Math.round(channelOverlap * 20);
    reasons.push("Similar channel mix");
  }

  if (current.playerLed === historical.playerLed) {
    score += 8;
    if (current.playerLed) reasons.push("Both depend on player-led execution");
  }

  if (current.partnerLed === historical.partnerLed) {
    score += 8;
    if (current.partnerLed) reasons.push("Both depend on partner activity");
  }

  if (Math.abs(current.approvalCount - historical.approvalCount) <= 1) {
    score += 7;
    reasons.push("Similar approval load");
  }

  if (current.leadDays !== null && historical.leadDays !== null && Math.abs(current.leadDays - historical.leadDays) <= 7) {
    score += 7;
    reasons.push("Similar lead-time profile");
  }

  return {
    score: Math.min(100, score),
    reasons: reasons.slice(0, 4)
  };
}
