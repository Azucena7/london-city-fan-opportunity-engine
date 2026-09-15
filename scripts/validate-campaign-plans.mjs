import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readJson = (path) => readFile(new URL(path, root), "utf8").then(JSON.parse);

const [data, calendar, fixturePlans, signals, demo] = await Promise.all([
  readJson("data/live/campaign-plans.json"),
  readJson("data/seed/calendar.json"),
  readJson("data/seed/fixtures.json"),
  readJson("data/live/signals.json"),
  readJson("data/demo/brighton-crm-ticketing.synthetic.json")
]);

if (data.version !== "1.0") throw new Error("Campaign plan version must be 1.0");
if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) throw new Error("At least one campaign is required");

const fixtureById = new Map(calendar.map((item) => [item.id, item]));
const signalById = new Map(signals.map((item) => [item.id, item]));
const playbookIds = new Set(data.playbooks.map((item) => item.id));
const demoCampaignIds = new Set(demo.records.map((item) => item.campaign_id).filter(Boolean));
const ids = new Set();

for (const campaign of data.campaigns) {
  if (ids.has(campaign.id)) throw new Error(`Duplicate campaign id: ${campaign.id}`);
  ids.add(campaign.id);
  const fixture = fixtureById.get(campaign.fixtureId);
  if (!fixture) throw new Error(`Unknown fixture: ${campaign.fixtureId}`);
  if (fixture.homeAway !== "home") throw new Error(`Campaign fixture must be home: ${campaign.fixtureId}`);
  if (campaign.utmCampaign !== campaign.fixtureId) throw new Error(`UTM campaign must equal fixture id: ${campaign.id}`);
  if (campaign.status === "live") throw new Error(`A repository campaign cannot be live without an authorised execution source: ${campaign.id}`);
  if (campaign.budgetMix.reduce((sum, item) => sum + item.share, 0) !== 100) throw new Error(`Budget mix must total 100: ${campaign.id}`);

  for (const signalId of campaign.triggerSignalIds) {
    const signal = signalById.get(signalId);
    if (!signal) throw new Error(`Unknown signal ${signalId} in ${campaign.id}`);
    if (signal.fixtureId !== campaign.fixtureId) throw new Error(`Signal ${signalId} does not belong to ${campaign.fixtureId}`);
  }

  for (const activation of campaign.activations) {
    if (!playbookIds.has(activation.playbookId)) throw new Error(`Unknown playbook ${activation.playbookId}`);
    if (!activation.utmSource || !activation.utmMedium || !activation.utmContent) throw new Error(`Incomplete UTM contract: ${activation.id}`);
    for (const trackingId of activation.trackingCampaignIds) {
      if (!demoCampaignIds.has(trackingId)) throw new Error(`Tracking campaign ${trackingId} is not exercised by the Brighton demo`);
    }
  }

  const plan = fixturePlans.find((item) => item.date === fixture.date && item.opponent === fixture.opponent);
  if (!plan) throw new Error(`Fixture plan missing for ${campaign.fixtureId}`);
  if (plan.kickoff !== fixture.kickoff) throw new Error(`Fixture plan kickoff ${plan.kickoff} does not match calendar ${fixture.kickoff}`);

  const restricted = campaign.measurement.find((item) => item.id === "purchase-scan-repeat");
  if (restricted?.state !== "requires-access") throw new Error(`Purchase/scan/repeat must remain requires-access: ${campaign.id}`);
  const pendingApprovals = campaign.approvals.filter((item) => item.state !== "ready").length;
  if (campaign.status === "ready" && pendingApprovals > 0) throw new Error(`Campaign cannot be ready with pending approvals: ${campaign.id}`);
}

console.log(JSON.stringify({
  version: data.version,
  campaigns: data.campaigns.length,
  playbooks: data.playbooks.length,
  activations: data.campaigns.reduce((sum, item) => sum + item.activations.length, 0),
  demoCampaignIdsExercised: [...demoCampaignIds].length
}, null, 2));
