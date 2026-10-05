import type { Metadata } from "next";
import Link from "next/link";
import styles from "./results.module.css";
import { ProductDataStateLegend } from "@/components/ProductDataStateLegend";
import { LearningCampaignTrace } from "@/components/LearningCampaignTrace";
import { OutcomeAggregatePanel } from "@/components/OutcomeAggregatePanel";
import { NextFixtureLearning } from "@/components/NextFixtureLearning";
import { deriveNextFixtureLearning } from "@/lib/learningRecommendation";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentProductResults } from "@/lib/productResults";
import { calendar, currentState } from "@/lib/data";
import { AppWorkspaceShell, WorkspaceFilterButton } from "@/components/AppWorkspaceShell";

export const metadata: Metadata = {
  title: "Learning",
  description: "Close the loop after matchday: measure the action, capture the learning and update the next fixture decision."
};

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function currency(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

// productAppShell is provided by AppWorkspaceShell.
export default async function ResultsLearningPage({ searchParams }: { searchParams: Promise<{ fixture?: string }> }) {
  const params = await searchParams;
  const selectedId = calendar.some((item) => item.id === params.fixture && item.homeAway === "home")
    ? params.fixture : currentState.last_completed_home_fixture_id;
  const live = getCurrentProductOpportunity(selectedId);
  const results = getCurrentProductResults(selectedId);
  const selected = calendar.find((item) => item.id === selectedId);
  const measured = results?.state === "measured";
  const nextFixture = calendar
    .filter((item) => item.homeAway === "home" && item.status === "scheduled" && item.id !== selectedId)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const nextLearning = deriveNextFixtureLearning(live, results);

  return (
    <AppWorkspaceShell
      active="learning"
      eyebrow="Outcomes & learning"
      title="Learning"
      subtitle={selected ? selected.opponent + " · " + selected.date : "Close the loop from observed outcome to next decision."}
      actions={<WorkspaceFilterButton label="Fixture filters" />}
    >

      <nav className={styles.fixturePicker} aria-label="Choose a fixture to review">
        <strong>Review a fixture</strong>
        {calendar.filter((item) => item.homeAway === "home" && (item.status !== "scheduled" || item.id === currentState.next_home_fixture_id)).map((item) => (
          <Link key={item.id} href={`/app/learning?fixture=${item.id}`} aria-current={item.id === selectedId ? "page" : undefined}>
            {item.opponent} · {new Date(item.date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}
          </Link>
        ))}
      </nav>

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Learning · {selected?.opponent} · {selected?.date}</span>
          <h1>{live?.fixturePhase === "pre-match" ? "Measurement starts after matchday." : "What should change for the next match?"}</h1>
          <p>
            {live?.fixturePhase === "pre-match"
              ? "The fixture is still ahead. This screen keeps the measurement plan explicit now, then switches to observed outcomes when authorised post-match evidence arrives."
              : "What do we know after matchday? Start there, then turn it into one bounded change for the next fixture. Attribution and causal claims stay separate so the club does not confuse correlation with incrementality."}
          </p>
        </div>
        <aside className={styles.stateCard}>
          <span>{live?.timingLabel ?? "Measurement"} · Current measurement state</span>
          <strong>{measured ? "Club ticketing data connected" : live?.fixturePhase === "pre-match" ? "Pre-match · outcome not available yet" : "Awaiting club conversion data"}</strong>
          <p>
            {measured
              ? `Measured export for ${live?.fixture.opponent ?? "the current fixture"}${results?.extractedAt ? ` · extracted ${new Date(results.extractedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}` : ""}.`
              : live?.nextAction.measurement ?? "Matched ticket conversion is not connected yet."}
          </p>
        </aside>
      </header>

      {selected ? <section className={styles.fixtureFacts} aria-label="Observed fixture facts">
        <article><span>Sporting result · London City first</span><strong>{selected.result ? `${selected.result.for}–${selected.result.against}` : "Not available yet"}</strong></article>
        <article><span>Recorded attendance</span><strong>{selected.attendance?.toLocaleString("en-GB") ?? "Not measured yet"}</strong></article>
        <article><span>Commercial impact</span><strong>{measured ? "Descriptive club evidence connected" : "Not measured yet"}</strong></article>
      </section> : null}

      <section className={styles.kpis}>
        <article>
          <span>Addressable repeat cohort</span>
          <strong>{results?.addressableRepeatCohort?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Consented previous-home buyers who have not purchased this fixture." : "Requires matched club CRM/ticketing data."}</p>
        </article>
        <article>
          <span>Campaign-attributed tickets</span>
          <strong>{results?.campaignAttributedTickets?.toLocaleString("en-GB") ?? "—"}</strong>
          <p>{measured ? "Tickets with a campaign id in the authorised export." : "Requires matched purchase attribution."}</p>
        </article>
        <article>
          <span>Repeat purchase rate</span>
          <strong>{percent(results?.repeatPurchaseRate ?? null)}</strong>
          <p>{measured ? "Share of consented previous-home buyers who purchased the current fixture." : "Requires a multi-fixture supporter cohort."}</p>
        </article>
        <article>
          <span>Ticket revenue</span>
          <strong>{currency(results?.grossTicketRevenue ?? null)}</strong>
          <p>{measured ? `Scan rate ${percent(results?.scanRate ?? null)} · no-show ${percent(results?.noShowRate ?? null)}` : "Requires realised ticket value and scan status."}</p>
        </article>
      </section>

      <NextFixtureLearning
        learning={nextLearning}
        nextFixtureId={nextFixture?.id}
        nextFixtureLabel={nextFixture ? `${nextFixture.opponent} · ${nextFixture.date}` : undefined}
      />

      <details className={styles.evidenceDrawer}>
        <summary>
          <div><span className={styles.eyebrow}>Decision evidence</span><strong>Why AVELA is changing — or not changing — the next fixture decision</strong></div>
          <span>Open measurement trace →</span>
        </summary>
        <div className={styles.evidenceDrawerBody}>
          <ProductDataStateLegend />
          {selectedId ? <LearningCampaignTrace fixtureId={selectedId} measured={Boolean(measured)} /> : null}
      {selectedId && live?.fixture ? (
        <OutcomeAggregatePanel
          fixtureId={selectedId}
          fixtureLabel={live.fixture.opponent}
          fixtureDate={live.fixture.date}
        />
      ) : null}
        </div>
      </details>

      <details className={styles.interpretation}>
        <summary>
          <div>
            <span className={styles.eyebrow}>Interpretation guardrail</span>
            <strong>How to read this evidence</strong>
          </div>
          <span>Attribution ≠ incremental impact →</span>
        </summary>
        <div className={styles.interpretationBody}>
          <p>
            A campaign id can tell us which tickets were associated with an activation. It does not prove that those
            purchases would not have happened anyway.
          </p>
          <div className={styles.interpretationGrid}>
            <article>
              <span>Observed</span>
              <strong>Purchases, scans, revenue and repeat behaviour</strong>
              <p>Descriptive club evidence.</p>
            </article>
            <article>
              <span>Attributed</span>
              <strong>Tickets linked to campaign identifiers</strong>
              <p>Useful for channel analysis, but still descriptive.</p>
            </article>
            <article>
              <span>Incremental</span>
              <strong>Not established</strong>
              <p>{results?.interpretation.requirement ?? "Requires a credible counterfactual."}</p>
            </article>
          </div>
        </div>
      </details>

      <section className={styles.learningLoop}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Learning loop</span>
          <h2>From hypothesis to the next fixture decision.</h2>
        </div>

        <div className={styles.timeline}>
          <article>
            <span>01 · HYPOTHESIS</span>
            <strong>Repeat recent attendees are more valuable to activate than a cold audience.</strong>
            <p>Defined before execution.</p>
          </article>
          <article>
            <span>02 · MEASURE</span>
            <strong>Match audience → campaign → purchase → scan → repeat.</strong>
            <p>{measured ? "Current fixture purchase and scan evidence is connected." : "Blocked until club CRM/ticketing data is connected."}</p>
          </article>
          <article>
            <span>03 · LEARN</span>
            <strong>{measured ? "Use observed repeat, attribution and attendance quality to update the hypothesis without claiming causation." : "Promote the hypothesis only when the result supports it."}</strong>
            <p>No confidence uplift without evidence.</p>
          </article>
          <article>
            <span>04 · APPLY</span>
            <strong>Change the next fixture audience, timing or investment decision.</strong>
            <p>The learning must affect a real choice.</p>
          </article>
        </div>
      </section>

      <section className={styles.resultState}>
        <div>
          <span className={styles.eyebrow}>{measured ? "Measured state" : "What happens when data arrives"}</span>
          <h2>{measured ? "The product has moved from hypothesis to observed outcome." : "Measured results replace placeholders automatically."}</h2>
          <p>
            {measured
              ? "The values above come from authorised aggregate club CRM/ticketing evidence. They can strengthen, weaken or redirect the next fixture decision, but they do not establish incremental lift on their own."
              : "The product never presents illustrative outcomes as if they happened. Until attribution exists, the honest result state is “not measured yet”."}
          </p>
        </div>
        <div className={styles.stateList}>
          <div><span>Current</span><strong>{measured ? "Observed result" : "Hypothesis"}</strong></div>
          <div><span>Evidence state</span><strong>{measured ? "Live club data" : "Missing club data"}</strong></div>
          <div><span>Decision effect</span><strong>Confidence changes only if supported</strong></div>
          <div><span>Causal claim</span><strong>{results?.interpretation.causalClaim ? "Supported" : "Not established"}</strong></div>
        </div>
      </section>

      <section className={styles.next}>
        <div>
          <span className={styles.eyebrow}>Close the loop</span>
          <h2>Learning should send the user back to the next match, not to a report archive.</h2>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/app/matches">Back to matches</Link>
          {selectedId ? <Link className={styles.secondary} href={`/app/matches/${selectedId}`}>Open match record</Link> : null}
        </div>
      </section>
    </AppWorkspaceShell>
  );
}
