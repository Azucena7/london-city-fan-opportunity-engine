import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safe(value: unknown, max = 180) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ enabled: false, packages: [], items: [] });

  const user = await currentSupabaseUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const clubId = safe(url.searchParams.get("clubId"), 80);
  const decisionId = safe(url.searchParams.get("decisionId"), 180);
  if (!clubId || !decisionId) {
    return NextResponse.json({ error: "clubId and decisionId are required." }, { status: 400 });
  }

  const packagesResponse = await supabaseRequest(
    `/rest/v1/external_work_packages?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(decisionId)}&select=id,connection_id,package_key,title,external_package_ref,external_package_url,sync_state,item_count,completed_count,blocked_count,estimated_minutes,last_sync_at,sync_error,updated_at&order=updated_at.desc&limit=20`
  );

  if (!packagesResponse.ok) {
    return NextResponse.json({
      enabled: false,
      packages: [],
      items: [],
      message: "External work-system sync persistence is not available in this environment yet."
    });
  }

  const packages = await packagesResponse.json() as Array<{ id: string; connection_id: string } & Record<string, unknown>>;
  if (!packages.length) return NextResponse.json({ enabled: true, packages: [], items: [], connections: [] });

  const packageIds = packages.map((item) => item.id);
  const connectionIds = Array.from(new Set(packages.map((item) => item.connection_id)));
  const [itemsResponse, connectionsResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/external_work_item_links?club_id=eq.${encodeURIComponent(clubId)}&package_id=in.(${packageIds.map(encodeURIComponent).join(",")})&select=id,package_id,package_item_key,external_ref,external_url,state,assignee_label,due_at,blocker_label,last_external_update_at,last_sync_at&order=due_at.asc.nullslast&limit=300`
    ),
    supabaseRequest(
      `/rest/v1/work_system_connections?club_id=eq.${encodeURIComponent(clubId)}&id=in.(${connectionIds.map(encodeURIComponent).join(",")})&select=id,system,label,state,last_sync_at&limit=50`
    )
  ]);

  if (!itemsResponse.ok || !connectionsResponse.ok) {
    return NextResponse.json({
      enabled: false,
      packages: [],
      items: [],
      message: "External work-system sync details could not be loaded."
    });
  }

  return NextResponse.json({
    enabled: true,
    packages,
    items: await itemsResponse.json(),
    connections: await connectionsResponse.json()
  });
}
