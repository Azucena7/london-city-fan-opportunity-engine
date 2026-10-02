import type { ProductOpportunity } from "@/lib/productOpportunity";
import type { ProductResults } from "@/lib/productResults";

export type NextFixtureLearning = {
  confidence: "Low" | "Medium" | "High";
  evidenceState: "missing" | "descriptive" | "measured";
  repeat: string;
  change: string;
  measure: string;
  rationale: string;
};

export function deriveNextFixtureLearning(
  opportunity: ProductOpportunity | null,
  results: ProductResults | null
): NextFixtureLearning {
  if (!opportunity || !results || results.state !== "measured") {
    return {
      confidence: "Low",
      evidenceState: "missing",
      repeat: "Keep the audience hypothesis provisional rather than scaling it.",
      change: "Do not increase campaign scope or spend based on unmeasured outcomes.",
      measure: "Connect matched purchase, scan and repeat evidence for the fixture before promoting the hypothesis.",
      rationale: "Outcome evidence is incomplete, so the safest next-fixture adjustment is to improve measurement rather than claim learning."
    };
  }

  const repeatRate = results.repeatPurchaseRate ?? 0;
  const scanRate = results.scanRate ?? 0;
  const attributed = results.campaignAttributedTickets ?? 0;

  const repeat =
    repeatRate >= 0.2
      ? "Keep recent-home attendees as a priority audience for the next comparable fixture."
      : "Keep the recent-attendee cohort as a test cell, but do not make it the only acquisition audience.";

  const change =
    scanRate < 0.8
      ? "Tighten pre-match reminder timing and attendance follow-up before increasing acquisition volume."
      : attributed === 0
        ? "Improve campaign tagging and channel-level attribution before increasing campaign complexity."
        : "Keep the core proposition stable and change only one audience or timing variable in the next test.";

  const measure =
    attributed > 0
      ? "Predefine a holdout or credible comparison group so the next fixture can test incrementality, not only attribution."
      : "Require campaign identifiers on purchase and scan records so channel activity can be matched to observed behaviour.";

  const evidenceState = attributed > 0 && scanRate > 0 ? "measured" : "descriptive";
  const confidence = evidenceState === "measured" && repeatRate > 0 ? "Medium" : "Low";

  return {
    confidence,
    evidenceState,
    repeat,
    change,
    measure,
    rationale:
      "This recommendation uses observed club aggregates only. It can guide the next experiment, but it does not treat attributed tickets as causal lift."
  };
}
