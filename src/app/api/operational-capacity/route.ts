import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safe(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ persistence: "device", workload: [], capacity: [] });
  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const from = safe(url.searchParams.get("from"), 80);
  const to = safe(url.searchParams.get("to"), 80);
  if (!clubId) return NextResponse.json({ error: "clubId is required." }, { status: 400 });

  const workloadPath = `/rest/v1/workload_items?club_id=eq.${encodeURIComponent(clubId)}&state=not.in.(done,cancelled)&select=id,subject_label,title,state,estimated_minutes,complexity_score,due_at,starts_at,source_type,external_system,external_ref&order=due_at.asc.nullslast&limit=250`;
  let capacityPath = `/rest/v1/capacity_windows?club_id=eq.${encodeURIComponent(clubId)}&select=id,subject_label,available_minutes,starts_at,ends_at,source_type,external_system,external_ref&order=starts_at.asc&limit=250`;
  if (from) capacityPath += `&ends_at=gte.${encodeURIComponent(from)}`;
  if (to) capacityPath += `&starts_at=lte.${encodeURIComponent(to)}`;

  const [workloadResponse, capacityResponse] = await Promise.all([
    supabaseRequest(workloadPath),
    supabaseRequest(capacityPath)
  ]);

  if (!workloadResponse.ok || !capacityResponse.ok) {
    return NextResponse.json({ error: "Operational capacity could not be loaded." }, { status: 502 });
  }

  return NextResponse.json({
    persistence: "club",
    workload: await workloadResponse.json(),
    capacity: await capacityResponse.json()
  });
}
