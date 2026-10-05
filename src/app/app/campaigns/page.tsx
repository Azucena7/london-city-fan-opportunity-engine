import type { Metadata } from "next";
import Link from "next/link";
import { campaignPlans } from "@/lib/data";
import { demoCommercialCampaigns } from "@/lib/clubStrategy";
import { AppWorkspaceShell, WorkspaceFilterButton, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import { CommercialCampaignBoard } from "@/components/CommercialCampaignBoard";
import { DecisionContextTrail } from "@/components/DecisionContextTrail";
import styles from "./campaigns.module.css";

export const metadata: Metadata = {
  title: "Campaigns | AVELA",
  description: "Review fixture-led and seasonal campaign drafts, approval state and the next human decision."
};

export default function CampaignsPage() {
  const campaigns = campaignPlans.campaigns ?? [];
  const campaignRows = campaigns.map((campaign) => {
    const approvalCount = campaign.approvals?.filter((item) => item.state === "ready").length ?? 0;
    const approvalTotal = campaign.approvals?.length ?? 0;
    return { campaign, approvalCount, approvalTotal, needsDecision: approvalTotal > 0 && approvalCount < approvalTotal };
  });
  const needsDecision = campaignRows.filter((item) => item.needsDecision);
  const primary = needsDecision[0] ?? campaignRows[0] ?? null;
  const lifecycleStage = (item: (typeof campaignRows)[number]) => {
    if (item.needsDecision) return "Review";
    const incomplete = item.campaign.schedule?.some((entry) => entry.state !== "complete") ?? false;
    if (incomplete) return "Ready";
    return "Learning";
  };
  const lifecycleStages = ["Draft", "Review", "Ready", "Handoff", "Learning"] as const;

  return (
    <AppWorkspaceShell
      active="campaigns"
      eyebrow="AVELA · Campaigns"
      title="Campaigns"
      subtitle={needsDecision.length + " need a decision · " + (campaigns.length + demoCommercialCampaigns.length) + " total drafts"}
      actions={<><WorkspaceViewSwitcher value="board" /><WorkspaceFilterButton /></>}
    >
      <DecisionContextTrail current="Campaigns" />
      <p className={styles.contractCopy}>productAppShell · Campaigns can start from a fixture or a commercial calendar moment such as season tickets, Christmas, retail, community or sponsor activity.</p>

      <WorkspaceCard className={styles.lifecycleCard}>
        <WorkspaceSectionHeader eyebrow="Campaign lifecycle" title="Draft → Review → Ready → Handoff → Learning" />
        <div className={styles.lifecycle}>
          {lifecycleStages.map((stage, index) => (
            <div key={stage} data-stage={stage.toLowerCase()}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
              <small>{campaignRows.filter((item) => lifecycleStage(item) === stage).length} campaigns</small>
            </div>
          ))}
        </div>
      </WorkspaceCard>

      <section className={styles.campaignSummary} aria-label="Campaign status summary">
        <WorkspaceCard tone="action"><span>Needs decision</span><strong>{needsDecision.length}</strong><small>Approval or scope gate</small></WorkspaceCard>
        <WorkspaceCard><span>Fixture campaigns</span><strong>{campaigns.length}</strong><small>Driven by match opportunity</small></WorkspaceCard>
        <WorkspaceCard tone="accent"><span>Commercial calendar</span><strong>{demoCommercialCampaigns.length}</strong><small>Seasonal / non-fixture</small></WorkspaceCard>
        <WorkspaceCard><span>Player asset route</span><strong>{demoCommercialCampaigns.filter((item) => item.playerNeed > 0).length}</strong><small>Campaigns needing talent</small></WorkspaceCard>
      </section>

      {primary ? (
        <WorkspaceCard className={styles.primaryDecision} tone="action">
          <WorkspaceSectionHeader
            eyebrow={primary.needsDecision ? "Decision required" : "Next campaign"}
            title={primary.campaign.title.en}
            action={<DecisionStateBadge state={primary.needsDecision ? "REVIEW" : "READY"} label={primary.campaign.status} />}
          />
          <div className={styles.primaryGrid}>
            <div className={styles.primaryBrief}>
              <p>{primary.campaign.objective.en}</p>
              <div><span>Next decision</span><strong>{primary.campaign.nextApproval?.en ?? "Review required"}</strong></div>
            </div>
            <div className={styles.primaryFacts}>
              <div><span>Approvals ready</span><strong>{primary.approvalCount}/{primary.approvalTotal}</strong></div>
              <div><span>Activations</span><strong>{primary.campaign.activations?.length ?? 0}</strong></div>
              <div><span>Fixture</span><strong>{primary.campaign.fixtureId}</strong></div>
            </div>
            <div className={styles.primaryActions}>
              <Link href={"/app/matches/" + primary.campaign.fixtureId}>Open decision workspace →</Link>
              <Link href={"/app/players?campaign=" + primary.campaign.id}>Optimise player pack →</Link>
            </div>
          </div>
        </WorkspaceCard>
      ) : null}

      <section className={styles.workspaceGrid}>
        <WorkspaceCard className={styles.boardCard}>
          <WorkspaceSectionHeader
            eyebrow="Execution board"
            title="Fixture campaigns"
            action={<Link href="/app/season">Calendar view →</Link>}
          />
          <div className={styles.board}>
            <section>
              <header><span>Needs decision</span><b>{needsDecision.length}</b></header>
              <div>
                {campaignRows.filter((item) => item.needsDecision).map(({ campaign, approvalCount, approvalTotal }) => (
                  <article key={campaign.id} className={styles.campaignCard} data-needs-decision="true">
                    <div className={styles.meta}><DecisionStateBadge state="REVIEW" label={campaign.status} /><small>{campaign.fixtureId}</small></div>
                    <h3>{campaign.title.en}</h3>
                    <p>{campaign.objective.en}</p>
                    <div className={styles.progressBar} aria-label={approvalCount + " of " + approvalTotal + " approvals ready"}><span style={{ width: (approvalTotal ? Math.round((approvalCount / approvalTotal) * 100) : 0) + "%" }} /></div>
                    <div className={styles.cardFacts}>
                      <span>Approvals <b>{approvalCount}/{approvalTotal}</b></span>
                      <span>Activations <b>{campaign.activations?.length ?? 0}</b></span>
                    </div>
                    <div className={styles.nextDecision}><span>Next decision</span><strong>{campaign.nextApproval?.en ?? "Review required"}</strong></div>
                    <Link href={"/app/matches/" + campaign.fixtureId}>Open →</Link>
                  </article>
                ))}
                {!needsDecision.length ? <p className={styles.empty}>No campaign is waiting for a human decision.</p> : null}
              </div>
            </section>

            <section>
              <header><span>Ready / moving</span><b>{campaignRows.filter((item) => !item.needsDecision).length}</b></header>
              <div>
                {campaignRows.filter((item) => !item.needsDecision).map(({ campaign, approvalCount, approvalTotal }) => (
                  <article key={campaign.id} className={styles.campaignCard}>
                    <div className={styles.meta}><DecisionStateBadge state="READY" label={campaign.status} /><small>{campaign.fixtureId}</small></div>
                    <h3>{campaign.title.en}</h3>
                    <p>{campaign.objective.en}</p>
                    <div className={styles.progressBar}><span style={{ width: (approvalTotal ? Math.round((approvalCount / approvalTotal) * 100) : 0) + "%" }} /></div>
                    <div className={styles.cardFacts}>
                      <span>Approvals <b>{approvalCount}/{approvalTotal}</b></span>
                      <span>Activations <b>{campaign.activations?.length ?? 0}</b></span>
                    </div>
                    <Link href={"/app/matches/" + campaign.fixtureId}>Open →</Link>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <header><span>Commercial calendar</span><b>{demoCommercialCampaigns.length}</b></header>
              <div>
                <CommercialCampaignBoard />
              </div>
            </section>
          </div>
        </WorkspaceCard>

        <aside className={styles.sideRail}>
          <WorkspaceCard className={styles.quickCard}>
            <WorkspaceSectionHeader eyebrow="Quick actions" title="Move work forward" />
            <Link href={primary ? "/app/players?campaign=" + primary.campaign.id : "/app/players"}><span>Player assets</span><strong>Optimise talent pack →</strong></Link>
            <Link href="/app/season"><span>Calendar pressure</span><strong>Check timing collisions →</strong></Link>
            <Link href="/app/learning"><span>Learning</span><strong>Review outcomes →</strong></Link>
          </WorkspaceCard>

          <WorkspaceDrawer label="Operating rule" title="AVELA drafts. The club approves.">
            <p>Recommendations can prepare scope, talent, timing and handoff. Approval and launch remain human-controlled.</p>
          </WorkspaceDrawer>

          <WorkspaceDrawer label="Campaign model" title="Fixture + commercial calendar">
            <p>Campaigns that do not need a fixture to exist remain first-class work: season tickets, Christmas, retail, community and sponsor activity.</p>
          </WorkspaceDrawer>
        </aside>
      </section>
    </AppWorkspaceShell>
  );
}
