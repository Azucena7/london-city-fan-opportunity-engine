import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const REQUEST_TYPES = new Set(["player","sponsor-activation","representation","operations"]);
const STAGES = new Set(["heads-up","formal-request","confirmed","alternative","unavailable","cancelled"]);

function safe(value: unknown, max = 600) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", requests: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const decisionId = safe(url.searchParams.get("decisionId"), 180);
  if (!clubId || !decisionId) return NextResponse.json({ error: "clubId and decisionId are required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/operational_requests?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(decisionId)}&select=id,request_type,stage,recipient_role,subject,detail,requirements,event_at,due_at,external_system,external_ref,created_at,updated_at&order=updated_at.desc&limit=100`
  );
  if (!response.ok) return NextResponse.json({ error: "Operational requests could not be loaded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", requests: await response.json() });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const decisionId = safe(body?.decisionId, 180);
  const requestType = safe(body?.requestType, 40);
  const stage = safe(body?.stage, 40) || "heads-up";
  const recipientRole = safe(body?.recipientRole, 120);
  const subject = safe(body?.subject, 180);
  const detail = safe(body?.detail, 1400);

  if (!clubId || !decisionId || !REQUEST_TYPES.has(requestType) || !STAGES.has(stage) || !recipientRole || !subject) {
    return NextResponse.json({ error: "Valid clubId, decisionId, requestType, stage, recipientRole and subject are required." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/operational_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      decision_id: decisionId,
      request_type: requestType,
      stage,
      recipient_role: recipientRole,
      subject,
      detail: detail || null,
      requirements: body?.requirements && typeof body.requirements === "object" ? body.requirements : {},
      event_at: safe(body?.eventAt, 80) || null,
      due_at: safe(body?.dueAt, 80) || null,
      source_type: "user",
      created_by: user.id,
      updated_by: user.id
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Operational request could not be created." }, { status: response.status });
  return NextResponse.json({ persistence: "club", request: Array.isArray(payload) ? payload[0] : payload });
}
