import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const REVIEW_STATES = new Set(["needs-review","verified","rejected"]);

function safe(value: unknown, max = 600) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ enabled: false, persistence: "unavailable", documents: [], clauses: [] });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const [documentsResponse, clausesResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/contract_documents?club_id=eq.${encodeURIComponent(clubId)}&select=id,contract_type,subject_type,subject_id,subject_label,title,lifecycle_state,effective_start,effective_end,source_system,source_ref,document_hash,version_label,supersedes_document_id,created_at,updated_at&order=updated_at.desc&limit=100`
    ),
    supabaseRequest(
      `/rest/v1/contract_clauses?club_id=eq.${encodeURIComponent(clubId)}&select=id,document_id,clause_type,clause_key,label,extracted_value,source_section,source_fragment,extraction_confidence,review_state,material,valid_from,valid_to,reviewed_by,reviewed_at,supersedes_clause_id,created_at,updated_at&order=material.desc,updated_at.desc&limit=500`
    )
  ]);

  if (!documentsResponse.ok || !clausesResponse.ok) {
    return NextResponse.json({
      enabled: false,
      persistence: "schema-not-ready",
      documents: [],
      clauses: [],
      message: "Contract Intelligence persistence is not available in this environment yet."
    });
  }

  return NextResponse.json({
    enabled: true,
    persistence: "club",
    documents: await documentsResponse.json(),
    clauses: await clausesResponse.json()
  });
}

export async function PATCH(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Contract persistence is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const clauseId = safe(body?.clauseId, 80);
  const reviewState = safe(body?.reviewState, 40);
  const note = safe(body?.note, 1200);

  if (!clubId || !clauseId || !REVIEW_STATES.has(reviewState)) {
    return NextResponse.json({ error: "Valid clubId, clauseId and reviewState are required." }, { status: 400 });
  }

  const response = await supabaseRequest(
    `/rest/v1/contract_clauses?id=eq.${encodeURIComponent(clauseId)}&club_id=eq.${encodeURIComponent(clubId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        review_state: reviewState,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        metadata: note ? { reviewNote: note } : undefined
      })
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({
      error: reviewState === "verified"
        ? "Clause could not be verified. Governance approval may be required."
        : "Clause review state could not be updated."
    }, { status: response.status });
  }

  return NextResponse.json({
    saved: true,
    clause: Array.isArray(payload) ? payload[0] : payload
  });
}
