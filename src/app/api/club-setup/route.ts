import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", setup: null });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/club_setup?club_id=eq.${encodeURIComponent(clubId)}&select=club_id,fixture_source,connected_channels,priority_objectives,brand_rules,approval_rules,updated_at&limit=1`
  );
  if (!response.ok) return NextResponse.json({ error: "Club setup could not be loaded." }, { status: response.status });

  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", setup: rows[0] ?? null });
}

export async function PUT(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club setup persistence is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    clubId?: string;
    fixtureSource?: "manual" | "calendar-feed" | "ticketing";
    connectedChannels?: string[];
    priorityObjectives?: string[];
    brandRules?: Record<string, unknown>;
    approvalRules?: Record<string, unknown>;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest("/rest/v1/club_setup?on_conflict=club_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      fixture_source: body?.fixtureSource ?? "manual",
      connected_channels: Array.isArray(body?.connectedChannels) ? body.connectedChannels.slice(0, 12) : [],
      priority_objectives: Array.isArray(body?.priorityObjectives) ? body.priorityObjectives.slice(0, 8) : [],
      brand_rules: body?.brandRules && typeof body.brandRules === "object" ? body.brandRules : {},
      approval_rules: body?.approvalRules && typeof body.approvalRules === "object" ? body.approvalRules : {},
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Club setup could not be saved.", detail: payload }, { status: response.status });
  return NextResponse.json({ persistence: "club", setup: Array.isArray(payload) ? payload[0] : payload });
}
