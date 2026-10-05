import type { Metadata } from "next";
import { AppWorkspaceShell, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { ClubSetup } from "@/components/ClubSetup";
import { ClubPilotReadiness } from "@/components/ClubPilotReadiness";
import { WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./setup.module.css";

export const metadata: Metadata = {
  title: "Club setup · AVELA",
  description: "Configure fixtures, channels, objectives, brand rules and approvals once for the club."
};

export default function ClubSetupPage() {
  return (
    <AppWorkspaceShell
      active="setup"
      eyebrow="Administration"
      title="Club setup"
      subtitle="Set the operating defaults once so every fixture, campaign and recommendation starts with the right context."
      actions={<WorkspaceViewSwitcher value="overview" />}
    >
      <WorkspaceCard className={styles.introCard}>
        <WorkspaceSectionHeader eyebrow="Operating model" title="One setup layer for every AVELA decision surface" />
        <p>Fixtures, channels, objectives, brand rules and approval ownership should be configured here once and reused everywhere else. Pilot readiness sits above configuration so missing prerequisites are visible before a club tries to execute.</p>
      </WorkspaceCard>

      <div className={styles.readinessSurface}>
        <ClubPilotReadiness />
      </div>

      <div className={styles.setupSurface}>
        <ClubSetup />
      </div>
    </AppWorkspaceShell>
  );
}
