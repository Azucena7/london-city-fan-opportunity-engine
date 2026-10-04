import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", events: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = rawFixtureId.trim().slice(0, 160);
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/campaign_activity?club_id=eq.${encodeURIComponent(clubId)}&fixture_id=eq.${encodeURIComponent(fixtureId)}&select=id,event_type,label,detail,metadata,created_at&order=created_at.desc&limit=100`
  );
  if (!response.ok) return NextResponse.json({ error: "Campaign history could not be loaded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", events: await response.json() });
}

export async function POST(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", recorded: false });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = rawFixtureId.trim().slice(0, 160);
  const body = await request.json().catch(() => null) as {
    clubId?: string;
    eventKey?: string;
    eventType?: "review" | "draft-generated" | "reserve" | "release" | "launch-handoff";
    label?: string;
    detail?: string;
    metadata?: Record<string, unknown>;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const eventType = body?.eventType;
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 180) : "";
  if (!clubId || !eventType || !label) {
    return NextResponse.json({ error: "clubId, eventType and label are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/campaign_activity?on_conflict=event_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      fixture_id: fixtureId,
      event_key: typeof body?.eventKey === "string" ? body.eventKey.slice(0, 240) : null,
      event_type: eventType,
      label,
      detail: typeof body?.detail === "string" ? body.detail.slice(0, 700) : null,
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
      created_by: user.id
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Campaign activity could not be recorded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", recorded: true, event: Array.isArray(payload) ? payload[0] : payload });
}
