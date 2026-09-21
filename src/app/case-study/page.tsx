import type { Metadata } from "next";
import { LocalizedStoryPage } from "@/components/LocalizedStoryPage";
import { decisionValidation } from "@/lib/data";

export const metadata: Metadata = {
  title: "Evidence Case Study",
  description:
    "What the London City Fan Opportunity Lab has built, what has been observed in market action, and what still requires club data to prove impact."
};

export default function CaseStudyPage() {
  return <LocalizedStoryPage validation={decisionValidation} />;
}
