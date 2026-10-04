import type { Metadata } from "next";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { PlayerAssetPlanner } from "@/components/PlayerAssetPlanner";
import { PlayerContractHealth } from "@/components/PlayerContractHealth";
import styles from "./players.module.css";

export const metadata: Metadata = {
  title: "Player Assets · AVELA",
  description: "Plan commercial player usage across contracts, availability, international duty, cost and season opportunity cost."
};

export default function PlayerAssetsPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="players" />
      <PlayerContractHealth />
      <section className={styles.planningBoundary}>
        <span>Planning layer</span>
        <strong>Scenario optimiser · not legal contract truth</strong>
        <p>The planner below can model availability, momentum, cost and opportunity cost. Until verified club agreements are connected, its agreement/quota data remains demo planning context.</p>
      </section>
      <PlayerAssetPlanner />
    </main>
  );
}
