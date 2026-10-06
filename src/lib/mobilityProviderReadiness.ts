export type MobilityProviderState = "live" | "degraded" | "not-configured";

export type MobilityProviderReadiness = {
  id: "road" | "rail" | "routing";
  label: string;
  state: MobilityProviderState;
  provider: string;
  sourceUrl: string | null;
  checkedAt: string | null;
  freshnessMinutes: number | null;
  scope: string;
  decisionRule: string;
  fallback: string;
};

export const mobilityProviderReadiness: MobilityProviderReadiness[] = [
  {
    id: "road",
    label: "Road & traffic",
    state: "not-configured",
    provider: "Traffic provider pending",
    sourceUrl: null,
    checkedAt: null,
    freshnessMinutes: null,
    scope: "Material road incidents and closures that could affect supporter arrival.",
    decisionRule: "Escalate only when a verified incident materially affects a relevant supporter corridor or recommended arrival window.",
    fallback: "Show official club directions and do not infer live road conditions."
  },
  {
    id: "rail",
    label: "Rail",
    state: "not-configured",
    provider: "Rail Data Marketplace / operator feed pending",
    sourceUrl: null,
    checkedAt: null,
    freshnessMinutes: null,
    scope: "Service disruption and station-level context relevant to matchday corridors.",
    decisionRule: "Surface only disruption relevant to the fixture window and selected origin corridors.",
    fallback: "Keep rail guidance informational and direct supporters to official operator information."
  },
  {
    id: "routing",
    label: "Journey routing",
    state: "not-configured",
    provider: "Journey technology partner pending",
    sourceUrl: null,
    checkedAt: null,
    freshnessMinutes: null,
    scope: "Origin-to-stadium route planning and estimated arrival guidance.",
    decisionRule: "Do not present a route as live until an authorised provider returns a timestamped route response.",
    fallback: "Use representative corridors only; never label modelled travel friction as a live journey."
  }
];

export function summariseMobilityProviderReadiness() {
  const live = mobilityProviderReadiness.filter((item) => item.state === "live").length;
  const degraded = mobilityProviderReadiness.filter((item) => item.state === "degraded").length;
  return {
    live,
    degraded,
    configured: live + degraded,
    total: mobilityProviderReadiness.length,
    state: live === mobilityProviderReadiness.length ? "live" : live || degraded ? "degraded" : "not-configured"
  } as const;
}
