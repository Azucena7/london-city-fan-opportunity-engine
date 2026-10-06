import type { Metadata } from "next";
import Link from "next/link";
import { ExecutiveShareActions } from "@/components/ExecutiveShareActions";
import { calendar, campaignPlans, currentState } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./executive.module.css";

export const metadata: Metadata = {
  title: "Executive view · AVELA",
  description: "A presentation-ready executive view of the current fixture opportunity, evidence, campaign and learning state."
};

export default async function ExecutiveViewPage({ searchParams }: { searchParams: Promise<{ fixture?: string }> }) {
  const params = await searchParams;
  const clubContext = await getCurrentClubOperatingContext();
  const today = currentState.updated_at.slice(0,10);
  const upcoming = calendar
    .filter((item) => item.homeAway === "home" && item.date >= today && item.status !== "final")
    .sort((a,b) => a.date.localeCompare(b.date));
  const radar = buildOpportunityRadar(upcoming.map((item) => item.id), clubContext);
  const selectedId = params.fixture && calendar.some((item) => item.id === params.fixture)
    ? params.fixture
    : radar[0]?.fixtureId ?? currentState.next_home_fixture_id;
  const fixture = calendar.find((item) => item.id === selectedId);
  const live = getCurrentProductOpportunity(selectedId);
  const radarItem = buildOpportunityRadar([selectedId], clubContext)[0] ?? null;
  const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === selectedId) ?? null;
  const results = getCurrentProductResults(selectedId);
  const approvals = campaign?.approvals.filter((item) => item.state !== "ready") ?? [];
  const measured = results?.state === "measured";

  if (!fixture || !live) return null;

  const executiveState = live.decisionState === "HOLD"
    ? "BLOCKED"
    : live.decisionState === "READY FOR REVIEW"
      ? "REVIEW"
      : "ACT";

  const decisionPosition = live.decisionState === "HOLD" ? 18 : live.decisionState === "READY FOR REVIEW" ? 58 : 84;
  const signalHighlights = live.liveSignals.slice(0, 4);
  const flow = [
    { label: "Signals", state: radarItem?.materialSignalCount ? "ready" : "muted" },
    { label: "Opportunity", state: radarItem?.opportunityScore ? "ready" : "muted" },
    { label: "Campaign", state: campaign ? "ready" : "muted" },
    { label: "Approval", state: approvals.length ? "review" : "ready" },
    { label: "Activation", state: campaign && approvals.length === 0 ? "ready" : "muted" },
    { label: "Measurement", state: measured ? "ready" : "muted" }
  ];

  return (
    <AppWorkspaceShell
      active="executive"
      eyebrow={"Executive decision · " + fixture.opponent}
      title="What does leadership need to decide?"
      subtitle="One decision brief: opportunity, evidence, blockers, activation and measurement."
      actions={<ExecutiveShareActions />}
    >

      <div className={styles.contextBar}>
        <Link href={"/app/matches/" + selectedId}>← Back to workspace</Link>
        <span>{fixture.opponent} · {fixture.date} · {fixture.kickoff ?? "TBC"}</span>
        <DecisionStateBadge state={executiveState} label={live.decisionState} />
      </div>

      <WorkspaceCard className={styles.cockpit} tone="action">
        <div className={styles.cockpitMain}>
          <span>Executive decision brief</span>
          <h1>{campaign?.title.en ?? live.opportunity}</h1>
          <p>{live.whyNow}</p>
          <div className={styles.signalHighlights}>
            {signalHighlights.map((signal) => <span key={signal.id}>{signal.title}</span>)}
          </div>
        </div>
        <div className={styles.decisionDial} aria-label={"Decision posture: " + live.decisionState}>
          <span>Decision posture</span>
          <div className={styles.dialTrack} aria-hidden="true">
            <i style={{ left: decisionPosition + "%" }} />
          </div>
          <div className={styles.dialLabels}><b>HOLD</b><b>REVIEW</b><b>ACT</b></div>
          <strong>{live.decisionState}</strong>
          <small>{live.confidence.label} confidence · {radarItem?.urgency ?? "Watch"} urgency</small>
        </div>
      </WorkspaceCard>

      <section className={styles.executiveMetrics} aria-label="Executive summary metrics">
        <article><span>Opportunity</span><strong>{radarItem?.opportunityScore ?? "—"}</strong><small>{radarItem?.opportunityLabel ?? "Under review"}</small></article>
        <article><span>Evidence</span><strong>{radarItem?.materialSignalCount ?? 0}</strong><small>material signals</small></article>
        <article data-tone={approvals.length ? "review" : "ready"}><span>Open gates</span><strong>{approvals.length}</strong><small>{approvals.length ? "human decision required" : "no blocking gate"}</small></article>
        <article data-tone={measured ? "ready" : "muted"}><span>Measurement</span><strong>{measured ? "Observed" : "Pending"}</strong><small>{measured ? "club evidence connected" : "outcome not yet established"}</small></article>
      </section>

      <WorkspaceCard className={styles.flowCard}>
        <WorkspaceSectionHeader eyebrow="Decision path" title="From signal to measurable action" />
        <div className={styles.decisionFlow} role="list" aria-label="Decision path">
          {flow.map((step, index) => (
            <div key={step.label} data-state={step.state} role="listitem" aria-label={step.label + ": " + step.state}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
            </div>
          ))}
        </div>
      </WorkspaceCard>

      <section className={styles.storyGrid}>
        <WorkspaceCard className={styles.decisionCard} tone="action">
          <WorkspaceSectionHeader eyebrow="01 · Decision" title="What should we do?" />
          <strong>{live.recommendedAction}</strong>
          <p>{live.nextAction.label} · Owner: {live.nextAction.owner} · {live.nextAction.deadline}</p>
          <Link href={"/app/matches/" + selectedId}>Open decision workspace →</Link>
        </WorkspaceCard>

        <WorkspaceCard>
          <WorkspaceSectionHeader eyebrow="02 · Why now" title="What changed?" />
          <strong>{live.opportunity}</strong>
          <ul>{live.liveSignals.slice(0,4).map((signal) => <li key={signal.id}>{signal.title}</li>)}</ul>
        </WorkspaceCard>

        <WorkspaceCard>
          <WorkspaceSectionHeader eyebrow="03 · Campaign" title="What would activation look like?" />
          <strong>{campaign?.proposition.en ?? live.recommendedAction}</strong>
          <div className={styles.chips}>{(campaign?.activations ?? []).slice(0,5).map((activation) => <b key={activation.id}>{activation.channel}</b>)}</div>
          <p>{campaign?.nextApproval.en ?? live.primaryBlocker}</p>
        </WorkspaceCard>

        <WorkspaceCard>
          <WorkspaceSectionHeader eyebrow="04 · Commercial read" title="What do we know about impact?" />
          <strong>{live.audience.value !== null ? live.audience.value.toLocaleString("en-GB") + " measured fans" : "Audience sizing requires club data"}</strong>
          <p>{measured ? "Observed club evidence is available. Attribution still does not equal incrementality." : "Impact remains a scenario until authorised outcome data is connected."}</p>
        </WorkspaceCard>
      </section>

      <WorkspaceDrawer label="Evidence confidence" title="What supports the recommendation — and what could change it">
        <div className={styles.evidenceColumns}>
          <article><span>Known</span><ul>{live.known.slice(0,4).map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>Missing / assumed</span><ul>{[...live.assumptions.slice(0,2), ...live.missing.slice(0,2)].map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>Change course if</span><ul>{live.whatWouldChangeDecision.slice(0,4).map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </WorkspaceDrawer>

      <WorkspaceCard className={styles.boardFooter}>
        <div>
          <span>Board takeaway</span>
          <strong>{live.decisionState === "HOLD" ? "The opportunity is visible, but the evidence or approvals do not support launch yet." : "The opportunity is ready for human review; execution remains controlled by the club."}</strong>
        </div>
        <div>
          <Link href={"/app/matches/" + selectedId + "#campaign"}>Open campaign detail →</Link>
          <Link href={"/app/learning?fixture=" + selectedId}>Open learning →</Link>
        </div>
      </WorkspaceCard>
    </AppWorkspaceShell>
  );
}
