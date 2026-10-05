import type { Metadata } from "next";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { ClubSetup } from "@/components/ClubSetup";
import { ClubPilotReadiness } from "@/components/ClubPilotReadiness";

export const metadata: Metadata = {
  title: "Club setup · AVELA",
  description: "Configure fixtures, channels, objectives, brand rules and approvals once for the club."
};

export default function ClubSetupPage() {
  return (
    <AppWorkspaceShell
      active="setup"
      eyebrow="Club system"
      title="Club setup"
      subtitle="Set the operating defaults once so every fixture, campaign and recommendation starts with the right context."
    >
      <ClubPilotReadiness />
      <ClubSetup />
    </AppWorkspaceShell>
  );
}
