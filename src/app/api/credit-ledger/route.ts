import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", events: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = url.searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/credit_ledger?club_id=eq.${encodeURIComponent(clubId)}&select=id,fixture_id,item_id,event_type,credits,note,created_at&order=created_at.desc&limit=50`
  );
  if (!response.ok) return NextResponse.json({ error: "Credit history could not be loaded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", events: await response.json() });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", recorded: false });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    clubId?: string;
    fixtureId?: string;
    itemId?: string;
    eventKey?: string;
    eventType?: "commit" | "release" | "consume" | "adjust";
    credits?: number;
    note?: string;
  } | null;

  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  const eventType = body?.eventType;
  const credits = Number.isInteger(body?.credits) ? Number(body?.credits) : 0;
  if (!clubId || !eventType || credits <= 0) {
    return NextResponse.json({ error: "Valid clubId, eventType and credits are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/credit_ledger?on_conflict=event_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      fixture_id: typeof body?.fixtureId === "string" ? body.fixtureId.slice(0, 160) : null,
      item_id: typeof body?.itemId === "string" ? body.itemId.slice(0, 160) : null,
      event_key: typeof body?.eventKey === "string" ? body.eventKey.slice(0, 240) : null,
      event_type: eventType,
      credits,
      note: typeof body?.note === "string" ? body.note.slice(0, 500) : null,
      created_by: user.id
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Credit event could not be recorded.", detail: payload }, { status: response.status });
  return NextResponse.json({ persistence: "club", recorded: true, event: Array.isArray(payload) ? payload[0] : payload });
}
