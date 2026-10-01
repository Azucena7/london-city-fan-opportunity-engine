import type { Metadata } from "next";
import { LondonCityCase } from "@/components/LondonCityCase";
import { calendar, currentState, decisionValidation, roadmapItems } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";

export const metadata: Metadata = { title: "London City · Case status" };

export default function LondonCityPage() {
  return <LondonCityCase calendar={calendar} reviewedAt={currentState.manual_reviewed_at}
    validation={decisionValidation} actions={roadmapItems} opportunity={getCurrentProductOpportunity()} />;
}
