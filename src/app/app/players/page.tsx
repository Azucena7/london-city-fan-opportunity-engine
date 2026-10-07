import type { Metadata } from "next";
import Link from "next/link";
import { PlayerAssetPlanner } from "@/components/PlayerAssetPlanner";
import { PlayerContractHealth } from "@/components/PlayerContractHealth";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { WorkspaceDrawer } from "@/components/WorkspaceUI";
import { DecisionContextTrail } from "@/components/DecisionContextTrail";
import { DecisionHandoffStrip } from "@/components/DecisionHandoffStrip";
import { campaignPlans } from "@/lib/data";
import styles from "./players.module.css";

export const metadata: Metadata = {
  title: "Player Assets",
  description: "Plan commercial player usage across contracts, availability, international duty, cost and season opportunity cost."
};

// productAppShell is provided by AppWorkspaceShell.
export default async function PlayerAssetsPage({ searchParams }: { searchParams: Promise<{ campaign?: string }> }) {
  const params = await searchParams;
  const initialCampaignId = params.campaign;
  const campaign = campaignPlans.campaigns.find((item) => item.id === initialCampaignId) ?? null;
  return (
    <AppWorkspaceShell
      active="players"
      eyebrow="Player pack optimiser"
      title={campaign ? "Who should we use for this campaign?" : "Build the best player pack"}
      subtitle="Balance fit, availability, momentum, cost, contract usage and season opportunity cost before committing talent."
    >
      <DecisionContextTrail
        fixtureLabel={campaign ? campaign.fixtureId : null}
        fixtureHref={campaign ? "/app/matches/" + campaign.fixtureId : null}
        campaignLabel={campaign?.title.en ?? null}
        campaignId={campaign?.id ?? null}
        current="Players"
      />
      <DecisionHandoffStrip active="players" fixtureId={campaign?.fixtureId ?? null} campaignId={campaign?.id ?? null} />

      <section className={styles.planningBoundary}>
        <span>Decision guardrail</span>
        <strong>Optimise first. Verify contract truth before commitment.</strong>
        <p>AVELA ranks viable player combinations from planning evidence; verified clauses stay separate until the recommendation needs to be committed.</p>
      </section>

      <section className={styles.workflowContext} aria-label="Player planning workflow context">
        <div>
          <span>Workflow context</span>
          <strong>{initialCampaignId ? "Opened from a campaign" : "Standalone player planning"}</strong>
          <small>{initialCampaignId ? "The selected campaign is preserved in the player planner." : "Choose a campaign below or return to Campaigns to start from a specific brief."}</small>
        </div>
        <Link href="/app/campaigns">← Back to Campaigns</Link>
      </section>

      <div className={styles.plannerSurface}>
        <PlayerAssetPlanner initialCampaignId={initialCampaignId} />
      </div>

      <div className={styles.contractDrawer}>
        <WorkspaceDrawer label="Decision evidence" title="Verified contract health">
          <Link className={styles.contractJump} href="/app/contracts">Review contract truth →</Link>
          <PlayerContractHealth />
        </WorkspaceDrawer>
      </div>
    </AppWorkspaceShell>
  );
}
