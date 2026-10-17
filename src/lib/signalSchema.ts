// What every signal must make explicit before it can move a decision: its class of evidence,
// how sure we are, where it applies and until when. Pure, so the rules can be tested alone.

type SignalLike = {
  state: "measured" | "confirmed" | "reported" | "forecast" | "inferred" | "waiting";
  confidence?: "high" | "medium" | "low";
  validUntil?: string;
};

export type EvidenceClass = "observed" | "forecast" | "inferred" | "pending";

/** Observed facts, forecasts and inferences stay apart; a waiting signal is not evidence yet. */
export function evidenceClass(state: SignalLike["state"]): EvidenceClass {
  if (state === "measured" || state === "confirmed" || state === "reported") return "observed";
  if (state === "forecast") return "forecast";
  if (state === "inferred") return "inferred";
  return "pending";
}

/** A signal past its validUntil date no longer informs a decision. No date means no expiry set. */
export function isExpired(signal: SignalLike, today: string) {
  return Boolean(signal.validUntil && signal.validUntil < today);
}

export function confidenceLabel(signal: SignalLike) {
  return signal.confidence ? `${signal.confidence} confidence` : "confidence not rated";
}
