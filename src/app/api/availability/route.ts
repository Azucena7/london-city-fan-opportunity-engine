import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const SUBJECT_TYPES = new Set(["squad","player","staff-role","team","department","venue"]);
const AVAILABILITY_TYPES = new Set(["hard-unavailable","protected","preferred","busy","tentative","available"]);
const REASONS = new Set(["off-day","christmas-break","recovery","travel","training","international-duty","internal-event","external-event","personal-calendar","venue-block","other"]);
const CONFIDENCE = new Set(["confirmed","likely","tentative"]);

function safe(value: unknown, max = 600) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", windows: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const from = safe(url.searchParams.get("from"), 80);
  const to = safe(url.searchParams.get("to"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  let path = `/rest/v1/availability_windows?club_id=eq.${encodeURIComponent(clubId)}&select=id,subject_type,subject_id,subject_label,availability_type,reason_type,title,detail,starts_at,ends_at,source_type,source_ref,confidence,created_at,updated_at&order=starts_at.asc&limit=250`;
  if (from) path += `&ends_at=gte.${encodeURIComponent(from)}`;
  if (to) path += `&starts_at=lte.${encodeURIComponent(to)}`;

  const response = await supabaseRequest(path);
  if (!response.ok) return NextResponse.json({ error: "Availability windows could not be loaded." }, { status: response.status });
  return NextResponse.json({ persistence: "club", windows: await response.json() });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const subjectType = safe(body?.subjectType, 40);
  const subjectId = safe(body?.subjectId, 180);
  const subjectLabel = safe(body?.subjectLabel, 180);
  const availabilityType = safe(body?.availabilityType, 40);
  const reasonType = safe(body?.reasonType, 40);
  const title = safe(body?.title, 180);
  const detail = safe(body?.detail, 1200);
  const startsAt = safe(body?.startsAt, 80);
  const endsAt = safe(body?.endsAt, 80);
  const confidence = safe(body?.confidence, 40) || "confirmed";

  if (!clubId || !SUBJECT_TYPES.has(subjectType) || !subjectLabel || !AVAILABILITY_TYPES.has(availabilityType) || !REASONS.has(reasonType) || !title || !startsAt || !endsAt || !CONFIDENCE.has(confidence)) {
    return NextResponse.json({ error: "Valid club, subject, availability, reason, title and time window are required." }, { status: 400 });
  }

  if (Number.isNaN(Date.parse(startsAt)) || Number.isNaN(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.parse(startsAt)) {
    return NextResponse.json({ error: "Availability time window is invalid." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/availability_windows", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      subject_type: subjectType,
      subject_id: subjectId || null,
      subject_label: subjectLabel,
      availability_type: availabilityType,
      reason_type: reasonType,
      title,
      detail: detail || null,
      starts_at: startsAt,
      ends_at: endsAt,
      source_type: "user",
      confidence,
      created_by: user.id,
      updated_by: user.id
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Availability window could not be saved." }, { status: response.status });
  return NextResponse.json({ persistence: "club", window: Array.isArray(payload) ? payload[0] : payload });
}
