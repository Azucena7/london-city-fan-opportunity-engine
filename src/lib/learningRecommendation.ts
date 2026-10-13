import type { ProductOpportunity } from "@/lib/productOpportunity";
import type { ProductResults } from "@/lib/productResults";

export type NextFixtureLearning = {
  confidence: "Low" | "Medium" | "High";
  evidenceState: "missing" | "descriptive" | "measured";
  learned: string;
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
      learned: "AVELA has not learned enough to scale this play yet; the next improvement is better outcome evidence.",
      repeat: "Keep the audience hypothesis provisional rather than scaling it.",
      change: "Do not increase campaign scope or spend based on unmeasured outcomes.",
      measure: "Connect matched purchase, scan and repeat evidence for the fixture before promoting the hypothesis.",
      rationale: "Outcome evidence is incomplete, so the safest next-fixture adjustment is to improve measurement rather than claim learning."
    };
  }

  // Missing is not zero: a metric absent from the export must never drive a recommendation.
  const repeatRate = results.repeatPurchaseRate;
  const scanRate = results.scanRate;
  const attributed = results.campaignAttributedTickets;

  const repeat =
    repeatRate === null
      ? "Keep the recent-attendee cohort as a test cell until repeat purchase is measured."
      : repeatRate >= 0.2
        ? "Keep recent-home attendees as a priority audience for the next comparable fixture."
        : "Keep the recent-attendee cohort as a test cell, but do not make it the only acquisition audience.";

  const change =
    scanRate === null
      ? "Connect scan status before changing reminder timing or acquisition volume."
      : scanRate < 0.8
        ? "Tighten pre-match reminder timing and attendance follow-up before increasing acquisition volume."
        : attributed === null || attributed === 0
          ? "Improve campaign tagging and channel-level attribution before increasing campaign complexity."
          : "Keep the core proposition stable and change only one audience or timing variable in the next test.";

  const measure =
    attributed !== null && attributed > 0
      ? "Predefine a holdout or credible comparison group so the next fixture can test incrementality, not only attribution."
      : "Require campaign identifiers on purchase and scan records so channel activity can be matched to observed behaviour.";

  const evidenceState = attributed !== null && attributed > 0 && scanRate !== null && scanRate > 0 ? "measured" : "descriptive";
  const confidence = evidenceState === "measured" && repeatRate !== null && repeatRate > 0 ? "Medium" : "Low";

  return {
    confidence,
    evidenceState,
    learned:
      repeatRate === null
        ? "Repeat purchase is not measured yet, so AVELA cannot say whether recent attendees should stay a priority audience."
        : repeatRate >= 0.2
          ? "Observed repeat behaviour supports keeping recent-home attendees in the next comparable test, but not automatic scaling."
          : "Observed behaviour does not yet justify making the recent-attendee cohort the only acquisition audience.",
    repeat,
    change,
    measure,
    rationale:
      "This recommendation uses observed club aggregates only. It can guide the next experiment, but it does not treat attributed tickets as causal lift."
  };
}
