import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, currentState } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
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

export default function MatchesPage() {
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const radar = buildOpportunityRadar(upcoming.map((fixture) => fixture.id));
  const priority = radar[0] ?? null;
  const currentFixture = priority
    ? upcoming.find((fixture) => fixture.id === priority.fixtureId) ?? null
    : null;
  const live = priority ? getCurrentProductOpportunity(priority.fixtureId) : null;
  const radarWithoutCurrent = priority
    ? radar.filter((item) => item.fixtureId !== priority.fixtureId)
    : radar;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="matches" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>AVELA · Opportunity Radar</span>
          <h1>Where should the club act next?</h1>
          <p>
            Upcoming home fixtures are continuously re-prioritised using opportunity potential, evidence confidence
            and time to act. The ranking is a decision aid, not an attendance forecast.
          </p>
        </div>
        <div className={styles.engineState}>
          <span>Last refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      <section className={styles.radarSummary} aria-label="Opportunity radar summary">
        <div><span>Fixtures watched</span><strong>{radar.length}</strong></div>
        <div><span>Act now</span><strong>{radar.filter((item) => item.radarState === "Act now").length}</strong></div>
        <div><span>Needs review</span><strong>{radar.filter((item) => item.radarState === "Review").length}</strong></div>
        <div><span>Monitoring</span><strong>{radar.filter((item) => item.radarState === "Monitor").length}</strong></div>
      </section>

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
              <p><b>Do next:</b> {live?.nextAction.label ?? "No action is currently required."}</p>
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
              </div>
              <div className={styles.radarEvidence}>
                <span className={styles[`state${item.radarState.replace(" ", "")}`]}>{item.radarState}</span>
                <strong>{item.confidence} confidence</strong>
                <small>{item.materialSignalCount} material · {item.signalCount} total signals</small>
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
