import type { Metadata } from "next";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { PlayerAssetPlanner } from "@/components/PlayerAssetPlanner";
import styles from "./players.module.css";

export const metadata: Metadata = {
  title: "Player Assets · AVELA",
  description: "Plan commercial player usage across contracts, availability, international duty, cost and season opportunity cost."
};

export default function PlayerAssetsPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="players" />
      <PlayerAssetPlanner />
    </main>
  );
}
