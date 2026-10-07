import type { Metadata } from "next";
import Link from "next/link";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { ClubSetup } from "@/components/ClubSetup";
import { ClubPilotReadiness } from "@/components/ClubPilotReadiness";
import { WorkspaceCard, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./setup.module.css";

export const metadata: Metadata = {
  title: "Club setup",
  description: "Configure fixtures, channels, objectives, brand rules and approvals once for the club."
};

export default function ClubSetupPage() {
  return (
    <AppWorkspaceShell
      active="setup"
      eyebrow="Club operating context"
      title="What must AVELA know once — so every decision starts smarter?"
      subtitle="Set fixtures, channels, objectives, brand rules and approval ownership once, then reuse them across every decision surface."
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


      <div id="connections" className={styles.connectionAnchor}>
      <WorkspaceCard className={styles.connectionSetup}>
        <WorkspaceSectionHeader
          eyebrow="Source connections"
          title="Connect once. Improve every downstream decision."
          action={<Link href="/app/sources">Review source recommendations →</Link>}
        />
        <p className={styles.connectionLead}>Sources recommends what to add next; Setup is where the club completes the connection. AVELA should only mark a source operational after permissions, credentials and a successful refresh are confirmed.</p>
        <div className={styles.connectionSteps} aria-label="Source connection setup flow">
          <div><span>01</span><strong>Choose source</strong><small>Start from AVELA’s recommended priority or a club-selected system.</small></div>
          <div><span>02</span><strong>Grant access</strong><small>API, MCP, warehouse, secure export or provider credentials.</small></div>
          <div><span>03</span><strong>Map evidence</strong><small>Define what fields may influence which decision surfaces.</small></div>
          <div><span>04</span><strong>Verify refresh</strong><small>Confirm source, timestamp, permissions and first successful sync.</small></div>
          <div><span>05</span><strong>Go operational</strong><small>Only then can the source improve confidence, recommendations or learning.</small></div>
        </div>
        <div className={styles.connectionBoundary}>
          <strong>Connection rule</strong>
          <p>A configured credential is not the same as a healthy source. AVELA keeps setup state, health, freshness and permission state separate so the club always knows what evidence is actually usable.</p>
        </div>
      </WorkspaceCard>
      </div>

      <div className={styles.readinessSurface}>
        <ClubPilotReadiness />
      </div>

      <div className={styles.setupSurface}>
        <ClubSetup />
      </div>
    </AppWorkspaceShell>
  );
}
