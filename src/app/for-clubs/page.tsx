import type { Metadata } from "next";
import { ClubPilotProposition } from "@/components/ClubPilotProposition";

export const metadata: Metadata = {
  title: "For clubs · An evidence-led fan growth pilot",
  description: "A proposed 90-day pilot: fixture decisions, approvals and honest commercial measurement."
};

export default function ForClubsPage() {
  return <ClubPilotProposition />;
}
