import type { OpportunityRadarItem } from "@/lib/opportunityRadar";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { campaignPlans } from "@/lib/data";

export type DecisionPriority = "act-now" | "review" | "on-track" | "monitor" | "blocked";
export type DecisionCategory = "fixture" | "campaign" | "contract" | "player" | "operations" | "learning";

export type DecisionEvent = {
  id: string;
  at: string;
  label: string;
  detail: string;
  kind: "signal" | "recommendation" | "blocker" | "deadline" | "execution" | "learning";
};

export type DecisionAlert = {
  id: string;
  fixtureId?: string;
  category: DecisionCategory;
  priority: DecisionPriority;
  title: string;
  recommendation: string;
  why: string;
  changed: string;
  deadline: string;
  impact: "High" | "Medium" | "Low";
  confidence: "High" | "Medium" | "Low";
  href: string;
  events: DecisionEvent[];
};

function priorityFor(item: OpportunityRadarItem, blocked: boolean): DecisionPriority {
  if (blocked && item.daysToFixture <= 7) return "blocked";
  if (item.radarState === "Act now") return "act-now";
  if (item.radarState === "Review") return "review";
  if (item.radarState === "Monitor") return "monitor";
  return "on-track";
}

function impactFor(item: OpportunityRadarItem): DecisionAlert["impact"] {
  if ((item.opportunityScore ?? 0) >= 75 || item.materialSignalCount >= 3) return "High";
  if ((item.opportunityScore ?? 0) >= 60 || item.materialSignalCount >= 1) return "Medium";
  return "Low";
}

export function buildDecisionAlerts(radar: OpportunityRadarItem[]): DecisionAlert[] {
  return radar.map((item) => {
    const live = getCurrentProductOpportunity(item.fixtureId);
    const campaign = campaignPlans.campaigns.find((entry) => entry.fixtureId === item.fixtureId) ?? null;
    const unresolved = campaign?.approvals.filter((approval) => approval.state !== "ready") ?? [];
    const blocked = unresolved.length > 0;
    const recentSignals = live?.liveSignals
      .filter((signal) => signal.materiality !== "low")
      .sort((a,b) => (b.observedAt ?? "").localeCompare(a.observedAt ?? "")) ?? [];

    const events: DecisionEvent[] = [
      ...recentSignals.slice(0, 3).map((signal) => ({
        id: `${item.fixtureId}-signal-${signal.id}`,
        at: signal.observedAt,
        label: signal.title,
        detail: `${signal.materiality} materiality · ${signal.state} · ${signal.sourceName}`,
        kind: "signal" as const
      })),
      ...(blocked ? [{
        id: `${item.fixtureId}-blocker`,
        at: live?.updatedAt ?? item.date,
        label: "Approval gate unresolved",
        detail: unresolved.map((approval) => approval.label.en).join(" · "),
        kind: "blocker" as const
      }] : []),
      {
        id: `${item.fixtureId}-recommendation`,
        at: live?.updatedAt ?? item.date,
        label: "Current recommendation",
        detail: live?.nextAction.label ?? item.opportunity,
        kind: "recommendation" as const
      }
    ].sort((a,b) => b.at.localeCompare(a.at));

    return {
      id: `fixture-${item.fixtureId}`,
      fixtureId: item.fixtureId,
      category: "fixture",
      priority: priorityFor(item, blocked),
      title: `${item.opponent} · ${item.daysToFixture <= 0 ? "fixture window" : `${item.daysToFixture} days`}`,
      recommendation: live?.nextAction.label ?? item.opportunity,
      why: live?.whyNow ?? "The evidence state currently makes this fixture worth monitoring.",
      changed: item.recentMaterialSignalCount > 0
        ? `${item.recentMaterialSignalCount} new material signal${item.recentMaterialSignalCount === 1 ? "" : "s"} in the last 7 days`
        : blocked
          ? `${unresolved.length} approval gate${unresolved.length === 1 ? "" : "s"} still unresolved`
          : "No material change detected in the last 7 days",
      deadline: live?.nextAction.deadline ?? item.date,
      impact: impactFor(item),
      confidence: item.confidence,
      href: `/app/matches/${item.fixtureId}`,
      events
    };
  });
}

export function decisionSummary(alerts: DecisionAlert[]) {
  return {
    actNow: alerts.filter((item) => item.priority === "act-now").length,
    review: alerts.filter((item) => item.priority === "review").length,
    blocked: alerts.filter((item) => item.priority === "blocked").length,
    onTrack: alerts.filter((item) => item.priority === "on-track").length,
    monitor: alerts.filter((item) => item.priority === "monitor").length,
    attention: alerts.filter((item) => ["act-now", "review", "blocked"].includes(item.priority)).length
  };
}
