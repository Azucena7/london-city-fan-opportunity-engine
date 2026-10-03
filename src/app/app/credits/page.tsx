import type { Metadata } from "next";
import { CreditCenter } from "@/components/CreditCenter";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import styles from "./credits.module.css";

export const metadata: Metadata = {
  title: "Credits · AVELA",
  description: "Club credit commitments, consumption and release history."
};

export default function CreditsPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="credits" />
      <CreditCenter />
    </main>
  );
}
