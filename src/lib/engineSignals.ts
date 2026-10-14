type HealthSource = { id: string; state: string };

export type EngineSignalState = "live" | "pilot";

export type EngineSignal = {
  id: string;
  label: string;
  detail: string;
  state: EngineSignalState;
};

// Each signal family the Opportunity Engine reads, and the registered sources that feed it.
// A family reads as live only when one of its own sources is operational today; anything
// else is shown as connecting in a pilot, never as a signal AVELA already watches.
export const ENGINE_SIGNAL_FAMILIES = [
  { id: "weather", label: "Weather", detail: "Matchday forecast", sourceIds: ["open-meteo"] },
  { id: "city-events", label: "City events", detail: "Concerts, festivals, sport", sourceIds: ["ticketmaster-events"] },
  { id: "competing-football", label: "Competing football", detail: "Fixtures and broadcast picks", sourceIds: ["ticketmaster-events", "club-public-web"] },
  { id: "calendar", label: "Calendar moments", detail: "Bank holidays, international windows", sourceIds: ["uk-bank-holidays", "fifa-international-windows"] },
  { id: "transport", label: "Transport", detail: "Road and rail disruption", sourceIds: ["tfl-road", "tfl-national-rail", "national-rail-rdm"] },
  { id: "fan-demand", label: "Fan demand", detail: "CRM and ticketing", sourceIds: ["crm-ticketing"] }
] as const;

export function engineSignals(health: { sources: HealthSource[] }): EngineSignal[] {
  const operational = new Set(health.sources.filter((source) => source.state === "operational").map((source) => source.id));
  return ENGINE_SIGNAL_FAMILIES.map((family) => ({
    id: family.id,
    label: family.label,
    detail: family.detail,
    state: family.sourceIds.some((id) => operational.has(id)) ? "live" : "pilot"
  }));
}
