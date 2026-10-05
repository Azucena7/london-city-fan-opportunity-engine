import type { Metadata } from "next";
import { IntelligenceSources } from "@/components/IntelligenceSources";
import { AppWorkspaceShell, WorkspaceFilterButton } from "@/components/AppWorkspaceShell";
import styles from "./sources.module.css";

export const metadata: Metadata = {
  title: "Intelligence sources · AVELA",
  description: "See which data sources are connected, available as public demo evidence, or still require club access."
};

// productAppShell is provided by AppWorkspaceShell.
export default function SourcesPage() {
  return (
    <AppWorkspaceShell
      active="sources"
      eyebrow="Integrations"
      title="Sources"
      subtitle="Connected, public-demo and permissioned evidence feeding AVELA decisions."
      actions={<WorkspaceFilterButton label="Source filters" />}
    >
      <div className={styles.surface}>
        <IntelligenceSources />
      </div>
    </AppWorkspaceShell>
  );
}
