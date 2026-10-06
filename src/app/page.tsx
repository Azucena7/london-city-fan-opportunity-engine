import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { CommercialSignalStage } from "@/components/CommercialSignalStage";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

export const metadata: Metadata = {
  title: "AVELA · Decision Intelligence for Football Clubs",
  description:
    "AVELA connects signals, club context and operational constraints to show football clubs what needs attention, what to do next and whether they can realistically deliver it."
};


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
          <div className={styles.heroProof} aria-label="AVELA operating loop">
            <div><span>01</span><strong>Read</strong><small>Signals + context</small></div>
            <i>→</i>
            <div><span>02</span><strong>Decide</strong><small>Priority + feasibility</small></div>
            <i>→</i>
            <div><span>03</span><strong>Move</strong><small>Action + owner</small></div>
            <i>→</i>
            <div><span>04</span><strong>Learn</strong><small>Outcome retained</small></div>
          </div>
        </div>
        <CommercialSignalStage />
      </section>

      <section className={styles.signalTicker} aria-label="AVELA intelligence inputs">
        <div className={styles.signalTrack}>
          {[0, 1].map((copy) => (
            <div className={styles.signalSet} aria-hidden={copy === 1} key={copy}>
              <span>FIXTURES</span><b>•</b>
              <span>SPONSORS</span><b>•</b>
              <span>PLAYERS</span><b>•</b>
              <span>CONTRACTS</span><b>•</b>
              <span>CALENDARS</span><b>•</b>
              <span>CAPACITY</span><b>•</b>
              <span>PERFORMANCE</span><b>•</b>
              <span>INTERNAL CONTEXT</span><b>•</b>
            </div>
          ))}
        </div>
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

      <CommercialDecisionDemo />

      <div className={styles.storyBridge} aria-hidden="true">
        <span>Illustrative decision</span>
        <i>→</i>
        <strong>Observed evidence</strong>
      </div>

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


      <CommercialEcosystem />

      <section className={styles.valueCreated} aria-labelledby="value-created-title">
        <div className={styles.valueIntro}>
          <span className={styles.kicker}>The value AVELA adds</span>
          <h2 id="value-created-title">Better decisions. Less manual coordination.</h2>
          <p>
            AVELA connects evidence across teams and turns it into a decision the club can act on.
            A pilot should prove that in operating metrics, not vague AI claims.
          </p>
        </div>
        <div className={styles.valueGrid}>
          <article><span>01</span><strong>Catch the moment earlier</strong><p>Surface the change that matters before it disappears inside dashboards, inboxes or individual memory.</p><small>Signal → decision time</small></article>
          <article><span>02</span><strong>Make one joined-up decision</strong><p>Bring audience, player, sponsor, calendar, rights and capacity constraints into the same recommendation.</p><small>Handoffs + decision cycle</small></article>
          <article><span>03</span><strong>Use scarce assets where they matter</strong><p>Allocate player windows, rights, creative capacity and spend around the highest-value viable play.</p><small>Asset utilisation + conflicts avoided</small></article>
          <article><span>04</span><strong>Make the next fixture smarter</strong><p>Retain recommendation, decision, execution and outcome so learning compounds instead of resetting every match.</p><small>Learning reused later</small></article>
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

      <section className={styles.pilot}>
        <div>
          <span className={styles.kicker}>Start small</span>
          <h2>Prove AVELA on 4–6 fixtures before you integrate more.</h2>
          <p>A useful pilot can start with a limited set of fixtures, existing public evidence and a small amount of club-approved context. No rip-and-replace programme is required.</p>
        </div>
        <div className={styles.pilotSteps}>
          <article><span>01</span><strong>4–6 fixtures</strong><p>Use the real calendar.</p></article>
          <article><span>02</span><strong>1–2 workflows</strong><p>Focus on decisions that matter.</p></article>
          <article><span>03</span><strong>Existing stack</strong><p>Add only the integrations that improve confidence.</p></article>
          <article><span>04</span><strong>Measured learning</strong><p>Compare recommendation, decision, execution and result.</p></article>
        </div>
        <div className={styles.pilotActions}>
          <Link className={styles.primary} href="/for-clubs#demo">Design a 4–6 fixture pilot</Link>
          <Link className={styles.textLink} href="/app/demo">Try the guided product demo ↗</Link>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta}>
        <div>
          <span>AVELA</span>
          <h2>Turn the next fixture into a better decision — without replacing the stack you already use.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs#demo">Design your club pilot</Link>
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
