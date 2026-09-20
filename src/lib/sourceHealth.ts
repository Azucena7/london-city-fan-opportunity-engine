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

export type SourceHealthData = {
  version: string;
  checkedAt: string;
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
