import type { Metadata } from "next";
import { partnerCommercialPack, pilotReadiness } from "@/lib/data";
import { PartnerCommercialPack } from "@/components/PartnerCommercialPack";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "Governed partnership hypotheses for matchday mobility, travel and hospitality pilots."
};

export default function PartnersPage() {
  return <PartnerCommercialPack data={partnerCommercialPack} readiness={pilotReadiness} />;
}
