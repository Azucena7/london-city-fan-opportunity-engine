import type { Metadata } from "next";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DemoTour } from "@/components/DemoTour";
import { campaignPlans } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "Guided demo · AVELA",
  description: "A three-minute guided walkthrough of the club workflow from fixture signal to campaign and launch readiness."
};

export default function ClubDemoPage() {
  const live = getCurrentProductOpportunity();
  const campaign = live ? campaignPlans.campaigns.find((item) => item.fixtureId === live.fixtureId) ?? null : null;

  return (
    <AppWorkspaceShell
      active="demo"
      eyebrow="Guided workflow"
      title="Product demo"
      subtitle="Follow one fixture from signal detection to review, campaign scope and handoff."
    >
      <div className={styles.shell}>
      <DemoTour
        fixtureId={live?.fixtureId ?? ""}
        fixtureLabel={live ? `London City v ${live.fixture.opponent}` : "Next home fixture"}
        timingLabel={live?.timingLabel ?? "Next fixture"}
        opportunity={live?.opportunity ?? "No active opportunity"}
        whyNow={live?.whyNow ?? "The engine is waiting for an actionable fixture signal."}
        confidence={live?.confidence.label ?? "Low"}
        signals={live?.liveSignals.length ?? 0}
        nextAction={live?.nextAction.label ?? "Review current evidence"}
        campaignTitle={campaign?.title.en ?? live?.opportunity ?? "Recommended campaign"}
        campaignObjective={campaign?.objective.en ?? live?.opportunity ?? "Review current opportunity"}
        campaignAudience={campaign?.audiences[0]?.label.en ?? live?.audience.label ?? "Requires club data"}
      />
      </div>
    </AppWorkspaceShell>
  );
}
