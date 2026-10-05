import { supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import type { DecisionAlert } from "@/lib/decisionIntelligence";

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
  requests: {
    state: "clear" | "waiting" | "overdue" | "unknown";
    pending: number;
    overdue: number;
    nextRecipient: string | null;
  };
  contracts: {
    state: "connected" | "unknown";
    activeDocuments: number;
    verifiedClauses: number;
  };
  contractImpacts: {
    state: "clear" | "review" | "unknown";
    pending: number;
    acknowledged: number;
  };
  execution: {
    state: "clear" | "blocked" | "syncing" | "unknown";
    packages: number;
    blockedItems: number;
    completedItems: number;
    totalItems: number;
  };
  crossAlerts: DecisionAlert[];
};

const unknownState = (): DecisionCenterOpsState => ({
  capacity: { state: "unknown", utilisation: null, activeMinutes: 0, availableMinutes: 0, blockers: 0 },
  availability: { state: "unknown", hardUnavailable: 0, protectedOrBusy: 0, internationalDuty: 0 },
  requests: { state: "unknown", pending: 0, overdue: 0, nextRecipient: null },
  contracts: { state: "unknown", activeDocuments: 0, verifiedClauses: 0 },
  contractImpacts: { state: "unknown", pending: 0, acknowledged: 0 },
  execution: { state: "unknown", packages: 0, blockedItems: 0, completedItems: 0, totalItems: 0 },
  crossAlerts: []
});

export async function getDecisionCenterOpsState({
  clubId,
  from,
  to
}: {
  clubId?: string | null;
  from: string;
  to: string;
}): Promise<DecisionCenterOpsState> {
  const result = unknownState();
  if (!clubId || !supabaseConfigured()) return result;

  const workloadPath =
    `/rest/v1/workload_items?club_id=eq.${encodeURIComponent(clubId)}&state=not.in.(done,cancelled)&select=estimated_minutes,state&limit=250`;
  const capacityPath =
    `/rest/v1/capacity_windows?club_id=eq.${encodeURIComponent(clubId)}&ends_at=gte.${encodeURIComponent(from)}&starts_at=lte.${encodeURIComponent(to)}&select=available_minutes&limit=250`;
  const availabilityPath =
    `/rest/v1/availability_windows?club_id=eq.${encodeURIComponent(clubId)}&ends_at=gte.${encodeURIComponent(from)}&starts_at=lte.${encodeURIComponent(to)}&select=availability_type,reason_type&limit=250`;
  const requestsPath =
    `/rest/v1/operational_requests?club_id=eq.${encodeURIComponent(clubId)}&stage=in.(heads-up,formal-request)&select=recipient_role,due_at,updated_at&order=updated_at.asc&limit=250`;
  const contractsPath =
    `/rest/v1/contract_documents?club_id=eq.${encodeURIComponent(clubId)}&lifecycle_state=eq.active&select=id&limit=250`;
  const clausesPath =
    `/rest/v1/contract_clauses?club_id=eq.${encodeURIComponent(clubId)}&review_state=eq.verified&select=id&limit=1000`;
  const impactsPath =
    `/rest/v1/contract_impact_reviews?club_id=eq.${encodeURIComponent(clubId)}&review_state=in.(pending,acknowledged)&select=id,entity_type,entity_id,relationship_type,review_state,reason,created_at&order=created_at.desc&limit=250`;
  const executionPath =
    `/rest/v1/external_work_packages?club_id=eq.${encodeURIComponent(clubId)}&sync_state=not.in.(archived)&select=id,decision_id,title,sync_state,item_count,completed_count,blocked_count,last_sync_at&order=updated_at.desc&limit=250`;

  const [workloadResponse, capacityResponse, availabilityResponse, requestsResponse, contractsResponse, clausesResponse, impactsResponse, executionResponse] =
    await Promise.all([
      supabaseRequest(workloadPath),
      supabaseRequest(capacityPath),
      supabaseRequest(availabilityPath),
      supabaseRequest(requestsPath),
      supabaseRequest(contractsPath),
      supabaseRequest(clausesPath),
      supabaseRequest(impactsPath),
      supabaseRequest(executionPath)
    ]);

  if (workloadResponse.ok && capacityResponse.ok) {
    const workload = await workloadResponse.json() as Array<{ estimated_minutes?: number | null; state?: string | null }>;
    const capacity = await capacityResponse.json() as Array<{ available_minutes?: number | null }>;
    const activeMinutes = workload.reduce((sum, item) => sum + Math.max(0, item.estimated_minutes ?? 0), 0);
    const availableMinutes = capacity.reduce((sum, item) => sum + Math.max(0, item.available_minutes ?? 0), 0);
    const utilisation = availableMinutes > 0 ? Math.round((activeMinutes / availableMinutes) * 100) : null;
    result.capacity = {
      state: utilisation === null ? "unknown" : utilisation > 100 ? "overloaded" : utilisation >= 85 ? "tight" : "available",
      utilisation,
      activeMinutes,
      availableMinutes,
      blockers: workload.filter((item) => item.state === "blocked").length
    };
  }

  if (availabilityResponse.ok) {
    const availability = await availabilityResponse.json() as Array<{ availability_type?: string | null; reason_type?: string | null }>;
    const hardUnavailable = availability.filter((item) => item.availability_type === "hard-unavailable").length;
    const protectedOrBusy = availability.filter((item) => ["protected","busy","tentative"].includes(item.availability_type ?? "")).length;
    result.availability = {
      state: hardUnavailable > 0 ? "blocked" : protectedOrBusy > 0 ? "tight" : availability.length > 0 ? "clear" : "unknown",
      hardUnavailable,
      protectedOrBusy,
      internationalDuty: availability.filter((item) => item.reason_type === "international-duty").length
    };
  }

  if (requestsResponse.ok) {
    const requests = await requestsResponse.json() as Array<{ recipient_role?: string | null; due_at?: string | null }>;
    const now = Date.parse(from);
    const overdue = requests.filter((request) =>
      request.due_at && !Number.isNaN(Date.parse(request.due_at)) && Date.parse(request.due_at) < now
    ).length;
    result.requests = {
      state: overdue > 0 ? "overdue" : requests.length > 0 ? "waiting" : "clear",
      pending: requests.length,
      overdue,
      nextRecipient: requests.find((request) => request.recipient_role)?.recipient_role ?? null
    };
  }

  if (contractsResponse.ok && clausesResponse.ok) {
    const documents = await contractsResponse.json() as Array<{ id: string }>;
    const clauses = await clausesResponse.json() as Array<{ id: string }>;
    result.contracts = {
      state: "connected",
      activeDocuments: documents.length,
      verifiedClauses: clauses.length
    };
  }

  if (impactsResponse.ok) {
    const impacts = await impactsResponse.json() as Array<{
      id: string;
      entity_type: "sponsor" | "player" | "campaign" | "fixture" | "season" | "decision";
      entity_id: string;
      relationship_type: string;
      review_state: "pending" | "acknowledged";
      reason: string;
      created_at: string;
    }>;
    const pending = impacts.filter((item) => item.review_state === "pending").length;
    const acknowledged = impacts.filter((item) => item.review_state === "acknowledged").length;
    result.contractImpacts = {
      state: pending > 0 || acknowledged > 0 ? "review" : "clear",
      pending,
      acknowledged
    };

    result.crossAlerts.push(...impacts.slice(0, 12).map((item): DecisionAlert => {
      const href =
        item.entity_type === "fixture" ? "/app/matches/" + encodeURIComponent(item.entity_id) :
        item.entity_type === "player" ? "/app/players" :
        item.entity_type === "sponsor" ? "/app/sponsors" :
        item.entity_type === "campaign" ? "/app/campaigns" :
        item.entity_type === "season" ? "/app/season" : "/app";

      return {
        id: "contract-impact-" + item.id,
        category: "contract",
        priority: item.review_state === "pending" ? "review" : "monitor",
        title: "Contract change · " + item.entity_type + " review required",
        recommendation: "Review the affected " + item.entity_type + " before the next commitment.",
        why: item.reason,
        changed: "Verified material contract truth changed the review state of this " + item.entity_type + ".",
        deadline: "Before next commitment",
        impact: item.relationship_type === "blocks" || item.relationship_type === "requires" ? "High" : "Medium",
        confidence: "High",
        href,
        events: [{
          id: "contract-impact-event-" + item.id,
          at: item.created_at,
          label: "Verified contract impact",
          detail: item.relationship_type.replaceAll("-", " ") + " · sanitised impact review",
          kind: "blocker"
        }]
      };
    }));
  }

  if (executionResponse.ok) {
    const packages = await executionResponse.json() as Array<{
      id: string;
      decision_id: string;
      title: string;
      sync_state: string;
      item_count?: number | null;
      completed_count?: number | null;
      blocked_count?: number | null;
      last_sync_at?: string | null;
    }>;
    const blockedItems = packages.reduce((sum, item) => sum + Math.max(0, item.blocked_count ?? 0), 0);
    const totalItems = packages.reduce((sum, item) => sum + Math.max(0, item.item_count ?? 0), 0);
    const completedItems = packages.reduce((sum, item) => sum + Math.max(0, item.completed_count ?? 0), 0);
    const syncing = packages.some((item) => ["created","syncing","partial","error"].includes(item.sync_state ?? ""));
    result.execution = {
      state: blockedItems > 0 ? "blocked" : syncing ? "syncing" : packages.length > 0 ? "clear" : "unknown",
      packages: packages.length,
      blockedItems,
      completedItems,
      totalItems
    };

    const executionAlerts = packages.filter((item) =>
      (item.blocked_count ?? 0) > 0 || ["partial","error"].includes(item.sync_state)
    );
    result.crossAlerts.push(...executionAlerts.slice(0, 12).map((item): DecisionAlert => {
      const fixtureId = item.decision_id.startsWith("fixture:") ? item.decision_id.slice("fixture:".length) : null;
      const blocked = Math.max(0, item.blocked_count ?? 0);
      return {
        id: "execution-" + item.id,
        fixtureId: fixtureId ?? undefined,
        category: "operations",
        priority: blocked > 0 ? "blocked" : "review",
        title: item.title + " · execution",
        recommendation: blocked > 0 ? "Resolve " + blocked + " blocked external work item" + (blocked === 1 ? "" : "s") + "." : "Review the external sync issue before relying on execution progress.",
        why: blocked > 0 ? "External execution state contains blocked work." : "The connected work package is only partially synced or has an error.",
        changed: "External execution state requires review.",
        deadline: "Operational window",
        impact: blocked > 0 ? "High" : "Medium",
        confidence: "High",
        href: fixtureId ? "/app/matches/" + encodeURIComponent(fixtureId) : "/app/campaigns",
        events: [{
          id: "execution-event-" + item.id,
          at: item.last_sync_at ?? from,
          label: blocked > 0 ? "External work blocked" : "External sync issue",
          detail: blocked + " blocked · " + (item.completed_count ?? 0) + "/" + (item.item_count ?? 0) + " complete",
          kind: "blocker"
        }]
      };
    }));
  }

  return result;
}
