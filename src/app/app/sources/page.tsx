import type { Metadata } from "next";
import { IntelligenceSources } from "@/components/IntelligenceSources";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { parseSourceFilter } from "@/lib/sourceRegister";
import { JourneyAggregateUpload } from "@/components/JourneyAggregateUpload";
import { calendar } from "@/lib/data";
import styles from "./sources.module.css";

export const metadata: Metadata = {
  title: "Intelligence sources",
  description: "See which data sources are connected, available as public demo evidence, or still require club access."
};

// productAppShell is provided by AppWorkspaceShell.
export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ state?: string | string[] }> }) {
  const filter = parseSourceFilter((await searchParams).state);
  // Kickoffs let the export's scans be grouped by arrival time; nothing else from the calendar is used.
  const kickoffs = Object.fromEntries(calendar.filter((fixture) => fixture.kickoff).map((fixture) => [fixture.id, { date: fixture.date, kickoff: fixture.kickoff as string }]));
  return (
    <AppWorkspaceShell
      active="sources"
      eyebrow="Decision evidence"
      title="Which source would improve the next decision?"
      subtitle="See what is connected, what AVELA can already use publicly and which missing inputs still limit confidence."
    >
      <div className={styles.surface}>
        <JourneyAggregateUpload kickoffs={kickoffs} />
        <IntelligenceSources filter={filter} />
      </div>
    </AppWorkspaceShell>
  );
}
