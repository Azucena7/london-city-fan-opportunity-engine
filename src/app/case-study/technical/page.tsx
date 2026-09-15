import type { Metadata } from "next";
import { LocalizedTechnicalCaseStudy } from "@/components/LocalizedTechnicalCaseStudy";

export const metadata: Metadata = {
  title: "Technical Case Study",
  description: "How the London City Fan Opportunity Lab connects public sources, versioned data contracts, decision models, campaign briefs and CRM-ready measurement."
};

export default function TechnicalCaseStudyPage() {
  return <LocalizedTechnicalCaseStudy />;
}
