import { supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export type DecisionCenterOpsState = {
  capacity: {
    state: "available" | "tight" | "overloaded" | "unknown";
    utilisation: number | null;
    activeMinutes: number;
    availableMinutes: number;
    blockers: number;
  };
  availability: {
    state: "clear" | "tight" | "blocked" | "unknown";
    hardUnavailable: number;
    protectedOrBusy: number;
    internationalDuty: number;
  };
};

export async function getDecisionCenterOpsState({
  clubId,
  from,
  to
}: {
  clubId?: string | null;
  from: string;
  to: string;
}): Promise<DecisionCenterOpsState> {
  if (!clubId || !supabaseConfigured()) {
    return {
      capacity: { state: "unknown", utilisation: null, activeMinutes: 0, availableMinutes: 0, blockers: 0 },
      availability: { state: "unknown", hardUnavailable: 0, protectedOrBusy: 0, internationalDuty: 0 }
    };
  }

  const workloadPath =
    `/rest/v1/workload_items?club_id=eq.${encodeURIComponent(clubId)}&state=not.in.(done,cancelled)&select=estimated_minutes,state&limit=250`;
  const capacityPath =
    `/rest/v1/capacity_windows?club_id=eq.${encodeURIComponent(clubId)}&ends_at=gte.${encodeURIComponent(from)}&starts_at=lte.${encodeURIComponent(to)}&select=available_minutes&limit=250`;
  const availabilityPath =
    `/rest/v1/availability_windows?club_id=eq.${encodeURIComponent(clubId)}&ends_at=gte.${encodeURIComponent(from)}&starts_at=lte.${encodeURIComponent(to)}&select=availability_type,reason_type&limit=250`;

  const [workloadResponse, capacityResponse, availabilityResponse] = await Promise.all([
    supabaseRequest(workloadPath),
    supabaseRequest(capacityPath),
    supabaseRequest(availabilityPath)
  ]);

  if (!workloadResponse.ok || !capacityResponse.ok || !availabilityResponse.ok) {
    return {
      capacity: { state: "unknown", utilisation: null, activeMinutes: 0, availableMinutes: 0, blockers: 0 },
      availability: { state: "unknown", hardUnavailable: 0, protectedOrBusy: 0, internationalDuty: 0 }
    };
  }

  const workload = await workloadResponse.json() as Array<{ estimated_minutes?: number | null; state?: string | null }>;
  const capacity = await capacityResponse.json() as Array<{ available_minutes?: number | null }>;
  const availability = await availabilityResponse.json() as Array<{ availability_type?: string | null; reason_type?: string | null }>;

  const activeMinutes = workload.reduce((sum, item) => sum + Math.max(0, item.estimated_minutes ?? 0), 0);
  const availableMinutes = capacity.reduce((sum, item) => sum + Math.max(0, item.available_minutes ?? 0), 0);
  const utilisation = availableMinutes > 0 ? Math.round((activeMinutes / availableMinutes) * 100) : null;
  const blockers = workload.filter((item) => item.state === "blocked").length;

  const capacityState: DecisionCenterOpsState["capacity"]["state"] =
    utilisation === null ? "unknown" :
    utilisation > 100 ? "overloaded" :
    utilisation >= 85 ? "tight" : "available";

  const hardUnavailable = availability.filter((item) => item.availability_type === "hard-unavailable").length;
  const protectedOrBusy = availability.filter((item) => ["protected","busy","tentative"].includes(item.availability_type ?? "")).length;
  const internationalDuty = availability.filter((item) => item.reason_type === "international-duty").length;

  const availabilityState: DecisionCenterOpsState["availability"]["state"] =
    hardUnavailable > 0 ? "blocked" :
    protectedOrBusy > 0 ? "tight" :
    availability.length > 0 ? "clear" : "unknown";

  return {
    capacity: { state: capacityState, utilisation, activeMinutes, availableMinutes, blockers },
    availability: { state: availabilityState, hardUnavailable, protectedOrBusy, internationalDuty }
  };
}
