import sourceHealthRaw from "../../data/live/source-health.json";
import tflRailRaw from "../../data/live/tfl-rail.json";

export type MobilityProviderState = "live" | "degraded" | "not-configured";

export type MobilityProviderReadiness = {
  id: "road" | "rail" | "routing";
  label: string;
  state: MobilityProviderState;
  /** What a person reads: a daily snapshot says "checked daily", never "live". */
  stateLabel: string;
  provider: string;
  sourceUrl: string | null;
  checkedAt: string | null;
  freshnessMinutes: number | null;
  scope: string;
  decisionRule: string;
  fallback: string;
};

type SourceHealthItem = {
  id: string;
  state: string;
  lastSuccessfulAt?: string | null;
  lastAttemptAt?: string | null;
  note?: { en?: string };
};

const sourceHealth = sourceHealthRaw as { sources?: SourceHealthItem[] };
const roadHealth = sourceHealth.sources?.find((item) => item.id === "tfl-road") ?? null;
const rdmHealth = sourceHealth.sources?.find((item) => item.id === "national-rail-rdm") ?? null;
const tflRailHealth = sourceHealth.sources?.find((item) => item.id === "tfl-national-rail") ?? null;
// Rail Data Marketplace leads when a product is connected; until then rail status is read
// through TfL (Southeastern and Thameslink), which is a daily snapshot, not a live feed.
const railViaRdm = rdmHealth?.state === "operational";
const railHealth = railViaRdm ? rdmHealth : tflRailHealth ?? rdmHealth;

type RailDisruption = { line: string; status: string; reason: string | null };
const tflRail = tflRailRaw as { lastSuccessfulAt: string | null; days: Array<{ date: string; disruptions: RailDisruption[] }> };

/** TfL rail status stored for one fixture day, or null when that day was not read. */
export function railStatusForFixture(date: string) {
  if (railViaRdm || tflRailHealth?.state !== "operational" || !tflRail.lastSuccessfulAt) return null;
  const day = tflRail.days.find((entry) => entry.date === date);
  return day ? { checkedAt: tflRail.lastSuccessfulAt, disruptions: day.disruptions } : null;
}

function checkedDaily(item: SourceHealthItem | null) {
  const at = item?.lastSuccessfulAt;
  return at ? "checked daily · " + new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" }) : "checked daily";
}

function labelFor(state: MobilityProviderState, item: SourceHealthItem | null, dailySnapshot: boolean) {
  if (state === "live") return dailySnapshot ? checkedDaily(item) : "live";
  return state.replace("-", " ");
}

function mapSourceState(item: SourceHealthItem | null): MobilityProviderState {
  if (!item) return "not-configured";
  if (item.state === "operational") return "live";
  if (item.state === "degraded") return "degraded";
  return "not-configured";
}

function mapRoadState(item: SourceHealthItem | null): MobilityProviderState {
  const sourceState = mapSourceState(item);
  if (!item || sourceState !== "not-configured") return sourceState;
  // TfL's road-disruption endpoint supports an anonymous runtime fallback.
  // Keep it degraded until a timestamped runtime response is observed rather than
  // claiming the provider is fully live from static source-health alone.
  return "degraded";
}

export const mobilityProviderReadiness: MobilityProviderReadiness[] = [
  {
    id: "road",
    label: "Road & traffic",
    state: mapRoadState(roadHealth),
    // The daily refresh stores a TfL snapshot; it is not a live feed.
    stateLabel: labelFor(mapRoadState(roadHealth), roadHealth, true),
    provider: "Transport for London Unified API",
    sourceUrl: "https://api.tfl.gov.uk/",
    checkedAt: roadHealth?.lastAttemptAt ?? roadHealth?.lastSuccessfulAt ?? null,
    freshnessMinutes: null,
    scope: "Material road incidents and closures that could affect supporter arrival.",
    decisionRule: "Escalate only when a verified incident materially affects a relevant supporter corridor or recommended arrival window.",
    fallback: mapSourceState(roadHealth) === "not-configured"
      ? "TfL anonymous fallback is available at runtime; treat it as degraded until a timestamped live response is observed. Credentials improve reliability."
      : roadHealth?.note?.en ?? "Show official club directions and do not infer live road conditions."
  },
  {
    id: "rail",
    label: "Rail",
    state: mapSourceState(railHealth),
    // Rail via TfL is a daily snapshot; a connected RDM product would be a live feed.
    stateLabel: labelFor(mapSourceState(railHealth), railHealth, !railViaRdm),
    provider: railViaRdm || !tflRailHealth ? "National Rail / Rail Data Marketplace" : "National Rail status via TfL",
    sourceUrl: railViaRdm || !tflRailHealth ? "https://raildata.org.uk/" : "https://api.tfl.gov.uk/",
    checkedAt: railHealth?.lastAttemptAt ?? railHealth?.lastSuccessfulAt ?? null,
    freshnessMinutes: null,
    scope: railViaRdm || !tflRailHealth
      ? "Service disruption and station-level context relevant to matchday corridors."
      : "Southeastern and Thameslink status on the fixture day for Hayes, Bromley South and Bromley North, read daily.",
    decisionRule: "Surface only disruption relevant to the fixture window and selected origin corridors.",
    fallback: railHealth?.note?.en ?? "Keep rail guidance informational and direct supporters to official operator information."
  },
  {
    id: "routing",
    label: "Journey routing",
    state: "not-configured",
    stateLabel: "not configured",
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
