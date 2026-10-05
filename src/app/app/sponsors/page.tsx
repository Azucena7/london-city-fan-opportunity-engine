import type { Metadata } from "next";
import { SponsorContractHealth } from "@/components/SponsorContractHealth";
import { AppWorkspaceShell, WorkspaceFilterButton, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { WorkspaceBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import { partnerCommercialPack, pilotReadiness } from "@/lib/data";
import styles from "./sponsors.module.css";

export const metadata: Metadata = {
  title: "Sponsors · AVELA",
  description: "Prioritise partner opportunities separately from verified sponsor rights, obligations and fulfilment evidence."
};

function evidenceSummary(pack: (typeof partnerCommercialPack.packs)[number]) {
  return {
    verified: pack.evidence.filter((item) => item.state === "public-verified").length,
    modelled: pack.evidence.filter((item) => item.state === "modelled-scenario").length,
    missing: pack.evidence.filter((item) => item.state === "requires-measurement" || item.state === "requires-partner").length
  };
}

// productAppShell is provided by AppWorkspaceShell.
export default function SponsorsPage() {
  const candidates = partnerCommercialPack.packs
    .map((pack) => {
      const readiness = pilotReadiness.candidates.find((item) => item.packId === pack.id) ?? null;
      return { pack, readiness, evidence: evidenceSummary(pack) };
    })
    .sort((a, b) => (a.readiness?.rank ?? 99) - (b.readiness?.rank ?? 99));

  const recommended = candidates.find((item) => item.readiness?.decision === "recommended-for-review") ?? candidates[0] ?? null;
  const waitingGates = partnerCommercialPack.approvalGates.filter((gate) => gate.state !== "ready");

  return (
    <AppWorkspaceShell
      active="sponsors"
      eyebrow="Sponsor Intelligence"
      title="Sponsors"
      subtitle="Pipeline opportunities, evidence quality and verified obligations in one workspace."
      actions={<><WorkspaceViewSwitcher value="list" /><WorkspaceFilterButton /></>}
    >
      <section className={styles.summary} aria-label="Sponsor opportunity summary">
        <WorkspaceCard><span>Prospecting</span><strong>{candidates.length}</strong><small>Current partner concepts</small></WorkspaceCard>
        <WorkspaceCard tone="accent"><span>Recommended</span><strong>{recommended?.pack.candidate ?? "—"}</strong><small>{recommended?.readiness?.weightedScore ?? "—"} readiness</small></WorkspaceCard>
        <WorkspaceCard tone="action"><span>Gates waiting</span><strong>{waitingGates.length}</strong><small>Before commitment</small></WorkspaceCard>
        <WorkspaceCard><span>Measurement</span><strong>{partnerCommercialPack.measurementState.replaceAll("-", " ")}</strong><small>Missing is not zero</small></WorkspaceCard>
      </section>

      {recommended ? (
        <WorkspaceCard className={styles.primary} tone="action">
          <WorkspaceSectionHeader
            eyebrow="Recommended for review"
            title={recommended.pack.candidate}
            action={<WorkspaceBadge tone="coral">{recommended.readiness?.decision.replaceAll("-", " ") ?? "review"}</WorkspaceBadge>}
          />
          <div className={styles.primaryGrid}>
            <div className={styles.primaryCopy}>
              <strong>{recommended.pack.title.en}</strong>
              <p>{recommended.readiness?.rationale.en ?? recommended.pack.whyFit.en}</p>
              <span>Commercial ask</span>
              <b>{recommended.pack.commercialAsk.en}</b>
            </div>
            <div className={styles.primaryFacts}>
              <div><span>Readiness</span><strong>{recommended.readiness?.weightedScore ?? "—"}</strong></div>
              <div><span>Fixtures</span><strong>{recommended.pack.recommendedFixtureIds.length}</strong></div>
              <div><span>Verified evidence</span><strong>{recommended.evidence.verified}</strong></div>
              <div><span>Unresolved</span><strong>{recommended.evidence.missing}</strong></div>
            </div>
          </div>
        </WorkspaceCard>
      ) : null}

      <section className={styles.workspaceGrid}>
        <WorkspaceCard className={styles.pipeline}>
          <WorkspaceSectionHeader eyebrow="Prospecting queue" title="Compare before outreach" />
          <div className={styles.table} role="table" aria-label="Sponsor prospecting queue">
            <div className={styles.tableHead} role="row">
              <span>Partner</span><span>Opportunity</span><span>Readiness</span><span>Evidence</span><span>Fixtures</span><span>Status</span>
            </div>
            {candidates.map(({ pack, readiness, evidence }) => (
              <details className={styles.row} key={pack.id}>
                <summary>
                  <span className={styles.partnerCell}><b>#{readiness?.rank ?? "—"}</b><strong>{pack.candidate}</strong><small>{pack.category.replaceAll("-", " ")}</small></span>
                  <span className={styles.opportunityCell}><strong>{pack.title.en}</strong><small>{pack.proposition.en}</small></span>
                  <span><strong>{readiness?.weightedScore ?? "—"}</strong><small>weighted</small></span>
                  <span><strong>{evidence.verified}/{evidence.verified + evidence.modelled + evidence.missing}</strong><small>verified</small></span>
                  <span><strong>{pack.recommendedFixtureIds.length}</strong><small>recommended</small></span>
                  <WorkspaceBadge tone={readiness?.decision === "recommended-for-review" ? "coral" : "neutral"}>{readiness?.decision.replaceAll("-", " ") ?? "review"}</WorkspaceBadge>
                </summary>
                <div className={styles.rowDetail}>
                  <div><span>Why this could fit</span><p>{pack.whyFit.en}</p></div>
                  <div><span>Activation assets</span><ul>{pack.activationAssets.slice(0, 3).map((asset) => <li key={asset.en}>{asset.en}</li>)}</ul></div>
                  <div className={styles.evidenceList}>
                    <span>Evidence & unknowns</span>
                    {pack.evidence.map((item) => (
                      <article key={item.id}>
                        <WorkspaceBadge tone={item.state === "public-verified" ? "success" : item.state === "modelled-scenario" ? "warning" : "neutral"}>{item.state.replaceAll("-", " ")}</WorkspaceBadge>
                        <strong>{item.label.en}</strong>
                        <p>{item.detail.en}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </WorkspaceCard>

        <aside className={styles.sideRail}>
          <WorkspaceCard className={styles.truthBoundary}>
            <WorkspaceSectionHeader eyebrow="Truth boundary" title="Prospecting ≠ contract truth" />
            <p>Partner ideas can be ranked before outreach. Rights and obligations only become contract truth after governed verification.</p>
          </WorkspaceCard>

          <WorkspaceDrawer label="Contract truth" title="Verified rights & obligations">
            <SponsorContractHealth />
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Approval gates" title={waitingGates.length + " still waiting"}>
            <div className={styles.gateList}>
              {partnerCommercialPack.approvalGates.map((gate) => (
                <article key={gate.id} data-state={gate.state}>
                  <WorkspaceBadge tone={gate.state === "ready" ? "success" : "warning"}>{gate.state}</WorkspaceBadge>
                  <strong>{gate.label.en}</strong>
                  <small>{gate.owner.en}</small>
                </article>
              ))}
            </div>
          </WorkspaceDrawer>
        </aside>
      </section>
    </AppWorkspaceShell>
  );
}
