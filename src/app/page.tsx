import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { CommercialSignalStage } from "@/components/CommercialSignalStage";
import { CommercialOperatingFlow } from "@/components/CommercialOperatingFlow";
import { CommercialMorningRead } from "@/components/CommercialMorningRead";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

export const metadata: Metadata = {
  title: "AVELA · The Opportunity Engine for Football Club Marketing & Commercial Teams",
  description:
    "AVELA connects external signals and club context to detect opportunities, attendance pressure and decision changes before matchday."
};

export default function Home() {
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav variant="dark" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>The opportunity engine for football club marketing & commercial teams</span>
          <h1>See what could change the match.</h1>
          <p className={styles.heroLead}>
            AVELA connects signals outside the club — weather, transport, city events, competing football and calendar moments — with demand, rights and availability inside it. Then it shows what changed, why it matters and what move is worth preparing.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=hero">See the London City example</Link>
            <Link className={styles.secondaryAction} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
          </div>
          <div className={styles.heroMeta}>
            <span><strong>Detect</strong> what the team is not watching</span>
            <span><strong>Interpret</strong> the impact on attendance</span>
            <span><strong>Discover</strong> opportunity windows</span>
            <span><strong>Prepare</strong> the next decision</span>
          </div>
          <div className={styles.heroProof} aria-label="AVELA opportunity loop">
            <div><span>01</span><strong>Signals</strong><small>Outside + inside the club</small></div>
            <i>→</i>
            <div><span>02</span><strong>Impact</strong><small>What actually changed</small></div>
            <i>→</i>
            <div><span>03</span><strong>Opportunity</strong><small>What is worth doing</small></div>
            <i>→</i>
            <div><span>04</span><strong>Learn</strong><small>What improves next time</small></div>
          </div>
        </div>
        <CommercialSignalStage />
      </section>

      <section className={styles.liveProof}>
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Why AVELA exists</span>
          <h2>The London City example came from connecting the context around the fixture.</h2>
          <p>
            AVELA identified a football-day opportunity by reading the fixture alongside the wider sporting schedule. The hypothesis was time-stamped before a comparable London City activation became public. It is evidence of relevance, not evidence that the club saw or used AVELA.
          </p>
          <div className={styles.proofPair}>
            <article><span>AVELA hypothesis</span><strong>{proof.hypothesis.en}</strong></article>
            <article><span>London City later announced</span><strong>{proof.observedAction.en}</strong></article>
          </div>
          <div className={styles.proofActions}>
            <Link className={styles.coralButton} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=london_city">See the evidence</Link>
            <Link className={styles.darkTextLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=proof">Open London City case ↗</Link>
          </div>
        </div>
        <div className={styles.livePanel}>
          <span>What the engine connected</span>
          <strong>Fixture + wider football context</strong>
          <div className={styles.liveDecision}>
            <span>Opportunity pattern</span>
            <h3>Extend the football experience instead of treating the home match as an isolated event.</h3>
          </div>
          <div className={styles.liveFacts}>
            <div><span>Signal</span><strong>17:00 home fixture</strong></div>
            <div><span>Context</span><strong>England v Spain later</strong></div>
            <div><span>Move</span><strong>Keep the football day going</strong></div>
          </div>
        </div>
      </section>

      <CommercialMorningRead />

      <CommercialDecisionDemo />

      <CommercialOperatingFlow />

      <CommercialEcosystem />

      <section className={styles.pilot}>
        <div>
          <span className={styles.kicker}>Prove the engine on real decisions</span>
          <h2>Start with 4–6 fixtures and test whether AVELA spots something useful earlier.</h2>
          <p>
            Use the real calendar and a bounded set of external and club signals. Measure whether AVELA identifies attendance pressure, opportunity windows or decision changes before the team would normally have connected them.
          </p>
        </div>
        <div className={styles.pilotSteps}>
          <article><span>01</span><strong>4–6 fixtures</strong><p>Real matchday windows.</p></article>
          <article><span>02</span><strong>External signals</strong><p>Weather, transport, events, football context.</p></article>
          <article><span>03</span><strong>Club context</strong><p>Demand, rights and availability where useful.</p></article>
          <article><span>04</span><strong>Measured decisions</strong><p>Signal → recommendation → action → result.</p></article>
        </div>
        <div className={styles.pilotActions}>
          <Link className={styles.primary} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=pilot_section#demo">Request a 4–6 fixture pilot</Link>
          <Link className={styles.textLink} href="/pilot?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">See the public demonstration ↗</Link>
          <Link className={styles.textLink} href="/app/demo?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=pilot_section">Open the product demo ↗</Link>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta}>
        <div>
          <span>AVELA</span>
          <h2>See the signal your team might otherwise miss — before it changes the matchday plan.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request your club pilot</Link>
          <Link className={styles.finalLink} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=final_cta">See the London City example ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>AVELA</strong>
        <span>The opportunity engine for football club marketing & commercial teams.</span>
        <span>London City is an independent public case study.</span>
      </footer>
    </main>
  );
}
