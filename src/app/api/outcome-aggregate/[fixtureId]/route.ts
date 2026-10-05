import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safeText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalCount(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : NaN;
}

function optionalMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : NaN;
}

export async function GET(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", outcome: null });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = safeText(rawFixtureId, 160);
  const clubId = new URL(request.url).searchParams.get("clubId")?.trim() ?? "";
  if (!clubId || !fixtureId) return NextResponse.json({ error: "clubId and fixtureId are required." }, { status: 400 });

  const response = await supabaseRequest(
    `/rest/v1/club_outcome_aggregates?club_id=eq.${encodeURIComponent(clubId)}&fixture_id=eq.${encodeURIComponent(fixtureId)}&select=club_id,fixture_id,evidence_state,attendance,tickets,scans,no_shows,gross_ticket_revenue,campaign_attributed_tickets,repeat_cohort_base,repeat_purchases,source_label,source_ref,observed_at,updated_at&limit=1`
  );
  if (!response.ok) return NextResponse.json({ error: "Aggregate outcome could not be loaded." }, { status: response.status });

  const rows = await response.json() as Array<Record<string, unknown>>;
  return NextResponse.json({ persistence: "club", outcome: rows[0] ?? null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Outcome persistence is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { fixtureId: rawFixtureId } = await params;
  const fixtureId = safeText(rawFixtureId, 160);
  const body = await request.json().catch(() => null) as {
    clubId?: string;
    attendance?: number | null;
    tickets?: number | null;
    scans?: number | null;
    noShows?: number | null;
    grossTicketRevenue?: number | null;
    campaignAttributedTickets?: number | null;
    repeatCohortBase?: number | null;
    repeatPurchases?: number | null;
    sourceLabel?: string;
    sourceRef?: string;
    observedAt?: string;
  } | null;

  const clubId = safeText(body?.clubId, 80);
  const sourceLabel = safeText(body?.sourceLabel, 160);
  const sourceRef = safeText(body?.sourceRef, 240) || null;
  const observedAt = safeText(body?.observedAt, 40);
  const observedTime = Date.parse(observedAt);

  const counts = {
    attendance: optionalCount(body?.attendance),
    tickets: optionalCount(body?.tickets),
    scans: optionalCount(body?.scans),
    no_shows: optionalCount(body?.noShows),
    campaign_attributed_tickets: optionalCount(body?.campaignAttributedTickets),
    repeat_cohort_base: optionalCount(body?.repeatCohortBase),
    repeat_purchases: optionalCount(body?.repeatPurchases)
  };
  const revenue = optionalMoney(body?.grossTicketRevenue);

  if (!clubId || !fixtureId || !sourceLabel || !Number.isFinite(observedTime)) {
    return NextResponse.json({ error: "Club, fixture, source and observed date are required." }, { status: 400 });
  }
  if (Object.values(counts).some((value) => typeof value === "number" && Number.isNaN(value)) || Number.isNaN(revenue)) {
    return NextResponse.json({ error: "Outcome metrics must be non-negative aggregate numbers." }, { status: 400 });
  }
  if (counts.repeat_purchases !== null && counts.repeat_cohort_base !== null && counts.repeat_purchases > counts.repeat_cohort_base) {
    return NextResponse.json({ error: "Repeat purchases cannot exceed the repeat cohort base." }, { status: 400 });
  }
  if (counts.scans !== null && counts.tickets !== null && counts.scans > counts.tickets) {
    return NextResponse.json({ error: "Scans cannot exceed tickets in this aggregate." }, { status: 400 });
  }

  const response = await supabaseRequest("/rest/v1/club_outcome_aggregates?on_conflict=club_id,fixture_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      fixture_id: fixtureId,
      evidence_state: "reported",
      ...counts,
      gross_ticket_revenue: revenue,
      source_label: sourceLabel,
      source_ref: sourceRef,
      observed_at: new Date(observedTime).toISOString(),
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({
      error: "Aggregate outcome could not be saved. No outcome evidence was changed."
    }, { status: response.status });
  }

  return NextResponse.json({
    persistence: "club",
    outcome: Array.isArray(payload) ? payload[0] : payload,
    message: "Club-reported aggregate saved. This is descriptive evidence, not a causal uplift claim."
  });
}
