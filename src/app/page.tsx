import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { CommercialSignalStage } from "@/components/CommercialSignalStage";
import { CommercialOperatingFlow } from "@/components/CommercialOperatingFlow";
import { CommercialMorningRead } from "@/components/CommercialMorningRead";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

export const metadata: Metadata = {
  title: "The Decision Workspace for Football Club Marketing & Commercial Teams",
  description:
    "AVELA helps football club marketing and commercial teams see what needs attention, what can be monetised, what is at risk and what is ready to execute."
};

export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav variant="dark" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>For football club marketing & commercial teams</span>
          <h1>Read the signals.<br />Move the club.</h1>
          <p className={styles.heroLead}>
            AVELA shows you what needs attention now, what commercial opportunities are emerging, what obligations are at risk, and what is actually ready to execute — without replacing the systems your team already uses.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=hero">See a real AVELA decision</Link>
            <Link className={styles.secondaryAction} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
          </div>
          <div className={styles.heroMeta}>
            <span><strong>See</strong> what needs attention</span>
            <span><strong>Spot</strong> revenue opportunities</span>
            <span><strong>Protect</strong> partner delivery</span>
            <span><strong>Know</strong> what is ready to execute</span>
          </div>
          <div className={styles.heroProof} aria-label="AVELA operating loop">
            <div><span>01</span><strong>Read</strong><small>What changed</small></div>
            <i>→</i>
            <div><span>02</span><strong>Decide</strong><small>What matters now</small></div>
            <i>→</i>
            <div><span>03</span><strong>Move</strong><small>What is ready</small></div>
            <i>→</i>
            <div><span>04</span><strong>Learn</strong><small>What improves next</small></div>
          </div>
        </div>
        <CommercialSignalStage />
      </section>

      <CommercialMorningRead />

      <CommercialDecisionDemo />

      <CommercialOperatingFlow />

      <section className={styles.liveProof}>
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Proof in public</span>
          <h2>A time-stamped AVELA hypothesis. What London City announced next.</h2>
          <p>The Brighton hypothesis was time-stamped before a comparable London City activation became public. It is evidence of relevance, not evidence that the club saw or used AVELA. The club pilot is a separate test: multiple real decisions, authorised club data and pre-agreed measurement.</p>
          <div className={styles.proofPair}>
            <article><span>AVELA saw</span><strong>{proof.hypothesis.en}</strong></article>
            <article><span>London City later announced</span><strong>{proof.observedAction.en}</strong></article>
          </div>
          <div className={styles.proofActions}>
            <Link className={styles.coralButton} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=london_city">See the evidence</Link>
            <Link className={styles.darkTextLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=proof">Open London City Live ↗</Link>
          </div>
        </div>
        <div className={styles.livePanel}>
          <span>Current live case</span>
          <strong>{live?.fixture.opponent ?? "Next home fixture"}</strong>
          <div className={styles.liveDecision}>
            <span>What needs attention</span>
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
          <span className={styles.kicker}>Start small, prove value</span>
          <h2>Test whether AVELA improves the decisions your team already makes every week.</h2>
          <p>Start with 4–6 fixtures or a bounded commercial workflow. Use the systems you already have, measure whether AVELA shortens decision time, improves execution readiness and catches opportunities or risks earlier.</p>
        </div>
        <div className={styles.pilotSteps}>
          <article><span>01</span><strong>4–6 fixtures</strong><p>Use the real calendar.</p></article>
          <article><span>02</span><strong>1–2 workflows</strong><p>Focus on decisions that matter.</p></article>
          <article><span>03</span><strong>Existing stack</strong><p>Add only what improves confidence.</p></article>
          <article><span>04</span><strong>Measured learning</strong><p>Compare decision, execution and result.</p></article>
        </div>
        <div className={styles.pilotActions}>
          <Link className={styles.primary} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=pilot_section#demo">Request a 4–6 fixture pilot</Link>
          <Link className={styles.textLink} href="/pilot?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">See the public demonstration ↗</Link>
          <Link className={styles.textLink} href="/app/demo?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=pilot_section">Try the guided product demo ↗</Link>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta}>
        <div>
          <span>AVELA</span>
          <h2>Know what deserves attention, what can be monetised and what is ready to move.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request your club pilot</Link>
          <Link className={styles.finalLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See a live fixture decision ↗</Link>
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
