import type { Metadata } from "next";
import { ClubPilotProposition } from "@/components/ClubPilotProposition";

export const metadata: Metadata = {
  title: "For clubs · AVELA Decision Intelligence Pilot",
  description: "Start with 4–6 fixtures and one or two decision workflows. Keep your existing stack and prove whether AVELA improves decision speed, coordination and learning."
};

export default function ForClubsPage() {
  return <ClubPilotProposition />;
}
