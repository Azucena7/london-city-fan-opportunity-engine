import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import { validateAggregate } from "../../../../scripts/lib/crm-aggregate-validate.mjs";

// The club's supporter-journey aggregate. Only aggregates are accepted: the authorised export is
// processed on the uploader's device, and the server re-checks the same privacy rules as the
// local validator before storing anything. RLS decides who may read or upload.

const MAX_BYTES = 2_000_000;

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "repository", aggregate: null });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/club_journey_aggregates?club_id=eq.${encodeURIComponent(clubId)}&select=id,dataset,extracted_at,uploaded_at&order=uploaded_at.desc&limit=1`
  );
  // Before the migration is applied the table does not exist; say so rather than failing.
  if (!response.ok) return NextResponse.json({ persistence: "unavailable", aggregate: null });
  const rows = await response.json() as Array<{ id: string; dataset: unknown; extracted_at: string | null; uploaded_at: string }>;
  return NextResponse.json({ persistence: "club", aggregate: rows[0] ?? null });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club storage is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const raw = await request.text();
  if (raw.length > MAX_BYTES) return NextResponse.json({ error: "The aggregate is too large." }, { status: 413 });
  const body = (() => { try { return JSON.parse(raw) as { clubId?: unknown; dataset?: unknown }; } catch { return null; } })();
  const clubId = typeof body?.clubId === "string" ? body.clubId.trim() : "";
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const dataset = body?.dataset as { datasetState?: string; extractedAt?: string | null } | undefined;
  const errors = validateAggregate(dataset);
  if (dataset?.datasetState !== "club-aggregate") errors.push("Only a club aggregate can be uploaded.");
  if (errors.length) return NextResponse.json({ error: "The aggregate was rejected.", errors: errors.slice(0, 20) }, { status: 422 });

  const response = await supabaseRequest("/rest/v1/club_journey_aggregates", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ club_id: clubId, dataset, extracted_at: dataset?.extractedAt ?? null, uploaded_by: user.id })
  });
  if (!response.ok) {
    return NextResponse.json({ error: response.status === 403 || response.status === 401 ? "Your role cannot upload club data." : "The aggregate could not be stored." }, { status: response.status });
  }
  const rows = await response.json().catch(() => []) as Array<{ id: string; uploaded_at: string }>;
  return NextResponse.json({ persistence: "club", stored: rows[0] ?? null });
}
