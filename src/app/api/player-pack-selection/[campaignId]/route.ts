import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safeCampaign(value: string) {
  return value.trim().slice(0, 160);
}

export async function GET(request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ persistence: "device", selection: null });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignId: rawCampaignId } = await params;
  const campaignId = safeCampaign(rawCampaignId);
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId || !campaignId) return NextResponse.json({ error: "clubId and campaignId are required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/player_pack_selections?club_id=eq.${encodeURIComponent(clubId)}&campaign_id=eq.${encodeURIComponent(campaignId)}&select=club_id,campaign_id,status,selected_player_ids,player_count,snapshot,updated_at&limit=1`
  );
  if (!response.ok) return NextResponse.json({ error: "Player pack selection could not be loaded." }, { status: response.status });

  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", selection: rows[0] ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { campaignId: rawCampaignId } = await params;
  const campaignId = safeCampaign(rawCampaignId);
  const body = await request.json().catch(() => null) as {
    clubId?: string;
    status?: "selected" | "approved" | "committed";
    selectedPlayerIds?: string[];
    playerCount?: number;
    snapshot?: Record<string, unknown>;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const selectedPlayerIds = Array.isArray(body?.selectedPlayerIds)
    ? body.selectedPlayerIds.filter((value): value is string => typeof value === "string").slice(0, 16)
    : [];
  const playerCount = Number.isInteger(body?.playerCount) ? Math.max(0, Math.min(16, Number(body?.playerCount))) : selectedPlayerIds.length;
  const status = body?.status === "approved" || body?.status === "committed" ? body.status : "selected";
  const snapshot = body?.snapshot && typeof body.snapshot === "object" ? body.snapshot : {};

  if (!clubId || !campaignId) return NextResponse.json({ error: "clubId and campaignId are required." }, { status: 400 });
  if (selectedPlayerIds.length !== playerCount) return NextResponse.json({ error: "Selected players must match playerCount." }, { status: 400 });

  const currentResponse = await supabaseRequest(
    `/rest/v1/player_pack_selections?club_id=eq.${encodeURIComponent(clubId)}&campaign_id=eq.${encodeURIComponent(campaignId)}&select=status,selected_player_ids,player_count&limit=1`
  );
  const currentRows = currentResponse.ok
    ? await currentResponse.json() as Array<{ status: "selected" | "approved" | "committed"; selected_player_ids: string[]; player_count: number }>
    : [];
  const current = currentRows[0] ?? null;

  if (status === "approved") {
    if (!current || current.status !== "selected") {
      return NextResponse.json({ error: "Only a selected pack can be approved." }, { status: 409 });
    }
    if (Number(snapshot.blockerCount ?? 0) > 0) {
      return NextResponse.json({ error: "Resolve player-pack blockers before approval." }, { status: 409 });
    }
  }
  if (status === "committed" && (!current || current.status !== "approved")) {
    return NextResponse.json({ error: "Only an approved pack can be committed." }, { status: 409 });
  }
  if (status === "selected" && current && current.status !== "selected") {
    return NextResponse.json({ error: "Approved or committed packs cannot be overwritten as selected." }, { status: 409 });
  }
  if ((status === "approved" || status === "committed") && current) {
    const sameIds = current.selected_player_ids.length === selectedPlayerIds.length
      && current.selected_player_ids.every((id) => selectedPlayerIds.includes(id));
    if (!sameIds || current.player_count !== playerCount) {
      return NextResponse.json({ error: "Approval state can only advance for the currently selected pack." }, { status: 409 });
    }
  }

  const response = await supabaseRequest(
    "/rest/v1/player_pack_selections?on_conflict=club_id,campaign_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        club_id: clubId,
        campaign_id: campaignId,
        status,
        selected_player_ids: selectedPlayerIds,
        player_count: playerCount,
        snapshot,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Player pack selection could not be saved." }, { status: response.status });
  return NextResponse.json({ persistence: "club", selection: Array.isArray(payload) ? payload[0] : payload });
}
