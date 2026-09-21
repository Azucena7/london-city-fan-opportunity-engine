import sourceHealthRaw from "../../data/live/source-health.json";

export type SourceHealthState = "operational" | "degraded" | "blocked" | "not-configured" | "requires-access";

export type SourceHealthItem = {
  id: string;
  label: { en: string; es: string };
  category: string;
  access: string;
  state: SourceHealthState;
  method: string;
  cadence: string;
  lastSuccessfulAt: string | null;
  ownerAction: { en: string; es: string } | null;
  note: { en: string; es: string };
};

export type DecisionReliabilityState = "reliable" | "qualified" | "blocked" | "access-limited";

export type DecisionReliabilityItem = {
  id: string;
  label: { en: string; es: string };
  question: { en: string; es: string };
  route: string;
  requiredSourceIds: string[];
  supportingSourceIds: string[];
  nextAction: { en: string; es: string };
};

export type SourceHealthData = {
  version: string;
  checkedAt: string;
  decisions: DecisionReliabilityItem[];
  sources: SourceHealthItem[];
};

export const sourceHealth = sourceHealthRaw as SourceHealthData;

export function sourceHealthCounts(data: SourceHealthData) {
  return data.sources.reduce(
    (counts, source) => {
      if (source.state === "operational") counts.operational += 1;
      else if (source.state === "degraded") counts.degraded += 1;
      else counts.action += 1;
      return counts;
    },
    { operational: 0, degraded: 0, action: 0 }
  );
}


export function decisionReliabilityState(data: SourceHealthData, decision: DecisionReliabilityItem): DecisionReliabilityState {
  const required = decision.requiredSourceIds
    .map((id) => data.sources.find((source) => source.id === id))
    .filter(Boolean) as SourceHealthItem[];
  const supporting = decision.supportingSourceIds
    .map((id) => data.sources.find((source) => source.id === id))
    .filter(Boolean) as SourceHealthItem[];

  if (required.some((source) => source.state === "requires-access")) return "access-limited";
  if (required.some((source) => source.state === "blocked" || source.state === "not-configured")) return "blocked";
  if (required.some((source) => source.state === "degraded")) return "qualified";
  if (supporting.some((source) => source.state !== "operational")) return "qualified";
  return "reliable";
}

export function decisionReliabilityCounts(data: SourceHealthData) {
  return data.decisions.reduce(
    (counts, decision) => {
      counts[decisionReliabilityState(data, decision)] += 1;
      return counts;
    },
    { reliable: 0, qualified: 0, blocked: 0, "access-limited": 0 } as Record<DecisionReliabilityState, number>
  );
}
