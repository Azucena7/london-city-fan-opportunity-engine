import type { Metadata } from "next";
import { partnerCommercialPack, pilotReadiness } from "@/lib/data";
import { PartnerCommercialPack } from "@/components/PartnerCommercialPack";

export const metadata: Metadata = {
  title: "Partnerships",
  description: "A commercial decision workspace for prioritising evidence-gated matchday partnership opportunities."
};

export default function PartnersPage() {
  return <PartnerCommercialPack data={partnerCommercialPack} readiness={pilotReadiness} />;
}
