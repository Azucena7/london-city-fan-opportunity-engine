import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safeFixture(value: string) {
  return value.trim().slice(0, 160);
}

export async function GET(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ persistence: "device", workspace: null });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = safeFixture(rawFixtureId);
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/campaign_workspaces?club_id=eq.${encodeURIComponent(clubId)}&fixture_id=eq.${encodeURIComponent(fixtureId)}&select=club_id,fixture_id,status,state,updated_at&limit=1`
  );
  if (!response.ok) return NextResponse.json({ error: "Workspace could not be loaded." }, { status: response.status });

  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", workspace: rows[0] ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = safeFixture(rawFixtureId);
  const body = await request.json().catch(() => null) as {
    clubId?: string;
    status?: "draft" | "review-ready" | "approved";
    state?: Record<string, unknown>;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const status = body?.status === "review-ready" || body?.status === "approved" ? body.status : "draft";
  const state = body?.state && typeof body.state === "object" ? body.state : null;
  if (!clubId || !state) return NextResponse.json({ error: "clubId and workspace state are required." }, { status: 400 });

  const response = await supabaseRequest(
    "/rest/v1/campaign_workspaces?on_conflict=club_id,fixture_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        club_id: clubId,
        fixture_id: fixtureId,
        status,
        state,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Workspace could not be saved.", detail: payload }, { status: response.status });
  return NextResponse.json({ persistence: "club", workspace: Array.isArray(payload) ? payload[0] : payload });
}
