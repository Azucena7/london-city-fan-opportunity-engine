import type { Metadata } from "next";
import { IntelligenceSources } from "@/components/IntelligenceSources";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import styles from "./sources.module.css";

export const metadata: Metadata = {
  title: "Intelligence sources",
  description: "See which data sources are connected, available as public demo evidence, or still require club access."
};

// productAppShell is provided by AppWorkspaceShell.
export default function SourcesPage() {
  return (
    <AppWorkspaceShell
      active="sources"
      eyebrow="Decision evidence"
      title="Which source would improve the next decision?"
      subtitle="See what is connected, what AVELA can already use publicly and which missing inputs still limit confidence."
    >
      <div className={styles.surface}>
        <IntelligenceSources />
      </div>
    </AppWorkspaceShell>
  );
}
