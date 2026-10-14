type Localised = { en: string; es: string };

export type RegisterSource = {
  id: string;
  label: Localised;
  category: string;
  state: string;
  lastSuccessfulAt: string | null;
  ownerAction: Localised | null;
  note: Localised;
};

export type RegisterDecision = {
  label: Localised;
  requiredSourceIds: string[];
  supportingSourceIds: string[];
};

export type RegisterRow = {
  id: string;
  name: string;
  category: string;
  state: string;
  stateLabel: string;
  lastSuccessfulAt: string | null;
  usedBy: string[];
  nextStep: string | null;
};

export type SourceFilter = "all" | "attention" | "operational";

// Display labels follow the source states in the AI working agreement (planned, configured,
// verifying, healthy, degraded, unavailable); the stored states in source-health.json are unchanged.
const STATE_LABELS: Record<string, string> = {
  operational: "Healthy",
  degraded: "Degraded",
  blocked: "Unavailable",
  "not-configured": "Planned",
  "requires-access": "Requires access"
};

// Most urgent first, so the register reads as a to-do list.
const STATE_ORDER = ["blocked", "not-configured", "degraded", "requires-access", "operational"];

export function stateLabel(state: string) {
  return STATE_LABELS[state] ?? "Unknown";
}

/** One row per registered source, with the decisions it feeds and the next owner step. */
export function registerRows(health: { sources: RegisterSource[]; decisions: RegisterDecision[] }): RegisterRow[] {
  return health.sources
    .map((source) => ({
      id: source.id,
      name: source.label.en,
      category: source.category.replaceAll("-", " "),
      state: source.state,
      stateLabel: stateLabel(source.state),
      lastSuccessfulAt: source.lastSuccessfulAt,
      usedBy: health.decisions
        .filter((decision) => decision.requiredSourceIds.includes(source.id) || decision.supportingSourceIds.includes(source.id))
        .map((decision) => decision.label.en),
      // Without a named owner action, the source note says what is missing.
      nextStep: source.state === "operational" ? null : source.ownerAction?.en ?? source.note.en
    }))
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || a.name.localeCompare(b.name));
}

export function parseSourceFilter(value: string | string[] | undefined): SourceFilter {
  return value === "attention" || value === "operational" ? value : "all";
}

export function filterRows(rows: RegisterRow[], filter: SourceFilter) {
  if (filter === "operational") return rows.filter((row) => row.state === "operational");
  if (filter === "attention") return rows.filter((row) => row.state !== "operational");
  return rows;
}
