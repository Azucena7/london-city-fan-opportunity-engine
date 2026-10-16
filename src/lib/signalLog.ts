// The signal log: every sourced signal, when it arrived, and what it changed in the engine's
// read of a fixture. The effect is measured, not narrated: each signal is removed and the
// fixture is read again with the same engine functions, so "it changed the state" means the
// state really differs without it. Pure functions only, so the rules stay testable.

export type RadarRead = {
  radarState: string;
  confidence: string;
  rank: number;
};

export type SignalEffectKind = "state" | "confidence" | "priority" | "none" | "off-radar";

export type SignalEffect = {
  kind: SignalEffectKind;
  fixtureId: string | null;
  label: string;
};

export type SignalLogSignal = {
  id: string;
  fixtureId?: string;
  category: string;
  state: string;
  direction: string;
  materiality: "high" | "medium" | "low";
  observedAt: string;
  title: { en: string };
  sourceName: string;
  sourceUrl: string;
};

export type SignalLogEntry = {
  id: string;
  observedAt: string;
  title: string;
  category: string;
  state: string;
  direction: string;
  materiality: SignalLogSignal["materiality"];
  sourceName: string;
  sourceUrl: string;
  isNew: boolean;
  fixtureLabels: string[];
  effects: SignalEffect[];
  /** The strongest effect, for sorting and the summary counts. */
  strongest: SignalEffectKind;
};

const effectOrder: SignalEffectKind[] = ["state", "confidence", "priority", "none", "off-radar"];

/**
 * Compares a fixture's read with and without one signal. When nothing moves, the label says
 * why: low-materiality signals are not counted, and a material one only adds priority until
 * the engine's evidence weight reaches its cap. Either way the signal stays in the brief's evidence.
 */
export function describeSignalEffect(
  fixtureId: string,
  fixtureLabel: string,
  withSignal: RadarRead,
  withoutSignal: RadarRead,
  materiality: SignalLogSignal["materiality"] = "medium"
): SignalEffect {
  if (withSignal.radarState !== withoutSignal.radarState) {
    return { kind: "state", fixtureId, label: `Moved ${fixtureLabel} from ${withoutSignal.radarState} to ${withSignal.radarState}` };
  }
  if (withSignal.confidence !== withoutSignal.confidence) {
    return { kind: "confidence", fixtureId, label: `Raised ${fixtureLabel} confidence from ${withoutSignal.confidence} to ${withSignal.confidence}` };
  }
  const delta = withSignal.rank - withoutSignal.rank;
  if (delta !== 0) {
    return { kind: "priority", fixtureId, label: `${delta > 0 ? "+" : ""}${delta} priority for ${fixtureLabel}; state stays ${withSignal.radarState}` };
  }
  return {
    kind: "none",
    fixtureId,
    label: materiality === "low"
      ? `No change to ${fixtureLabel}: low materiality is not counted`
      : `No change to ${fixtureLabel}: its evidence weight was already at the cap`
  };
}

/** Why a signal is outside the Radar, which only reads the next upcoming home fixtures. */
export function offRadarEffect(reason: "no-fixture" | "away" | "played" | "beyond-horizon" | "unknown-fixture", fixtureLabel?: string): SignalEffect {
  const labels = {
    "no-fixture": "Not tied to a fixture: context only",
    away: `${fixtureLabel ?? "Away fixture"}: away fixtures are not on the Radar`,
    played: `${fixtureLabel ?? "Fixture"} already played`,
    "beyond-horizon": `${fixtureLabel ?? "Fixture"} is beyond the Radar horizon`,
    "unknown-fixture": "Fixture not in the calendar"
  } as const;
  return { kind: "off-radar", fixtureId: null, label: labels[reason] };
}

export function strongestEffect(effects: SignalEffect[]): SignalEffectKind {
  return effects.map((effect) => effect.kind).sort((a, b) => effectOrder.indexOf(a) - effectOrder.indexOf(b))[0] ?? "off-radar";
}

/** True when a signal was observed in the seven days up to the reference date. */
export function isRecentSignal(observedAt: string, referenceIso: string, days = 7) {
  const observed = new Date(observedAt).getTime();
  const reference = new Date(referenceIso.length === 10 ? `${referenceIso}T23:59:59Z` : referenceIso).getTime();
  return Number.isFinite(observed) && observed <= reference && observed >= reference - days * 86400000;
}

export function summariseSignalLog(entries: SignalLogEntry[]) {
  return {
    total: entries.length,
    recent: entries.filter((entry) => entry.isNew).length,
    changedState: entries.filter((entry) => entry.strongest === "state").length,
    changedConfidence: entries.filter((entry) => entry.strongest === "confidence").length,
    changedPriority: entries.filter((entry) => entry.strongest === "priority").length,
    noChange: entries.filter((entry) => entry.strongest === "none" || entry.strongest === "off-radar").length
  };
}
