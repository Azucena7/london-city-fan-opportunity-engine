import type { Metadata } from "next";
import { LocalizedStoryPage } from "@/components/LocalizedStoryPage";

export const metadata: Metadata = {
  title: "Case Study | London City Fan Opportunity Lab",
  description:
    "A short public case study on finding, prioritising and converting recurring audiences for London City Lionesses, with a link to the full methodology deck."
};

export default function CaseStudyPage() {
  return <LocalizedStoryPage />;
}
