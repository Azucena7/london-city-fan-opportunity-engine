import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safeKey(value: string) {
  return value.trim().slice(0, 160);
}

export async function GET(request: Request, { params }: { params: Promise<{ campaignKey: string }> }) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ persistence: "device", record: null });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignKey: rawCampaignKey } = await params;
  const campaignKey = safeKey(rawCampaignKey);
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId || !campaignKey) return NextResponse.json({ error: "clubId and campaignKey are required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/campaign_records?club_id=eq.${encodeURIComponent(clubId)}&campaign_key=eq.${encodeURIComponent(campaignKey)}&select=club_id,campaign_key,campaign_kind,fixture_id,status,state,updated_at&limit=1`
  );
  if (!response.ok) return NextResponse.json({ error: "Campaign record could not be loaded." }, { status: response.status });

  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", record: rows[0] ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ campaignKey: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignKey: rawCampaignKey } = await params;
  const campaignKey = safeKey(rawCampaignKey);
  const body = await request.json().catch(() => null) as {
    clubId?: string;
    campaignKind?: "fixture" | "commercial";
    fixtureId?: string | null;
    status?: "draft" | "review-ready" | "approved" | "committed" | "handoff-ready";
    state?: Record<string, unknown>;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const campaignKind = body?.campaignKind === "commercial" ? "commercial" : "fixture";
  const fixtureId = typeof body?.fixtureId === "string" && body.fixtureId.trim() ? body.fixtureId.trim().slice(0, 160) : null;
  const status = ["review-ready","approved","committed","handoff-ready"].includes(body?.status ?? "") ? body!.status! : "draft";
  const state = body?.state && typeof body.state === "object" ? body.state : null;
  if (!clubId || !campaignKey || !state) return NextResponse.json({ error: "clubId, campaignKey and state are required." }, { status: 400 });
  if (campaignKind === "fixture" && !fixtureId) return NextResponse.json({ error: "fixtureId is required for fixture campaigns." }, { status: 400 });

  const response = await supabaseRequest(
    "/rest/v1/campaign_records?on_conflict=club_id,campaign_key",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        club_id: clubId,
        campaign_key: campaignKey,
        campaign_kind: campaignKind,
        fixture_id: fixtureId,
        status,
        state,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Campaign record could not be saved." }, { status: response.status });
  return NextResponse.json({ persistence: "club", record: Array.isArray(payload) ? payload[0] : payload });
}
