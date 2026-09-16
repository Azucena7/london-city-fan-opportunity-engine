import type { Metadata } from "next";
import { ExperienceDemandValidation } from "@/components/ExperienceDemandValidation";
import { experienceDemand } from "@/lib/data";

export const metadata: Metadata = {
  title: "Experience Demand Validation",
  description: "A bilingual, no-sale validation lab for London City matchday, VIP and international experience concepts."
};

export default function ExperiencePage() {
  return <ExperienceDemandValidation data={experienceDemand} />;
}
