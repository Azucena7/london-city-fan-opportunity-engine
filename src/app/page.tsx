import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { CommercialSignalStage } from "@/components/CommercialSignalStage";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

export const metadata: Metadata = {
  title: "AVELA · Decision Intelligence for Football Clubs",
  description:
    "AVELA connects signals, club context and operational constraints to show football clubs what needs attention, what to do next and whether they can realistically deliver it."
};

const roles = [
  ["Marketing", "Campaign opportunity, audience, timing and capacity."],
  ["Commercial", "Sponsor obligations, activations, rights and renewal context."],
  ["Executives", "Risks, priorities, representation and major opportunities."],
  ["Operations", "Dependencies, approvals, deadlines and bottlenecks."]
] as const;

export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Decision intelligence for football clubs</span>
          <h1>Read the signals.<br />Move the club.</h1>
          <p className={styles.heroLead}>
            AVELA turns fragmented club context into governed next moves — helping teams spot opportunities earlier,
            decide faster, use scarce assets better and carry learning from one fixture into the next.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/live/london-city">See AVELA on a real fixture</Link>
            <Link className={styles.secondaryAction} href="/for-clubs#demo">Discuss a club pilot</Link>
          </div>
          <div className={styles.heroMeta}>
            <span>Works above your existing stack.</span>
            <span>Human approval for material decisions.</span>
            <span>Built around women&apos;s football. Designed for football clubs.</span>
          </div>
        </div>
        <CommercialSignalStage />
      </section>

      <section className={styles.signalTicker} aria-label="AVELA intelligence inputs">
        <span>FIXTURES</span>
        <span>SPONSORS</span>
        <span>PLAYERS</span>
        <span>CONTRACTS</span>
        <span>CALENDARS</span>
        <span>CAPACITY</span>
        <span>PERFORMANCE</span>
        <span>INTERNAL CONTEXT</span>
      </section>

      <section className={styles.problem}>
        <div>
          <span className={styles.kicker}>The problem is not missing data</span>
          <h2>Your club already has the signals. They are fragmented across people, platforms and calendars.</h2>
        </div>
        <div className={styles.problemCopy}>
          <p>CRM knows who can be reached. Ticketing knows who bought. Analytics knows what performed. Contracts know what is owed. Calendars know who is available. Work systems know what the team is already carrying.</p>
          <p><strong>People still have to join that context manually before almost every important decision.</strong></p>
        </div>
      </section>

      <CommercialEcosystem />

      <section className={styles.valueCreated} aria-labelledby="value-created-title">
        <div className={styles.valueIntro}>
          <span className={styles.kicker}>The value AVELA adds</span>
          <h2 id="value-created-title">The gain is not another insight. It is a better operating decision.</h2>
          <p>
            AVELA connects evidence that normally lives in different teams, then turns it into a decision the club can
            actually act on. The pilot should prove value in the operating metrics below — not rely on vague AI claims.
          </p>
        </div>
        <div className={styles.valueGrid}>
          <article><span>01</span><strong>Catch opportunities earlier</strong><p>Surface material changes before they disappear inside dashboards, inboxes or individual memory.</p><small>Measure: signal → review time</small></article>
          <article><span>02</span><strong>Reduce coordination cost</strong><p>Bring player, sponsor, calendar, rights and capacity constraints into the same decision instead of reconciling them manually.</p><small>Measure: handoffs + decision cycle time</small></article>
          <article><span>03</span><strong>Use scarce assets better</strong><p>Optimise player windows, commercial rights, creative capacity and campaign timing around the highest-value viable option.</p><small>Measure: asset utilisation + conflicts avoided</small></article>
          <article><span>04</span><strong>Make decisions safer</strong><p>Keep evidence, assumptions, approvals and contract truth visible before the club commits externally.</p><small>Measure: blocked risks resolved before launch</small></article>
          <article><span>05</span><strong>Learn across fixtures</strong><p>Preserve recommendation, club decision, execution and outcome so the next comparable decision starts smarter.</p><small>Measure: learning reused in later decisions</small></article>
          <article><span>06</span><strong>Increase organisational leverage</strong><p>Let specialist teams keep their tools while AVELA reduces the work required to connect them around one priority.</p><small>Measure: manual analysis replaced or shortened</small></article>
        </div>
      </section>

      <section className={styles.capabilityHorizon} aria-labelledby="capability-horizon-title">
        <div className={styles.capabilityIntro}>
          <span className={styles.kicker}>What AVELA can become</span>
          <h2 id="capability-horizon-title">Start as a decision layer. Grow into the club&apos;s operating intelligence.</h2>
          <p>Capability expands with authorised data, connectors and governance. The stages below separate what exists now from what becomes possible as the club connects more context.</p>
        </div>
        <div className={styles.horizonGrid}>
          <article data-stage="now">
            <span>Now · Product today</span>
            <strong>Detect, prioritise, recommend and govern.</strong>
            <ul>
              <li>Fixture-led opportunity radar</li>
              <li>Campaign and player-pack recommendations</li>
              <li>Sponsor, rights and calendar constraints</li>
              <li>Decision evidence, approvals and learning trace</li>
            </ul>
          </article>
          <article data-stage="connected">
            <span>Next · With club integrations</span>
            <strong>Make decisions with richer operational truth.</strong>
            <ul>
              <li>CRM and ticketing audience evidence</li>
              <li>Private performance and sponsor measurement</li>
              <li>Live work-capacity and calendar context</li>
              <li>Authorised handoffs into club systems</li>
            </ul>
          </article>
          <article data-stage="vision">
            <span>Horizon · Product direction</span>
            <strong>Continuously optimise the club&apos;s growth choices.</strong>
            <ul>
              <li>Cross-fixture resource allocation</li>
              <li>Scenario planning across campaigns and assets</li>
              <li>Proactive detection of commercial and fan opportunities</li>
              <li>Institutional memory that compounds across seasons</li>
            </ul>
          </article>
        </div>
        <div className={styles.horizonBoundary}>
          <strong>Vision is not current capability.</strong>
          <p>AVELA should only claim an integration, automated action or evidence source when it is actually authorised and operational for that club.</p>
        </div>
      </section>

      <section className={styles.example} aria-labelledby="example-title">
        <div className={styles.exampleIntro}>
          <span className={styles.kicker}>What a decision looks like</span>
          <h2 id="example-title">From several weak signals to one operationally viable action.</h2>
        </div>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleSignals}>
            <article><span>09:12 · Performance</span><strong>Player momentum rises materially.</strong></article>
            <article><span>Contract</span><strong>Partner player appearances remain to be delivered.</strong></article>
            <article><span>Calendar</span><strong>International availability risk is approaching.</strong></article>
            <article><span>Operations</span><strong>Creative capacity is already close to saturation.</strong></article>
          </div>
          <div className={styles.exampleDecision}>
            <span>AVELA · Review</span>
            <h3>Act before the availability window closes.</h3>
            <p>Use the strongest viable player window, reduce the creative package and send an early heads-up to the operational owners.</p>
            <div className={styles.exampleFacts}>
              <div><span>Impact</span><strong>High</strong></div>
              <div><span>Urgency</span><strong>High</strong></div>
              <div><span>Feasibility</span><strong>Medium</strong></div>
            </div>
            <div className={styles.exampleActions}><span>Why?</span><span>Alternative</span><span>Ask AVELA</span><span>Commit plan</span></div>
          </div>
        </div>
      </section>

      <section className={styles.notAnother}>
        <div className={styles.notAnotherTitle}>
          <span className={styles.kicker}>What AVELA is — and is not</span>
          <h2>Not another dashboard. Not another task manager. Not just another AI assistant.</h2>
        </div>
        <div className={styles.notAnotherRows}>
          <article><span>Dashboards</span><strong>Show information.</strong><p>AVELA identifies which change deserves attention and what decision it creates.</p></article>
          <article><span>General AI</span><strong>Answers when someone asks.</strong><p>AVELA maintains structured club context and continuously surfaces the next question worth answering.</p></article>
          <article><span>Work tools</span><strong>Organise delivery.</strong><p>AVELA decides what work is worth doing, who or what is needed and whether the club can absorb it.</p></article>
        </div>
        <div className={styles.llmStatement}>
          <strong>The LLM is part of AVELA. It is not the product.</strong>
          <p>General AI can help a person think. AVELA is designed to help a club operate across changing evidence, constraints and decisions.</p>
        </div>
      </section>

      <section className={styles.liveProof}>
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Proof in public</span>
          <h2>See what AVELA saw before London City announced it.</h2>
          <p>The Brighton hypothesis was time-stamped before a comparable London City activation became public. It is evidence of relevance, not evidence that the club saw or used AVELA.</p>
          <div className={styles.proofPair}>
            <article><span>AVELA saw</span><strong>{proof.hypothesis.en}</strong></article>
            <article><span>London City later announced</span><strong>{proof.observedAction.en}</strong></article>
          </div>
          <div className={styles.proofActions}>
            <Link className={styles.coralButton} href="/case-study">See the evidence</Link>
            <Link className={styles.darkTextLink} href="/live/london-city">Open London City Live ↗</Link>
          </div>
        </div>
        <div className={styles.livePanel}>
          <span>Current live case</span>
          <strong>{live?.fixture.opponent ?? "Next home fixture"}</strong>
          <div className={styles.liveDecision}>
            <span>Opportunity</span>
            <h3>{live?.opportunity ?? "Review current evidence."}</h3>
          </div>
          <div className={styles.liveFacts}>
            <div><span>State</span><strong>{live?.decisionState ?? "HOLD"}</strong></div>
            <div><span>Confidence</span><strong>{live?.confidence.label ?? "—"}</strong></div>
            <div><span>Do next</span><strong>{live?.nextAction.label ?? "Review evidence"}</strong></div>
          </div>
        </div>
      </section>

      <section className={styles.roles}>
        <div>
          <span className={styles.kicker}>One decision layer, different perspectives</span>
          <h2>AVELA should make sense to the people who already run the club.</h2>
        </div>
        <div className={styles.roleGrid}>
          {roles.map(([role, description]) => <article key={role}><span>{role}</span><p>{description}</p></article>)}
        </div>
      </section>

      <section className={styles.pilot}>
        <div>
          <span className={styles.kicker}>Start small</span>
          <h2>Prove the decision loop before you expand the integration footprint.</h2>
          <p>A useful pilot can start with a limited set of fixtures, existing public evidence and a small amount of club-approved context. No rip-and-replace programme is required.</p>
        </div>
        <div className={styles.pilotSteps}>
          <article><span>01</span><strong>4–6 fixtures</strong><p>Use the real calendar.</p></article>
          <article><span>02</span><strong>1–2 workflows</strong><p>Focus on decisions that matter.</p></article>
          <article><span>03</span><strong>Existing stack</strong><p>Add only the integrations that improve confidence.</p></article>
          <article><span>04</span><strong>Measured learning</strong><p>Compare recommendation, decision, execution and result.</p></article>
        </div>
        <div className={styles.pilotActions}>
          <Link className={styles.primary} href="/for-clubs#demo">See how AVELA could fit your club</Link>
          <Link className={styles.textLink} href="/app/demo">Try the guided product demo ↗</Link>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta}>
        <div>
          <span>AVELA</span>
          <h2>You do not need another platform to manage. You need a better way to decide what deserves attention across the platforms you already have.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs#demo">Explore a club pilot</Link>
          <Link className={styles.finalLink} href="/live/london-city">See a live fixture decision ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>AVELA</strong>
        <span>Decision intelligence for football clubs.</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
