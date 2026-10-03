import type { Metadata } from "next";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { IntelligenceSources } from "@/components/IntelligenceSources";
import styles from "./sources.module.css";

export const metadata: Metadata = {
  title: "Intelligence sources · AVELA",
  description: "See which data sources are connected, available as public demo evidence, or still require club access."
};

export default function SourcesPage() {
  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="sources" />
      <IntelligenceSources />
    </main>
  );
}
