import type { Metadata } from "next";
import { LocalizedStoryPage } from "@/components/LocalizedStoryPage";

export const metadata: Metadata = {
  title: "Commercial Case Study",
  description:
    "How the London City Fan Opportunity Lab turns territory, fixtures, attendance and public audience signals into governed campaigns and repeat-demand learning."
};

export default function CaseStudyPage() {
  return <LocalizedStoryPage />;
}
