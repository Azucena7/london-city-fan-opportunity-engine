import { NextResponse } from "next/server";
import { calendar, campaignPlans } from "@/lib/data";
import { buildDecisionProfile, compareDecisionProfiles } from "@/lib/decisionSimilarity";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safe(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

type MemoryEvent = {
  subject_id?: string | null;
  decision_id: string;
  event_type: string;
  label: string;
  detail?: string | null;
  source_type: string;
  created_at: string;
};

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", similar: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const fixtureId = safe(url.searchParams.get("fixtureId"));
  if (!clubId || !fixtureId) return NextResponse.json({ error: "clubId and fixtureId are required." }, { status: 400 });

  const currentCampaign = campaignPlans.campaigns.find((item) => item.fixtureId === fixtureId);
  const currentFixture = calendar.find((item) => item.id === fixtureId);
  if (!currentCampaign || !currentFixture) {
    return NextResponse.json({
      persistence: "club",
      similar: [],
      reason: "The current decision does not yet have a comparable structured campaign profile."
    });
  }

  const response = await supabaseRequest(
    `/rest/v1/decision_events?club_id=eq.${encodeURIComponent(clubId)}&subject_type=eq.fixture&select=decision_id,subject_id,event_type,label,detail,source_type,created_at&order=created_at.desc&limit=500`
  );
  if (!response.ok) return NextResponse.json({ error: "Decision memory could not be loaded." }, { status: response.status });

  const events = await response.json() as MemoryEvent[];
  const groups = new Map<string, MemoryEvent[]>();
  for (const event of events) {
    const historicalFixtureId = event.subject_id ?? event.decision_id.replace(/^fixture:/, "");
    if (!historicalFixtureId || historicalFixtureId === fixtureId) continue;
    const existing = groups.get(historicalFixtureId) ?? [];
    existing.push(event);
    groups.set(historicalFixtureId, existing);
  }

  const currentProfile = buildDecisionProfile(currentCampaign, currentFixture.date);
  const similar = Array.from(groups.entries()).flatMap(([historicalFixtureId, history]) => {
    const significant = history.filter((event) => ["executed","measured","learned"].includes(event.event_type));
    if (!significant.length) return [];

    const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === historicalFixtureId);
    const fixture = calendar.find((item) => item.id === historicalFixtureId);
    if (!campaign || !fixture) return [];

    const comparison = compareDecisionProfiles(currentProfile, buildDecisionProfile(campaign, fixture.date));
    if (comparison.score < 20) return [];

    const memory = significant[0];
    return [{
      fixtureId: historicalFixtureId,
      opponent: fixture.opponent,
      date: fixture.date,
      campaign: campaign.title.en,
      score: comparison.score,
      reasons: comparison.reasons,
      memory: {
        type: memory.event_type,
        label: memory.label,
        detail: memory.detail ?? null,
        sourceType: memory.source_type,
        createdAt: memory.created_at
      }
    }];
  })
    .sort((a,b) => b.score - a.score || b.date.localeCompare(a.date))
    .slice(0, 5);

  return NextResponse.json({
    persistence: "club",
    similar,
    reason: similar.length ? null : "No comparable executed, measured or learned decision is recorded yet."
  });
}
