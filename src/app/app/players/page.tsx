import type { Metadata } from "next";
import { PlayerAssetPlanner } from "@/components/PlayerAssetPlanner";
import { PlayerContractHealth } from "@/components/PlayerContractHealth";
import { AppWorkspaceShell, WorkspaceFilterButton, WorkspaceViewSwitcher } from "@/components/AppWorkspaceShell";
import { WorkspaceDrawer } from "@/components/WorkspaceUI";
import styles from "./players.module.css";

export const metadata: Metadata = {
  title: "Player Assets · AVELA",
  description: "Plan commercial player usage across contracts, availability, international duty, cost and season opportunity cost."
};

// productAppShell is provided by AppWorkspaceShell.
export default function PlayerAssetsPage() {
  return (
    <AppWorkspaceShell
      active="players"
      eyebrow="Player Asset Planning"
      title="Players"
      subtitle="Build the best activation pack from availability, fit, momentum, cost and season scarcity."
      actions={<><WorkspaceViewSwitcher value="overview" /><WorkspaceFilterButton /></>}
    >
      <section className={styles.planningBoundary}>
        <span>Planning layer</span>
        <strong>Scenario optimiser · not legal contract truth</strong>
        <p>AVELA recommends a pack from planning evidence. Verified contract truth remains separate and opens only when you need to validate the recommendation.</p>
      </section>

      <div className={styles.plannerSurface}>
        <PlayerAssetPlanner />
      </div>

      <div className={styles.contractDrawer}>
        <WorkspaceDrawer label="Decision evidence" title="Verified contract health">
          <PlayerContractHealth />
        </WorkspaceDrawer>
      </div>
    </AppWorkspaceShell>
  );
}
