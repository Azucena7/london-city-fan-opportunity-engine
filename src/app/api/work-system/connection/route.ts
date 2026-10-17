import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import { readJson, sessionWriteRejection } from "@/lib/requestGuards";

// The club's execution tool as AVELA knows it: which system runs the work, reached through the
// generic webhook, and which item categories may be sent. No credential is stored here: the
// webhook URL and secret live in the deployment environment.

const SYSTEMS = new Set(["asana", "monday", "jira", "notion", "other"]);
const CATEGORIES = ["approval", "activation", "schedule"] as const;
const CONNECTION_REF = "webhook";

function safe(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function webhookConfigured() {
  return Boolean(process.env.WORK_WEBHOOK_URL?.trim() && process.env.WORK_WEBHOOK_SECRET?.trim());
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ enabled: false, webhookConfigured: webhookConfigured() });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const clubId = safe(new URL(request.url).searchParams.get("clubId"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const [connections, rules] = await Promise.all([
    supabaseRequest(`/rest/v1/work_system_connections?club_id=eq.${encodeURIComponent(clubId)}&connection_ref=eq.${CONNECTION_REF}&select=id,system,label,state,last_sync_at&order=updated_at.desc&limit=5`),
    supabaseRequest(`/rest/v1/work_routing_rules?club_id=eq.${encodeURIComponent(clubId)}&select=id,label,categories,connection_id,enabled&limit=20`)
  ]);
  if (!connections.ok || !rules.ok) {
    return NextResponse.json({ enabled: false, webhookConfigured: webhookConfigured(), message: "Execution tool settings are not readable for your role." });
  }
  return NextResponse.json({ enabled: true, webhookConfigured: webhookConfigured(), connections: await connections.json(), rules: await rules.json() });
}

export async function POST(request: Request) {
  const rejected = sessionWriteRejection(request);
  if (rejected) return rejected;
  if (!supabaseConfigured()) return NextResponse.json({ error: "Club persistence is not configured." }, { status: 503 });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await readJson(request) as { clubId?: string; system?: string; label?: string; categories?: unknown[] } | null;
  const clubId = safe(body?.clubId, 80);
  const system = safe(body?.system, 20);
  const label = safe(body?.label) || "Club work tool";
  const categories = CATEGORIES.filter((category) => Array.isArray(body?.categories) && body!.categories!.includes(category));
  if (!clubId || !SYSTEMS.has(system) || !categories.length) {
    return NextResponse.json({ error: "Choose the tool and at least one kind of work to send." }, { status: 400 });
  }

  const connectionResponse = await supabaseRequest("/rest/v1/work_system_connections?on_conflict=club_id,system,connection_ref", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ club_id: clubId, system, label, connection_ref: CONNECTION_REF, state: "connected", created_by: user.id, updated_by: user.id })
  });
  if (!connectionResponse.ok) {
    return NextResponse.json({ error: "Your club role cannot change the execution tool." }, { status: connectionResponse.status });
  }
  const [connection] = await connectionResponse.json() as Array<{ id: string }>;

  // One routing rule per connection: update it if it exists, otherwise create it.
  const existing = await supabaseRequest(`/rest/v1/work_routing_rules?club_id=eq.${encodeURIComponent(clubId)}&connection_id=eq.${encodeURIComponent(connection.id)}&select=id&limit=1`);
  const [rule] = existing.ok ? await existing.json() as Array<{ id: string }> : [];
  const ruleBody = { label: `Send ${categories.join(", ")} work to ${label}`, enabled: true, categories, destination_system: system, require_confirmation: true, updated_by: user.id };
  const ruleResponse = rule
    ? await supabaseRequest(`/rest/v1/work_routing_rules?id=eq.${encodeURIComponent(rule.id)}`, { method: "PATCH", body: JSON.stringify(ruleBody) })
    : await supabaseRequest("/rest/v1/work_routing_rules", {
      method: "POST",
      body: JSON.stringify({ ...ruleBody, club_id: clubId, connection_id: connection.id, priority: 100, created_by: user.id })
    });
  if (!ruleResponse.ok) return NextResponse.json({ error: "The routing rule could not be saved." }, { status: ruleResponse.status });

  return NextResponse.json({ saved: true, webhookConfigured: webhookConfigured() });
}
