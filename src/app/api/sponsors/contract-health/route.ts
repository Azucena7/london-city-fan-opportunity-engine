import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safe(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ enabled: false, sponsors: [], measurementState: "not-connected" });
  }

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const [documentsResponse, clausesResponse, linksResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/contract_documents?club_id=eq.${encodeURIComponent(clubId)}&contract_type=eq.sponsor&lifecycle_state=eq.active&select=id,subject_id,subject_label,title,effective_start,effective_end,version_label,source_system,source_ref&order=effective_end.asc.nullslast&limit=100`
    ),
    supabaseRequest(
      `/rest/v1/contract_clauses?club_id=eq.${encodeURIComponent(clubId)}&review_state=eq.verified&select=id,document_id,clause_type,label,extracted_value,valid_from,valid_to,material,source_section&limit=500`
    ),
    supabaseRequest(
      `/rest/v1/contract_entity_links?club_id=eq.${encodeURIComponent(clubId)}&select=document_id,clause_id,entity_type,entity_id,relationship_type&limit=500`
    )
  ]);

  if (!documentsResponse.ok || !clausesResponse.ok || !linksResponse.ok) {
    return NextResponse.json({
      enabled: false,
      sponsors: [],
      measurementState: "schema-not-ready",
      message: "Verified sponsor contract intelligence is not available in this environment yet."
    });
  }

  const documents = await documentsResponse.json() as Array<{
    id: string;
    subject_id?: string | null;
    subject_label: string;
    title: string;
    effective_start?: string | null;
    effective_end?: string | null;
    version_label?: string | null;
    source_system?: string | null;
    source_ref?: string | null;
  }>;
  const clauses = await clausesResponse.json() as Array<{
    id: string;
    document_id: string;
    clause_type: string;
    label: string;
    extracted_value?: unknown;
    valid_from?: string | null;
    valid_to?: string | null;
    material: boolean;
    source_section?: string | null;
  }>;
  const links = await linksResponse.json() as Array<{
    document_id: string;
    clause_id?: string | null;
    entity_type: string;
    entity_id: string;
    relationship_type: string;
  }>;

  const sponsors = documents.map((document) => {
    const verified = clauses.filter((clause) => clause.document_id === document.id);
    const decisionLinks = links.filter((link) => link.document_id === document.id && ["campaign","fixture","decision"].includes(link.entity_type));
    const obligations = verified.filter((clause) => ["obligation","appearance","deadline","approval","make-good"].includes(clause.clause_type));
    const rights = verified.filter((clause) => ["rights","usage","appearance","exclusivity"].includes(clause.clause_type));
    const deadlines = verified.filter((clause) => clause.clause_type === "deadline" || clause.valid_to);

    return {
      id: document.id,
      sponsorId: document.subject_id ?? null,
      sponsor: document.subject_label,
      title: document.title,
      effectiveStart: document.effective_start ?? null,
      effectiveEnd: document.effective_end ?? null,
      version: document.version_label ?? null,
      sourceSystem: document.source_system ?? null,
      sourceRef: document.source_ref ?? null,
      verifiedClauseCount: verified.length,
      rightsCount: rights.length,
      obligationCount: obligations.length,
      deadlineCount: deadlines.length,
      linkedDecisionCount: decisionLinks.length,
      fulfilmentState: decisionLinks.length ? "evidence-linked" : "not-measured",
      obligations: obligations.slice(0, 8).map((clause) => ({
        id: clause.id,
        type: clause.clause_type,
        label: clause.label,
        material: clause.material,
        validTo: clause.valid_to ?? null,
        section: clause.source_section ?? null
      }))
    };
  });

  return NextResponse.json({
    enabled: true,
    sponsors,
    measurementState: sponsors.some((item) => item.fulfilmentState === "evidence-linked") ? "partial" : "not-measured"
  });
}
