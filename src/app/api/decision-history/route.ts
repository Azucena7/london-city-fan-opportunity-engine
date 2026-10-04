import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const EVENT_TYPES = new Set(["detected","recommended","changed","reviewed","approved","rejected","committed","executed","measured","learned","context-added","blocked","unblocked"]);
const SUBJECT_TYPES = new Set(["fixture","campaign","sponsor","player","contract","operations","learning"]);
const SOURCE_TYPES = new Set(["engine","user","connector","contract","historical"]);

function safe(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", events: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const decisionId = safe(url.searchParams.get("decisionId"), 180);
  if (!clubId || !decisionId) return NextResponse.json({ error: "clubId and decisionId are required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/decision_events?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(decisionId)}&select=id,decision_id,subject_type,subject_id,event_type,state,label,detail,metadata,source_type,created_at&order=created_at.asc&limit=250`
  );
  if (!response.ok) return NextResponse.json({ error: "Decision history could not be loaded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", events: await response.json() });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const decisionId = safe(body?.decisionId, 180);
  const subjectType = safe(body?.subjectType, 40);
  const subjectId = safe(body?.subjectId, 180);
  const eventType = safe(body?.eventType, 40);
  const sourceType = safe(body?.sourceType, 40) || "user";
  const label = safe(body?.label, 180);
  const detail = safe(body?.detail, 1200);

  if (!clubId || !decisionId || !label || !SUBJECT_TYPES.has(subjectType) || !EVENT_TYPES.has(eventType) || !SOURCE_TYPES.has(sourceType)) {
    return NextResponse.json({ error: "Valid clubId, decisionId, subjectType, eventType, sourceType and label are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/decision_events?on_conflict=event_key", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      decision_id: decisionId,
      subject_type: subjectType,
      subject_id: subjectId || null,
      event_key: safe(body?.eventKey, 240) || null,
      event_type: eventType,
      state: safe(body?.state, 80) || null,
      label,
      detail: detail || null,
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
      source_type: sourceType,
      created_by: user.id
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Decision event could not be recorded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", recorded: true, event: Array.isArray(payload) ? payload[0] : payload });
}
