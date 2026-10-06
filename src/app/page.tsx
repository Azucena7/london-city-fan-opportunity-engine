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
  title: "The Decision Workspace for Football Club Marketing & Commercial Teams",
  description:
    "AVELA is the decision workspace for football club marketing and commercial teams, connecting fan, campaign, fixture, player, sponsor and operational context to the next best action."
};


export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Built for football club marketing & commercial teams</span>
          <h1>Read the signals.<br />Move the club.</h1>
          <p className={styles.heroLead}>
            AVELA helps marketing and commercial teams decide what to do next across fixtures, campaigns and commercial moments — joining fan demand, CRM, content, players, sponsors, rights, timing and delivery constraints in one operating view.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/live/london-city">See AVELA on a real fixture</Link>
            <Link className={styles.secondaryAction} href="/for-clubs#demo">Discuss a club pilot</Link>
          </div>
          <div className={styles.heroMeta}>
            <span><strong>For:</strong> Marketing</span>
            <span>CRM & fan engagement</span>
            <span>Sponsorship & commercial</span>
            <span>Content & matchday growth</span>
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

      <section className={styles.liveProof}>
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Proof in public</span>
          <h2>A time-stamped AVELA hypothesis. What London City announced next.</h2>
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

      <section className={styles.pilot}>
        <div>
          <span className={styles.kicker}>Start with the marketing team</span>
          <h2>Prove AVELA on 4–6 fixtures before you integrate more.</h2>
          <p>Start with one marketing/commercial workflow, a limited fixture window and the systems you already use. AVELA should earn deeper integration by improving decisions first.</p>
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
          <h2>Turn the next club opportunity into a better decision — without replacing the stack you already use.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs#demo">Design your club pilot</Link>
          <Link className={styles.finalLink} href="/live/london-city">See a live fixture decision ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>AVELA</strong>
        <span>The decision workspace for football club marketing & commercial teams.</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
