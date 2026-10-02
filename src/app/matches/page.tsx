import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { calendar, currentState, liveSignals } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import styles from "./matches.module.css";

export const metadata: Metadata = {
  title: "Matches · Fan Growth Engine",
  description: "Upcoming home fixtures and the next recommended action for each match."
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(value + "T12:00:00"));
}

export default function MatchesPage() {
  const live = getCurrentProductOpportunity();
  const currentFixtureId = currentState.next_home_fixture_id;
  const today = currentState.updated_at.slice(0, 10);
  const upcoming = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.date >= today && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  const currentFixture = upcoming.find((fixture) => fixture.id === currentFixtureId) ?? upcoming[0] ?? null;
  const futureFixtures = upcoming.filter((fixture) => fixture.id !== currentFixture?.id);

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="matches" />

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Club workspace</span>
          <h1>Upcoming home matches</h1>
          <p>
            The engine starts from the fixture calendar automatically. Open the next match to see the recommended plan;
            future fixtures stay in monitoring until the evidence becomes actionable.
          </p>
        </div>
        <div className={styles.engineState}>
          <span>Last refresh</span>
          <strong>{new Date(currentState.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}</strong>
        </div>
      </header>

      {currentFixture ? (
        <section className={styles.priorityMatch} aria-label="Current priority match">
          <div className={styles.priorityTop}>
            <div>
              <span className={styles.eyebrow}>Current priority</span>
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
              <span>Recommended focus</span>
              <strong>{live?.opportunity ?? "Review current evidence."}</strong>
              <p><b>Do next:</b> {live?.nextAction.label ?? "No action is currently required."}</p>
            </div>
          </div>

          <div className={styles.priorityFooter}>
            <div>
              <span>Why now</span>
              <strong>{live?.whyNow ?? "Current fixture evidence is still being assessed."}</strong>
            </div>
            <Link href={`/app/matches/${currentFixture.id}`}>Open match plan →</Link>
          </div>
        </section>
      ) : null}

      <section className={styles.monitoringSection} aria-label="Future fixtures under monitoring">
        <div className={styles.monitoringHead}>
          <div>
            <span className={styles.eyebrow}>Monitoring</span>
            <h2>Future home matches</h2>
          </div>
          <span>No action required until evidence becomes material.</span>
        </div>

        <div className={styles.futureList}>
          {futureFixtures.map((fixture) => {
            const signalCount = liveSignals.filter((signal) => signal.fixtureId === fixture.id).length;
            return (
              <article className={styles.futureFixture} key={fixture.id}>
                <div>
                  <span>{formatDate(fixture.date)} · {fixture.kickoff ?? "TBC"}</span>
                  <h3>{fixture.opponent}</h3>
                  <p>{fixture.competition} · {fixture.venue}</p>
                </div>
                <div className={styles.futureState}>
                  <span>{signalCount} sourced signals</span>
                  <strong>Monitoring automatically</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.principle}>
        <span>Product principle</span>
        <strong>The club does not create a plan first.</strong>
        <p>Fixture → signals → AI interpretation → opportunity → draft plan. The user reviews, adjusts and approves.</p>
      </section>
    </main>
  );
}
