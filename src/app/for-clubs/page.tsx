import type { Metadata } from "next";
import { ClubPilotProposition } from "@/components/ClubPilotProposition";

export const metadata: Metadata = {
  title: "For Clubs · Marketing & Commercial Pilot",
  description: "Run a focused AVELA pilot with a football club marketing or commercial team: 4–6 fixtures or a bounded campaign window, one or two workflows and measurable decision outcomes."
};

export default function ForClubsPage() {
  return <ClubPilotProposition />;
}
