import { supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import type { WorkRoutingRule } from "@/lib/workSystemRouting";

export async function getWorkRoutingRules(clubId?: string | null): Promise<WorkRoutingRule[]> {
  if (!clubId || !supabaseConfigured()) return [];

  const [rulesResponse, connectionsResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/work_routing_rules?club_id=eq.${encodeURIComponent(clubId)}&enabled=eq.true&select=id,label,categories,destination_system,connection_id,require_confirmation,priority&order=priority.desc&limit=100`
    ),
    supabaseRequest(
      `/rest/v1/work_system_connections?club_id=eq.${encodeURIComponent(clubId)}&state=eq.connected&select=id,connection_ref,system&limit=100`
    )
  ]);

  if (!rulesResponse.ok || !connectionsResponse.ok) return [];

  const rules = await rulesResponse.json() as Array<{
    id: string;
    label: string;
    categories?: string[] | null;
    destination_system: WorkRoutingRule["destinationSystem"];
    connection_id: string;
    require_confirmation: boolean;
    priority: number;
  }>;
  const connections = await connectionsResponse.json() as Array<{
    id: string;
    connection_ref: string;
    system: WorkRoutingRule["destinationSystem"];
  }>;

  return rules.flatMap((rule) => {
    const connection = connections.find((item) =>
      item.id === rule.connection_id && item.system === rule.destination_system
    );
    if (!connection) return [];

    const categories = (rule.categories ?? []).filter(
      (category): category is WorkRoutingRule["categories"][number] =>
        category === "approval" || category === "activation" || category === "schedule"
    );
    if (!categories.length) return [];

    return [{
      id: rule.id,
      label: rule.label,
      enabled: true,
      categories,
      destinationSystem: rule.destination_system,
      connectionRef: connection.connection_ref,
      requireConfirmation: rule.require_confirmation,
      priority: rule.priority
    }];
  });
}
