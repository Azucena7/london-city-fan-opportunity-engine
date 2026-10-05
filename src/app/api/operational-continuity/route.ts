import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const CASE_STATES = new Set(["planned","handover","ready-to-transition","closed"]);
const SUCCESSOR_STATES = new Set(["unknown","nominated","confirmed"]);
const ITEM_STATES = new Set(["pending","transferred","verified","not-applicable"]);

const defaultItems = [
  ["decisions","Reassign open decisions and approval ownership"],
  ["requests","Transfer pending operational requests and response ownership"],
  ["work-packages","Transfer external work packages and delivery ownership"],
  ["contracts","Review sponsor/player obligations with deadlines after the transition"],
  ["calendar","Transfer calendar commitments, protected windows and recurring events"],
  ["sources","Confirm source, connector and data-owner coverage"],
  ["knowledge","Capture recurring judgement, exceptions and operating context"],
  ["access","Review access, external accounts and deactivation timing"]
] as const;

function safe(value: unknown, max = 600) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ enabled: false, cases: [], items: [] });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const [casesResponse, itemsResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/operational_continuity_cases?club_id=eq.${encodeURIComponent(clubId)}&select=id,case_key,departing_role,effective_at,continuity_owner_role,successor_status,state,note,created_at,updated_at,closed_at&order=created_at.desc&limit=100`
    ),
    supabaseRequest(
      `/rest/v1/operational_continuity_items?club_id=eq.${encodeURIComponent(clubId)}&select=id,case_id,category,title,state,owner_role,reference_type,reference_id,verified_at,created_at,updated_at&order=created_at.asc&limit=800`
    )
  ]);

  if (!casesResponse.ok || !itemsResponse.ok) {
    return NextResponse.json({
      enabled: false,
      cases: [],
      items: [],
      message: "Operational continuity persistence is not available in this environment yet."
    });
  }

  return NextResponse.json({
    enabled: true,
    cases: await casesResponse.json(),
    items: await itemsResponse.json()
  });
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Operational continuity is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const departingRole = safe(body?.departingRole, 120);
  const continuityOwnerRole = safe(body?.continuityOwnerRole, 120);
  const effectiveAt = safe(body?.effectiveAt, 80) || null;
  const note = safe(body?.note, 600) || null;

  if (!clubId || !departingRole || !continuityOwnerRole) {
    return NextResponse.json({ error: "clubId, departingRole and continuityOwnerRole are required." }, { status: 400 });
  }

  const caseKey = `continuity:${Date.now()}:${departingRole.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "role"}`;
  const caseResponse = await supabaseRequest("/rest/v1/operational_continuity_cases", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      case_key: caseKey,
      departing_role: departingRole,
      effective_at: effectiveAt,
      continuity_owner_role: continuityOwnerRole,
      successor_status: "unknown",
      state: "planned",
      note,
      created_by: user.id,
      updated_by: user.id
    })
  });

  const casePayload = await caseResponse.json().catch(() => null);
  if (!caseResponse.ok || !Array.isArray(casePayload) || !casePayload[0]?.id) {
    return NextResponse.json({ error: "Continuity case could not be created. Team-admin permission may be required." }, { status: caseResponse.status || 400 });
  }

  const continuityCase = casePayload[0] as { id: string };
  const itemsResponse = await supabaseRequest("/rest/v1/operational_continuity_items", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(defaultItems.map(([category, title]) => ({
      club_id: clubId,
      case_id: continuityCase.id,
      category,
      title,
      state: "pending",
      owner_role: continuityOwnerRole,
      created_by: user.id,
      updated_by: user.id
    })))
  });

  if (!itemsResponse.ok) {
    return NextResponse.json({
      saved: true,
      case: casePayload[0],
      warning: "Continuity case was created, but its default handover checklist could not be initialised."
    }, { status: 201 });
  }

  return NextResponse.json({ saved: true, case: casePayload[0], items: await itemsResponse.json() }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Operational continuity is not configured." }, { status: 503 });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clubId = safe(body?.clubId, 80);
  const target = safe(body?.target, 20);
  const id = safe(body?.id, 80);

  if (!clubId || !id || !["case","item"].includes(target)) {
    return NextResponse.json({ error: "Valid clubId, target and id are required." }, { status: 400 });
  }

  if (target === "item") {
    const state = safe(body?.state, 40);
    if (!ITEM_STATES.has(state)) return NextResponse.json({ error: "Invalid handover item state." }, { status: 400 });

    const response = await supabaseRequest(
      `/rest/v1/operational_continuity_items?id=eq.${encodeURIComponent(id)}&club_id=eq.${encodeURIComponent(clubId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          state,
          owner_role: safe(body?.ownerRole, 120) || undefined,
          updated_by: user.id
        })
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ error: "Handover item could not be updated." }, { status: response.status });
    return NextResponse.json({ saved: true, item: Array.isArray(payload) ? payload[0] : payload });
  }

  const state = safe(body?.state, 40);
  const successorStatus = safe(body?.successorStatus, 40);
  if (state && !CASE_STATES.has(state)) return NextResponse.json({ error: "Invalid continuity case state." }, { status: 400 });
  if (successorStatus && !SUCCESSOR_STATES.has(successorStatus)) return NextResponse.json({ error: "Invalid successor status." }, { status: 400 });

  const patch: Record<string, unknown> = { updated_by: user.id };
  if (state) patch.state = state;
  if (successorStatus) patch.successor_status = successorStatus;
  const ownerRole = safe(body?.continuityOwnerRole, 120);
  if (ownerRole) patch.continuity_owner_role = ownerRole;
  if ("note" in (body ?? {})) patch.note = safe(body?.note, 600) || null;

  const response = await supabaseRequest(
    `/rest/v1/operational_continuity_cases?id=eq.${encodeURIComponent(id)}&club_id=eq.${encodeURIComponent(clubId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch)
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({
      error: state === "closed"
        ? "Continuity case cannot close until every handover item is verified/not applicable and successor coverage is confirmed."
        : "Continuity case could not be updated."
    }, { status: response.status });
  }

  return NextResponse.json({ saved: true, case: Array.isArray(payload) ? payload[0] : payload });
}
