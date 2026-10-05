import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const REVIEW_STATES = new Set(["acknowledged","resolved"]);

function safe(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ enabled: false, impacts: [] });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const entityType = safe(url.searchParams.get("entityType"), 40);
  const entityId = safe(url.searchParams.get("entityId"), 180);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  let path =
    `/rest/v1/contract_impact_reviews?club_id=eq.${encodeURIComponent(clubId)}&select=id,entity_type,entity_id,relationship_type,review_state,reason,created_at,updated_at&order=review_state.asc,created_at.desc&limit=250`;
  if (entityType) path += `&entity_type=eq.${encodeURIComponent(entityType)}`;
  if (entityId) path += `&entity_id=eq.${encodeURIComponent(entityId)}`;

  const response = await supabaseRequest(path);
  if (!response.ok) {
    return NextResponse.json({
      enabled: false,
      impacts: [],
      message: "Contract Impact Graph persistence is not available in this environment yet."
    });
  }

  return NextResponse.json({ enabled: true, impacts: await response.json() });
}

export async function PATCH(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Contract Impact Graph is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const impactId = safe(body?.impactId, 80);
  const reviewState = safe(body?.reviewState, 40);

  if (!clubId || !impactId || !REVIEW_STATES.has(reviewState)) {
    return NextResponse.json({ error: "Valid clubId, impactId and reviewState are required." }, { status: 400 });
  }

  const response = await supabaseRequest(
    `/rest/v1/contract_impact_reviews?id=eq.${encodeURIComponent(impactId)}&club_id=eq.${encodeURIComponent(clubId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        review_state: reviewState
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({
      error: reviewState === "resolved"
        ? "Impact could not be resolved. Governance approval may be required."
        : "Impact could not be acknowledged."
    }, { status: response.status });
  }

  return NextResponse.json({ saved: true, impact: Array.isArray(payload) ? payload[0] : payload });
}
