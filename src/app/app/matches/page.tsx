import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { OpportunityExplorer } from "@/components/OpportunityExplorer";
import { calendar, campaignPlans, currentState, eventLandscape } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildCalendarRelationships } from "@/lib/calendarIntelligence";
import { getInternalCalendarRelationships } from "@/lib/calendarIntelligenceServer";
import { applyCalendarDecisionPressure } from "@/lib/calendarDecisionPressure";
import styles from "./matches.module.css";

export const metadata: Metadata = {
  title: "Opportunity Radar · AVELA",
  description: "Upcoming home fixtures ranked by opportunity potential, confidence and urgency."
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(value + "T12:00:00"));
}

export default async function MatchesPage() {
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const clubContext = await getCurrentClubOperatingContext();
  const opportunityRadar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id), clubContext);
  const calendarToDate = calendar.map((item) => item.date).sort().at(-1) ?? today;
  const externalCalendarRelationships = buildCalendarRelationships({
    fixtures: calendar,
    campaignPlans,
    eventLandscape,
    fromDate: today
  });
  const internalCalendar = await getInternalCalendarRelationships({
    clubId: clubContext?.clubId,
    fixtures: calendar,
    campaignPlans,
    fromDate: today,
    toDate: calendarToDate
  });
  const radar = applyCalendarDecisionPressure(
    opportunityRadar,
    [...externalCalendarRelationships, ...internalCalendar.relationships]
  );
  const priority = radar[0] ?? null;
  const currentFixture = priority
    ? upcoming.find((fixture) => fixture.id === priority.fixtureId) ?? null
    : null;
  const live = priority ? getCurrentProductOpportunity(priority.fixtureId) : null;
  const radarWithoutCurrent = priority
    ? radar.filter((item) => item.fixtureId !== priority.fixtureId)
    : radar;

  const explorerItems = radar.map((item) => {
    const campaign = campaignPlans.campaigns.find((entry) => entry.fixtureId === item.fixtureId) ?? null;
    const approvalsReady = campaign?.approvals.filter((approval) => approval.state === "ready").length ?? 0;
    const channels = Array.from(new Set((campaign?.activations ?? []).map((activation) => activation.channel)));
    return {
      fixtureId: item.fixtureId,
      opponent: item.opponent,
      date: item.date,
      daysToFixture: item.daysToFixture,
      opportunityScore: item.opportunityScore,
      opportunity: item.opportunity,
      confidence: item.confidence,
      urgency: item.urgency,
      radarState: item.radarState,
      materialSignalCount: item.materialSignalCount,
      recentMaterialSignalCount: item.recentMaterialSignalCount,
      signalCount: item.signalCount,
      decisionState: item.decisionState,
      approvalsReady,
      approvalsTotal: campaign?.approvals.length ?? 0,
      activations: campaign?.activations.length ?? 0,
      channels
    };
  });

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="matches" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AVELA · Opportunity Radar</span>
          <h1>Where should the club act next?</h1>
          <p>
            Upcoming home fixtures are re-prioritised whenever the validated evidence state refreshes. Opportunity potential stays separate
            from calendar pressure; the final attention order can rise because of timing, internal constraints or fixture collisions.
            The ranking is a decision aid, not an attendance forecast.
          </p>
        </div>
        <div className={styles.engineState}>
          <span>Last refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      <section className={styles.radarSummary} aria-label="Opportunity radar summary">
        <div><span>Fixtures watched</span><strong>{radar.length}</strong></div>
        <div><span>Act now</span><strong>{radar.filter((item) => item.attentionState === "Act now").length}</strong></div>
        <div><span>Needs review</span><strong>{radar.filter((item) => item.attentionState === "Review").length}</strong></div>
        <div><span>Monitoring</span><strong>{radar.filter((item) => item.attentionState === "Monitor").length}</strong></div>
        <div><span>No material opportunity</span><strong>{radar.filter((item) => item.attentionState === "No material opportunity").length}</strong></div>
      </section>

      {clubContext ? (
        <section className={styles.clubFitPanel} aria-label="Club context for Opportunity Radar">
          <div>
            <span className={styles.eyebrow}>Club context · {clubContext.clubName}</span>
            <h2>Context explains fit. Evidence still sets the priority.</h2>
            <p>
              AVELA compares each opportunity with the club&apos;s saved objectives and connected channels.
              This context never changes the radar rank, confidence or evidence state.
            </p>
          </div>
          <div className={styles.clubFitFacts}>
            <span><strong>{clubContext.priorityObjectives.length}</strong> priority objectives</span>
            <span><strong>{clubContext.connectedChannels.length}</strong> connected channels</span>
            <span><strong>{clubContext.fixtureSource}</strong> fixture source</span>
          </div>
        </section>
      ) : (
        <section className={styles.clubFitEmpty} aria-label="Club context unavailable">
          <span>Evidence-only mode</span>
          <strong>Opportunity Radar is running without saved club context.</strong>
          <p>Connect a club workspace and complete Setup to add objective/channel fit without changing evidence ranking.</p>
          <Link href="/app/setup">Open Setup →</Link>
        </section>
      )}

      {currentFixture ? (
        <section className={styles.priorityMatch} aria-label="Current priority match">
          <div className={styles.priorityTop}>
            <div>
              <span className={styles.eyebrow}>Current engine priority</span>
              <div className={styles.fixtureTopline}>
                <span>{live?.timingLabel ?? "Next home match"}</span>
                <span>{live?.decisionState ?? "HOLD"} · {live?.confidence.label ?? "—"} confidence</span>
              </div>
            </div>
            <div className={styles.priorityDate}>
              <span>{formatDate(currentFixture.date)}</span>
              <strong>{currentFixture.kickoff ?? "TBC"}</strong>
            </div>
          </div>

          <div className={styles.priorityMain}>
            <div>
              <h2>London City <small>v</small> {currentFixture.opponent}</h2>
              <p>{currentFixture.competition} · {currentFixture.venue}</p>
            </div>
            <div className={styles.priorityDecision}>
              <span>Growth opportunity</span>
              <strong>{live?.opportunity ?? "Review current evidence."}</strong>
              <div className={styles.priorityMetrics}>
                <div><span>Opportunity score</span><b>{priority?.opportunityScore ?? "—"}</b></div>
                <div><span>Attention</span><b>{priority?.attentionState ?? "—"}</b></div>
                <div><span>Calendar pressure</span><b>{priority?.calendarPressure.state ?? "—"}</b></div>
                <div><span>Signal movement</span><b>{priority?.signalChangeLabel ?? "—"}</b></div>
              </div>
              <p><b>Do next:</b> {live?.nextAction.label ?? "No action is currently required."}</p>
              <p><b>Attention driver:</b> {priority?.attentionReason ?? "No calendar pressure adjustment."}</p>
              {priority?.clubFit ? (
                <div className={styles.priorityClubFit}>
                  <span>Club fit · advisory only</span>
                  <strong>{priority.clubFit.summary}</strong>
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.priorityFooter}>
            <div>
              <span>Why now</span>
              <strong>{live?.whyNow ?? "Current fixture evidence is still being assessed."}</strong>
            </div>
            <Link href={`/app/matches/${currentFixture.id}`}>Open opportunity brief →</Link>
          </div>
        </section>
      ) : null}

      <OpportunityExplorer items={explorerItems} />

      <section className={styles.monitoringSection} aria-label="Upcoming fixture opportunity radar">
        <div className={styles.monitoringHead}>
          <div>
            <span className={styles.eyebrow}>Next opportunities</span>
            <h2>Ranked by what deserves attention now</h2>
          </div>
          <span>Potential, evidence and urgency are kept separate inside each fixture workspace.</span>
        </div>

        <div className={styles.radarList}>
          {radarWithoutCurrent.map((item, index) => (
            <article className={styles.radarFixture} key={item.fixtureId}>
              <div className={styles.radarRank}>#{index + 2}</div>
              <div className={styles.radarMatch}>
                <span>{formatDate(item.date)} · {item.kickoff ?? "TBC"} · {item.competition}</span>
                <h3>{item.opponent}</h3>
                <p>{item.venue}</p>
              </div>
              <div className={styles.radarOpportunity}>
                <span>{item.opportunityLabel}</span>
                <strong>{item.opportunity}</strong>
                {item.lens.length ? (
                  <div className={styles.signalLenses}>
                    {item.lens.map((lens) => <b key={lens}>{lens}</b>)}
                  </div>
                ) : (
                  <small>No women’s-football-specific public signal classified yet.</small>
                )}
                {item.clubFit ? (
                  <div className={styles.clubFitInline}>
                    <span>Club fit does not affect rank</span>
                    <p>{item.clubFit.summary}</p>
                    {item.clubFit.matchedObjectives.length || item.clubFit.activationChannels.length ? (
                      <div>
                        {item.clubFit.matchedObjectives.map((objective) => <b key={objective}>Goal · {objective}</b>)}
                        {item.clubFit.activationChannels.map((channel) => <b key={channel}>Route · {channel}</b>)}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className={styles.radarEvidence}>
                <span className={styles[`state${item.attentionState.replaceAll(" ", "")}`]}>{item.attentionState}</span>
                <div className={styles.radarScoreline}>
                  <b>{item.opportunityScore ?? "—"}<small>score</small></b>
                  <b>{item.urgency}<small>urgency</small></b>
                  <b>{item.calendarPressure.state}<small>calendar</small></b>
                </div>
                <strong>{item.confidence} confidence</strong>
                <small>{item.materialSignalCount} material · {item.signalCount} total signals</small>
                <small>Opportunity state · {item.radarState}</small>
                <small className={styles.signalMovement}>{item.attentionReason}</small>
                <Link href={`/app/matches/${item.fixtureId}`}>Review →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.womenLens}>
        <div>
          <span className={styles.eyebrow}>Women’s-football lens</span>
          <h2>Specialisation without inventing evidence.</h2>
        </div>
        <p>
          AVELA classifies sourced signals into women’s-football-relevant lenses such as player momentum,
          family/grassroots, cultural crossover, fixture overlap, attendance demand and partner fit. A lens appears
          only when an existing signal supports it.
        </p>
      </section>

      <section className={styles.principle}>
        <span>Product principle</span>
        <strong>The club does not create a plan first.</strong>
        <p>Fixture → signals → opportunity → recommended play → human review → activation → learning.</p>
      </section>
    </main>
  );
}
