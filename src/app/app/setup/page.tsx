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
      <WorkspaceCard className={styles.readinessPath}>
        <WorkspaceSectionHeader eyebrow="Setup journey" title="Get the club ready in the order AVELA needs it" />
        <div className={styles.setupSteps} aria-label="Club setup journey">
          {[
            ["01","Identity","Who is operating AVELA"],
            ["02","Club setup","Shared defaults"],
            ["03","Fixtures","What starts monitoring"],
            ["04","Channels","What can be activated"],
            ["05","Approval","Who can confirm"],
            ["06","Measurement","What can be learned"]
          ].map(([number,title,detail]) => (
            <div key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </div>
          ))}
        </div>
        <p className={styles.pathNote}>The live readiness state below remains the source of truth. Measurement can stay limited while planning is ready.</p>
      </WorkspaceCard>

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
