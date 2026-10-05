import type { Metadata } from "next";
import Link from "next/link";
import { AppWorkspaceShell, WorkspaceFilterButton, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { ContractReviewQueue } from "@/components/ContractReviewQueue";
import { ContractImpactGraph } from "@/components/ContractImpactGraph";
import { WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./contracts.module.css";

export const metadata: Metadata = {
  title: "Contracts · AVELA",
  description: "Review extracted sponsor and player clauses with provenance before verified contract intelligence can affect club decisions."
};

const sponsorFields = [
  "Rights and activation counts",
  "Player appearances",
  "Hospitality and branding",
  "Exclusivity and category restrictions",
  "Approval windows and deadlines",
  "KPIs, make-goods and renewal terms"
];

const playerFields = [
  "Commercial appearances",
  "Image and content rights",
  "Usage restrictions",
  "Fees and bonuses",
  "Club obligations",
  "Season-specific quotas"
];

export default function ContractsPage() {
  return (
    <AppWorkspaceShell
      active="contracts"
      eyebrow="Contract intelligence"
      title="Contracts"
      subtitle="Turn reviewed rights and obligations into decision constraints without treating extracted text as legal truth."
      actions={<><WorkspaceViewSwitcher value="list" /><WorkspaceFilterButton /></>}
    >
      <section className={styles.summary} aria-label="Contract verification lifecycle">
        <WorkspaceCard tone="action"><span>01 · Detected</span><strong>Document</strong><small>Approved repository or authorised upload.</small></WorkspaceCard>
        <WorkspaceCard><span>02 · Extracted</span><strong>Candidate evidence</strong><small>Dates, rights, restrictions and obligations.</small></WorkspaceCard>
        <WorkspaceCard><span>03 · Reviewed</span><strong>Governed</strong><small>Verify, reject or escalate with provenance.</small></WorkspaceCard>
        <WorkspaceCard tone="accent"><span>04 · Active</span><strong>Contract truth</strong><small>Only verified fields may affect decisions.</small></WorkspaceCard>
      </section>

      <WorkspaceCard className={styles.truthBoundary} tone="action">
        <WorkspaceSectionHeader eyebrow="Truth boundary" title="Extracted → Reviewed → Active" />
        <div className={styles.truthGrid}>
          <strong>Extraction is candidate evidence.</strong>
          <p>Only clauses explicitly verified by authorised governance users may become contract truth inside AVELA. Every material field retains document, version, section, source fragment, confidence, verification state and reviewer.</p>
        </div>
      </WorkspaceCard>

      <section className={styles.contractVisualGrid}>
        <WorkspaceCard className={styles.impactGraphCard}>
          <WorkspaceSectionHeader eyebrow="Impact map" title="See which decisions a clause can change" />
          <ContractImpactGraph />
        </WorkspaceCard>
        <WorkspaceCard className={styles.controlFlowCard}>
          <WorkspaceSectionHeader eyebrow="Governance flow" title="Clause → impact → review" />
          <div className={styles.controlFlow} role="list" aria-label="Contract governance flow">
            <div role="listitem"><span>01</span><strong>Document</strong><small>External source of record</small></div>
            <i aria-hidden="true">→</i>
            <div role="listitem"><span>02</span><strong>Verified clause</strong><small>Provenance retained</small></div>
            <i aria-hidden="true">→</i>
            <div role="listitem"><span>03</span><strong>Affected decisions</strong><small>Sponsor · player · campaign · fixture</small></div>
            <i aria-hidden="true">→</i>
            <div data-alert="true" role="listitem"><span>04</span><strong>Review required</strong><small>No silent propagation</small></div>
          </div>
        </WorkspaceCard>
      </section>

      <section className={styles.workspaceGrid}>
        <div className={styles.queueSurface}>
          <ContractReviewQueue />
        </div>

        <aside className={styles.sideRail}>

          <WorkspaceDrawer label="Sponsor contracts" title="What AVELA should understand">
            <ul className={styles.fieldList}>{sponsorFields.map((field) => <li key={field}>{field}</li>)}</ul>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Player contracts" title="What AVELA should understand">
            <ul className={styles.fieldList}>{playerFields.map((field) => <li key={field}>{field}</li>)}</ul>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Control rule" title="A verified clause changes only what it affects">
            <div className={styles.impactFlow}>
              <span>Document</span><i aria-hidden="true">→</i><span>Verified clause</span><i aria-hidden="true">→</i><span>Affected decision</span><i aria-hidden="true">→</i><strong>Review required</strong>
            </div>
            <p>A verified amendment should move affected sponsors, players, campaigns, fixtures or season instances back to review rather than silently changing them.</p>
          </WorkspaceDrawer>
        </aside>
      </section>

      <WorkspaceCard className={styles.sourceRecord}>
        <div>
          <span>Source of record stays external</span>
          <strong>Connect documents; do not rebuild legal document management.</strong>
          <p>AVELA detects, extracts, verifies and operationalises clauses while retaining the approved source document and version as provenance.</p>
        </div>
        <Link href="/app/sources">Review data sources →</Link>
      </WorkspaceCard>
    </AppWorkspaceShell>
  );
}
