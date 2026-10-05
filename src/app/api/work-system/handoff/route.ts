import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

const SYSTEMS = new Set(["asana","monday","jira","notion","other"]);
const CATEGORIES = new Set(["approval","activation","schedule"]);

function safe(value: unknown, max = 220) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Club persistence is not configured. No external tasks were created." }, { status: 503 });
  }

  const user = await currentSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required. No external tasks were created." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    clubId?: string;
    decisionId?: string;
    workPackage?: {
      id?: string;
      title?: string;
      estimatedMinutes?: number;
      items?: Array<{ key?: string; category?: string; state?: string }>;
    };
    destinationSystem?: string;
    connectionRef?: string;
    matchedRuleId?: string;
  } | null;

  const clubId = safe(body?.clubId, 80);
  const decisionId = safe(body?.decisionId, 180);
  const packageKey = safe(body?.workPackage?.id, 180);
  const title = safe(body?.workPackage?.title, 180);
  const destinationSystem = safe(body?.destinationSystem, 40);
  const connectionRef = safe(body?.connectionRef, 220);
  const matchedRuleId = safe(body?.matchedRuleId, 80);
  const rawItems = Array.isArray(body?.workPackage?.items) ? body!.workPackage!.items! : [];
  const items = rawItems
    .map((item) => ({
      key: safe(item.key, 180),
      category: safe(item.category, 40),
      state: safe(item.state, 40)
    }))
    .filter((item) => item.key && CATEGORIES.has(item.category))
    .slice(0, 250);
  const estimatedMinutes = Number.isFinite(body?.workPackage?.estimatedMinutes)
    ? Math.max(0, Math.min(100000, Math.round(Number(body?.workPackage?.estimatedMinutes))))
    : 0;

  if (!clubId || !decisionId || !packageKey || !title || !SYSTEMS.has(destinationSystem) || !connectionRef || !matchedRuleId || !items.length) {
    return NextResponse.json({ error: "A valid routed work package is required. No external tasks were created." }, { status: 400 });
  }

  const connectionResponse = await supabaseRequest(
    `/rest/v1/work_system_connections?club_id=eq.${encodeURIComponent(clubId)}&system=eq.${encodeURIComponent(destinationSystem)}&connection_ref=eq.${encodeURIComponent(connectionRef)}&state=eq.connected&select=id,system,connection_ref,state&limit=1`
  );
  if (!connectionResponse.ok) {
    return NextResponse.json({ error: "The connected destination could not be verified. No external tasks were created." }, { status: connectionResponse.status });
  }
  const connections = await connectionResponse.json() as Array<{ id: string; system: string; connection_ref: string; state: string }>;
  const connection = connections[0] ?? null;
  if (!connection) {
    return NextResponse.json({ error: "The selected work-system connection is not currently connected. No external tasks were created." }, { status: 409 });
  }

  const ruleResponse = await supabaseRequest(
    `/rest/v1/work_routing_rules?id=eq.${encodeURIComponent(matchedRuleId)}&club_id=eq.${encodeURIComponent(clubId)}&connection_id=eq.${encodeURIComponent(connection.id)}&destination_system=eq.${encodeURIComponent(destinationSystem)}&enabled=eq.true&require_confirmation=eq.true&select=id,categories,priority&limit=1`
  );
  if (!ruleResponse.ok) {
    return NextResponse.json({ error: "The routing rule could not be verified. No external tasks were created." }, { status: ruleResponse.status });
  }
  const rules = await ruleResponse.json() as Array<{ id: string; categories?: string[]; priority?: number }>;
  const rule = rules[0] ?? null;
  if (!rule) {
    return NextResponse.json({ error: "The routing rule is no longer active. No external tasks were created." }, { status: 409 });
  }

  const routedCategories = new Set((rule.categories ?? []).filter((category) => CATEGORIES.has(category)));
  const routedItems = items.filter((item) => routedCategories.has(item.category));
  if (!routedItems.length) {
    return NextResponse.json({ error: "No work items match the active routing rule. No external tasks were created." }, { status: 409 });
  }

  const existingResponse = await supabaseRequest(
    `/rest/v1/external_work_packages?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(decisionId)}&package_key=eq.${encodeURIComponent(packageKey)}&select=id,sync_state,title,item_count,blocked_count,estimated_minutes,connection_id&limit=1`
  );
  if (!existingResponse.ok) {
    return NextResponse.json({ error: "Existing handoff state could not be checked. No external tasks were created." }, { status: existingResponse.status });
  }
  const existingRows = await existingResponse.json() as Array<Record<string, unknown>>;
  const existing = existingRows[0] ?? null;
  if (existing) {
    if (existing.sync_state !== "proposed") {
      return NextResponse.json({
        error: "This handoff has already advanced beyond proposed state. Existing external state was not changed."
      }, { status: 409 });
    }
    return NextResponse.json({
      proposed: true,
      alreadyProposed: true,
      package: existing,
      message: "Handoff package already proposed in AVELA. External tasks have not been created by this action."
    });
  }

  const blockedCount = routedItems.filter((item) => item.state === "blocked").length;
  const createResponse = await supabaseRequest("/rest/v1/external_work_packages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      club_id: clubId,
      connection_id: connection.id,
      decision_id: decisionId,
      package_key: packageKey,
      title,
      external_package_ref: null,
      external_package_url: null,
      sync_state: "proposed",
      item_count: routedItems.length,
      completed_count: 0,
      blocked_count: blockedCount,
      estimated_minutes: estimatedMinutes,
      last_sync_at: null,
      sync_error: null,
      created_by: user.id,
      updated_by: user.id
    })
  });
  const payload = await createResponse.json().catch(() => null);
  if (!createResponse.ok) {
    return NextResponse.json({ error: "Handoff package could not be proposed. No external tasks were created." }, { status: createResponse.status });
  }

  return NextResponse.json({
    proposed: true,
    alreadyProposed: false,
    package: Array.isArray(payload) ? payload[0] : payload,
    message: "Proposed in AVELA. External tasks have not been created yet."
  });
}
