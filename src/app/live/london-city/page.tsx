import type { Metadata } from "next";
import { LondonCityCase } from "@/components/LondonCityCase";
import { calendar, currentState, decisionValidation, roadmapItems } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = {
  title: "London City Live · AVELA",
  description: "A live public case showing what the engine sees before each match and what happens next."
};

export default function LondonCityLivePage() {
  return (
    <LondonCityCase
      calendar={calendar}
      reviewedAt={currentState.manual_reviewed_at}
      validation={decisionValidation}
      actions={roadmapItems}
      opportunity={getCurrentProductOpportunity()}
    />
  );
}
