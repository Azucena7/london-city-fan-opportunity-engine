type Localised = { en: string; es: string };

export type SourceHealthSource = {
  id: string;
  label: Localised;
  state: string;
};

export type SourceHealthDecision = {
  id: string;
  label: Localised;
  requiredSourceIds: string[];
  supportingSourceIds: string[];
};

export type SourceGap = {
  id: string;
  label: string;
  state: string;
  role: "required" | "supporting";
  affects: string[];
};

export type SourceCoverage = {
  total: number;
  operational: number;
  gaps: SourceGap[];
};

/** Decision areas an Opportunity Brief leans on, as listed in data/live/source-health.json. */
export const BRIEF_DECISION_IDS = ["fixture-planning", "attention-campaign", "matchday-travel", "conversion-retention"];

/**
 * Summarises which sources behind the given decisions are not operational, so a brief can
 * say what it is missing instead of letting an absent source read as "nothing happened".
 * Required gaps are listed before supporting ones.
 */
export function summariseSourceCoverage(
  health: { sources: SourceHealthSource[]; decisions: SourceHealthDecision[] },
  decisionIds: string[]
): SourceCoverage {
  const sourceById = new Map(health.sources.map((source) => [source.id, source]));
  const usage = new Map<string, { role: SourceGap["role"]; affects: string[] }>();

  for (const decision of health.decisions.filter((item) => decisionIds.includes(item.id))) {
    const roles: Array<[string[], SourceGap["role"]]> = [[decision.requiredSourceIds, "required"], [decision.supportingSourceIds, "supporting"]];
    for (const [ids, role] of roles) {
      for (const id of ids) {
        if (!sourceById.has(id)) continue;
        const entry = usage.get(id) ?? { role, affects: [] };
        if (role === "required") entry.role = "required";
        if (!entry.affects.includes(decision.label.en)) entry.affects.push(decision.label.en);
        usage.set(id, entry);
      }
    }
  }

  const gaps: SourceGap[] = [];
  let operational = 0;
  for (const [id, entry] of usage) {
    const source = sourceById.get(id)!;
    if (source.state === "operational") {
      operational += 1;
      continue;
    }
    gaps.push({ id, label: source.label.en, state: source.state.replaceAll("-", " "), role: entry.role, affects: entry.affects });
  }
  gaps.sort((a, b) => (a.role === b.role ? 0 : a.role === "required" ? -1 : 1));

  return { total: usage.size, operational, gaps };
}
