import type { Metadata } from "next";
import Link from "next/link";
import { ExecutiveShareActions } from "@/components/ExecutiveShareActions";
import { bankHolidays, calendar, campaignPlans, currentState, internationalWindows } from "@/lib/data";
import { calendarMoments } from "@/lib/calendarMoments";
import { getCurrentPreparedMoves, getPreparationWindowIds } from "@/lib/currentPreparedMoves";
import { DataTable } from "@/components/DataTable";
import { PilotWindowTracker } from "@/components/PilotWindowTracker";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { getMaterialMatchdayAlert } from "@/lib/matchdayDecisionAlert";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { DecisionStateBadge, WorkspaceCard, WorkspaceDrawer, WorkspaceSectionHeader } from "@/components/WorkspaceUI";
import styles from "./executive.module.css";
import { decisionBadge, getDecisionQueue } from "@/lib/decisionQueue";
import { ExecutiveDomains, type DomainTile } from "@/components/ExecutiveDomains";
import { demoCommercialCampaigns } from "@/lib/clubStrategy";
import { registerRows } from "@/lib/sourceRegister";
import sourceHealth from "../../../../data/live/source-health.json";

export const metadata: Metadata = {
  title: "Executive view",
  description: "A presentation-ready executive view of the current fixture opportunity, evidence, campaign and learning state."
};

export default async function ExecutiveViewPage({ searchParams }: { searchParams: Promise<{ fixture?: string }> }) {
  const params = await searchParams;
  // The shared decision queue: the same fixtures and attention order as Home and Radar.
  const { radar, today, calendarRelationships } = await getDecisionQueue();
  const selectedId = params.fixture && calendar.some((item) => item.id === params.fixture)
    ? params.fixture
    : radar[0]?.fixtureId ?? currentState.next_home_fixture_id;
  const fixture = calendar.find((item) => item.id === selectedId);
  const live = getCurrentProductOpportunity(selectedId);
  const radarItem = radar.find((item) => item.fixtureId === selectedId) ?? null;
  const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === selectedId) ?? null;
  const results = getCurrentProductResults(selectedId);
  const approvals = campaign?.approvals.filter((item) => item.state !== "ready") ?? [];
  const measured = results?.state === "measured";
  const matchdayAlert = fixture ? getMaterialMatchdayAlert(selectedId, fixture.date) : null;

  if (!fixture || !live) return null;

  const executiveState = decisionBadge(live.decisionState);

  const decisionPosition = live.decisionState === "HOLD" ? 18 : live.decisionState === "READY FOR REVIEW" ? 58 : 84;
  const signalHighlights = live.liveSignals.slice(0, 4);
  const attentionNow = radar.filter((item) => item.attentionState === "Act now" || item.attentionState === "Review").length;
  const topThree = radar.slice(0, 3);
  const queueFixtureIds = new Set(radar.map((item) => item.fixtureId));
  const queueOpenGates = campaignPlans.campaigns
    .filter((item) => queueFixtureIds.has(item.fixtureId))
    .reduce((total, item) => total + item.approvals.filter((approval) => approval.state !== "ready").length, 0);
  const queueMeasured = radar.filter((item) => getCurrentProductResults(item.fixtureId)?.state === "measured").length;
  const currentChanges = [
    ...(matchdayAlert ? [matchdayAlert.title] : []),
    ...signalHighlights.slice(0, 2).map((signal) => signal.title),
    approvals.length ? approvals.length + " approval gate" + (approvals.length === 1 ? "" : "s") + " still open" : "No approval gate currently blocks the selected decision",
    measured ? "Outcome evidence is now available" : "Outcome evidence is still pending"
  ].slice(0, 4);
  // The portfolio: every upcoming home decision in attention order, so leadership sees what
  // is blocked, what waits on a gate and which calendar moments sit around each fixture.
  const moments = calendarMoments(calendar, bankHolidays.events, internationalWindows.windows);
  const preparedMoves = getCurrentPreparedMoves();
  const preparationIds = getPreparationWindowIds();
  const portfolio = radar.map((item) => {
    const decision = getCurrentProductOpportunity(item.fixtureId);
    const plan = campaignPlans.campaigns.find((entry) => entry.fixtureId === item.fixtureId) ?? null;
    const draft = plan ? null : preparedMoves.find((entry) => entry.fixtureId === item.fixtureId) ?? null;
    const gates = plan
      ? plan.approvals.filter((approval) => approval.state !== "ready").length
      : draft?.gates.length ?? 0;
    return {
      ...item,
      decisionState: decision?.decisionState ?? null,
      move: plan ? { text: plan.title.en, kind: "Campaign draft" } : draft ? { text: draft.move, kind: draft.moveRecordedAt ? "Engine draft · from signal of " + new Date(draft.moveRecordedAt + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) + (draft.timingNote ? " · timing out of date" : "") : "Engine draft" } : null,
      inWindow: preparationIds.has(item.fixtureId),
      waitingOn: draft
        ? draft.timingNote ? "Re-time the engine draft and assign a club owner" : "Assign a club owner and review the engine draft"
        : decision?.decisionState === "HOLD" ? decision.primaryBlocker : null,
      gates,
      moments: moments.filter((moment) => moment.fixtureId === item.fixtureId).map((moment) => moment.label)
    };
  });

  // Across the club: one tile per workspace, from data each workspace already shows.
  const campaignsWaiting = campaignPlans.campaigns.filter((item) => item.approvals.some((approval) => approval.state !== "ready")).length;
  const sources = registerRows(sourceHealth);
  const sourcesBlocking = sources.filter((row) => row.state !== "operational" && row.state !== "degraded" && row.blocks.length > 0);
  const horizon = new Date(today + "T00:00:00Z");
  horizon.setUTCDate(horizon.getUTCDate() + 30);
  const pressure = calendarRelationships.filter((item) => item.date >= today && item.date <= horizon.toISOString().slice(0, 10));
  const played = calendar.filter((item) => item.homeAway === "home" && (item.status === "final" || item.date < today));
  const playedMeasured = played.filter((item) => getCurrentProductResults(item.id)?.state === "measured").length;
  const domainTiles: DomainTile[] = [
    {
      key: "campaigns",
      label: "Campaigns",
      state: campaignsWaiting ? "attention" : "clear",
      stateLabel: campaignsWaiting ? "Waiting on approval" : "No approval waiting",
      metric: campaignsWaiting + " of " + campaignPlans.campaigns.length,
      detail: "Fixture campaigns with an open gate · " + demoCommercialCampaigns.length + " commercial-calendar drafts",
      href: "/app/campaigns",
      linkLabel: "Open campaigns"
    },
    {
      key: "sources",
      label: "Sources",
      state: sourcesBlocking.length ? "attention" : "clear",
      stateLabel: sourcesBlocking.length ? "Blocking decisions" : "Nothing blocked",
      metric: sources.filter((row) => row.state === "operational").length + " of " + sources.length + " healthy",
      detail: sourcesBlocking.length ? sourcesBlocking.length + " missing source" + (sourcesBlocking.length === 1 ? " blocks" : "s block") + " a decision until connected" : "Every required source is available",
      href: "/app/sources?state=attention",
      linkLabel: "Check sources"
    },
    {
      key: "calendar",
      label: "Calendar pressure",
      state: pressure.length ? "attention" : "clear",
      stateLabel: pressure.length ? "Moments to plan around" : "No pressure in 30 days",
      metric: String(pressure.length),
      detail: "Calendar relationships in the next 30 days (international windows, holidays, clashes)",
      href: "/app/season",
      linkLabel: "Open calendar"
    },
    {
      key: "learning",
      label: "Learning",
      state: played.length === 0 ? "unknown" : playedMeasured === played.length ? "clear" : "unknown",
      stateLabel: playedMeasured ? "Outcomes measured" : "Not measured",
      metric: playedMeasured + " of " + played.length,
      detail: playedMeasured === played.length ? "Played home fixtures with measured outcomes" : "Played home fixtures with measured outcomes · the rest need the club's ticketing data",
      href: "/app/learning",
      linkLabel: "Open learning"
    }
  ];

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

      <section className={styles.morningRead} aria-label="Executive attention summary">
        <div className={styles.morningIntro}>
          <span>Attention now</span>
          <strong>{attentionNow ? attentionNow + " fixture decision" + (attentionNow === 1 ? "" : "s") + " need attention now." : "No fixture decision needs immediate attention."}</strong>
          <small>Start with the highest-value decision, then scan blockers and measurement before opening detail.</small>
        </div>
        <div className={styles.morningPriority}>
          <span>#1 priority</span>
          <strong>{radar[0]?.opponent ?? fixture.opponent}</strong>
          <small>{radar[0]?.attentionState ?? live.decisionState} · score {radar[0]?.opportunityScore ?? "—"} · {radar[0]?.urgency ?? "Watch"} urgency</small>
        </div>
        <div className={styles.morningMetric}>
          <span>Queue gates</span>
          <strong>{queueOpenGates}</strong>
          <small>{queueOpenGates ? "Open approvals across upcoming decisions" : "No open approval gate in the current queue"}</small>
        </div>
        <div className={styles.morningMetric}>
          <span>Measured decisions</span>
          <strong>{queueMeasured}/{radar.length}</strong>
          <small>{queueMeasured ? "Upcoming decisions with outcome evidence" : "No upcoming decision has measured outcome evidence yet"}</small>
        </div>
        <div className={styles.morningQueue}>
          <span>Next in queue</span>
          <div>
            {topThree.map((item, index) => (
              <Link key={item.fixtureId} href={"/app/executive?fixture=" + item.fixtureId}>
                <b>{index + 1}</b><strong>{item.opponent}</strong><small>{item.attentionState}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ExecutiveDomains tiles={domainTiles} />

      <section className={styles.portfolio} aria-label="Decision portfolio">
        <WorkspaceSectionHeader eyebrow="Decision portfolio" title={"The next " + radar.length + " home decisions, in attention order"} />
        <DataTable
          caption="Decision portfolio: upcoming home fixtures ranked by attention"
          rows={portfolio}
          rowKey={(row) => row.fixtureId}
          empty="No upcoming home fixture is in the queue."
          columns={[
            {
              key: "fixture",
              header: "Fixture",
              cell: (row) => (
                <Link href={"/app/executive?fixture=" + row.fixtureId} aria-current={row.fixtureId === selectedId ? "true" : undefined}>
                  {row.opponent}
                </Link>
              )
            },
            { key: "date", header: "Date", cell: (row) => <time className={styles.nowrap} dateTime={row.date}>{new Date(row.date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}</time> },
            { key: "attention", header: "Attention", cell: (row) => row.attentionState },
            {
              key: "decision",
              header: "Decision",
              cell: (row) => row.decisionState
                ? <DecisionStateBadge state={decisionBadge(row.decisionState)} label={row.decisionState} />
                : "Not assessed"
            },
            {
              key: "move",
              header: "Prepared move",
              cell: (row) => row.move
                ? <span className={styles.move}><small>{row.move.kind}</small>{row.move.text}</span>
                : <span className={styles.noMove}>{row.inWindow ? "No signal strong enough to prepare a move yet" : "Outside the next-6 preparation window"}</span>
            },
            { key: "waiting", header: "Waiting on", cell: (row) => row.waitingOn ?? "—" },
            { key: "gates", header: "Open gates", cell: (row) => row.gates },
            { key: "calendar", header: "Calendar moment", cell: (row) => row.moments.length ? row.moments.join(" · ") : "—" }
          ]}
        />
      </section>

      <PilotWindowTracker />

      {matchdayAlert ? (
        <section className={styles.matchdayAlert} data-state={matchdayAlert.state}>
          <div>
            <span>{matchdayAlert.label}</span>
            <strong>{matchdayAlert.title}</strong>
            <small>{matchdayAlert.source}</small>
          </div>
          <p>{matchdayAlert.detail}</p>
          <Link href={"/matchday/" + selectedId}>Open fan utility →</Link>
        </section>
      ) : null}

      <section className={styles.changeStrip} aria-label="Latest evidence and current changes">
        <div>
          <span>Latest evidence · current changes</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</strong>
        </div>
        <div className={styles.changeItems} tabIndex={0} role="region" aria-label="Current changes">
          {currentChanges.map((item, index) => <span key={item}><b>{index + 1}</b>{item}</span>)}
        </div>
      </section>

      <div className={styles.contextBar}>
        <Link href={"/app/matches/" + selectedId}>← Back to workspace</Link>
        <span>{fixture.opponent} · {fixture.date} · {fixture.kickoff ?? "TBC"}</span>
        <DecisionStateBadge state={executiveState} label={live.decisionState} />
      </div>

      <WorkspaceCard className={styles.cockpit} tone="action">
        <div className={styles.cockpitMain}>
          <span>Executive decision brief</span>
          <h2>{campaign?.title.en ?? live.opportunity}</h2>
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
        <div className={styles.decisionFlow} role="list" aria-label="Decision path" tabIndex={0}>
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
          <Link href={"/app/matches/" + selectedId}>Review the decision →</Link>
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
          <Link href={"/app/matches/" + selectedId + "#campaign"}>Review campaign readiness →</Link>
          <Link href={"/app/learning?fixture=" + selectedId}>Review outcome evidence →</Link>
        </div>
      </WorkspaceCard>
    </AppWorkspaceShell>
  );
}
