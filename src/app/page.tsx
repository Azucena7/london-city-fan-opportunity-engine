import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { OpportunityEngineStage } from "@/components/OpportunityEngineStage";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import styles from "./commercial-home.module.css";

export const metadata: Metadata = {
  title: "The Opportunity Engine for Football Club Marketing & Commercial Teams",
  description:
    "AVELA reads what is changing around each match and connects it with demand, rights and availability inside the club — then shows what changed, why it matters and what move is worth preparing."
};

function shortDate(value: string) {
  return new Date(value.length === 10 ? `${value}T12:00:00Z` : value).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell}>
      <MarketingNav variant="dark" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div>
            <span className={styles.eyebrow}>The Opportunity Engine for football club marketing & commercial teams</span>
            <h1>See what could change the match.</h1>
          </div>
          <div className={styles.heroAside}>
            <p className={styles.heroLead}>
              AVELA connects what is happening outside the club with demand, rights and availability inside it — then shows what changed, why it matters and what move is worth preparing.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primary} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=hero">See the London City example</Link>
              <Link className={styles.secondaryAction} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
            </div>
            <div className={styles.heroMeta}>
              <span><strong>For:</strong> Marketing</span>
              <span>Commercial & partnerships</span>
              <span>Fan engagement</span>
            </div>
          </div>
        </div>
        <OpportunityEngineStage live={live} />
      </section>

      <section className={styles.liveProof} aria-labelledby="proof-title">
        <div className={styles.liveCopy}>
          <span className={styles.kicker}>Proof in public · London City</span>
          <h2 id="proof-title">A time-stamped AVELA hypothesis. What London City announced next.</h2>
          <p>{proof.caveat.en} London City is an independent demonstration, not a customer: this is evidence of relevance. The club pilot is a separate test, on your own authorised data.</p>
        </div>
        <ol className={styles.proofFlow}>
          <li>
            <span>Fixture + wider football{proof.liveValidation ? ` · ${shortDate(proof.liveValidation.fixtureDate)}` : ""}</span>
            <strong>{proof.title.en}</strong>
          </li>
          <li>
            <span>AVELA saw · time-stamped {shortDate(proof.hypothesisGeneratedAt)}</span>
            <strong>{proof.hypothesis.en}</strong>
          </li>
          <li>
            <span>London City later announced · {shortDate(proof.observedAt)}</span>
            <strong>{proof.observedAction.en}</strong>
          </li>
        </ol>
        <div className={styles.proofActions}>
          <Link className={styles.coralButton} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=london_city">See the evidence</Link>
          <Link className={styles.darkTextLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=proof">Open London City Live ↗</Link>
        </div>
      </section>

      <CommercialDecisionDemo />

      <CommercialEcosystem />

      <section className={styles.pilot}>
        <div>
          <span className={styles.kicker}>Start with the marketing team</span>
          <h2>Prove AVELA on 4–6 fixtures before you integrate more.</h2>
          <p>Start with one marketing/commercial workflow, a limited fixture window and the systems you already use. Our independent public demonstration shows how the decision changes across Brighton, Everton, Crystal Palace and Manchester City; your pilot uses your own authorised data before deeper integration is earned.</p>
        </div>
        <div className={styles.pilotSteps}>
          <article><span>01</span><strong>4–6 fixtures</strong><p>Use the real calendar.</p></article>
          <article><span>02</span><strong>1–2 workflows</strong><p>Focus on decisions that matter.</p></article>
          <article><span>03</span><strong>Existing stack</strong><p>Add only the integrations that improve confidence.</p></article>
          <article><span>04</span><strong>Measured learning</strong><p>Compare recommendation, decision, execution and result.</p></article>
        </div>
        <div className={styles.pilotActions}>
          <Link className={styles.primary} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=pilot_section#demo">Request a 4–6 fixture pilot</Link>
          <Link className={styles.textLink} href="/pilot?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">See the 4-cycle public demonstration ↗</Link>
          <Link className={styles.textLink} href="/app/demo?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=pilot_section">Try the guided product demo ↗</Link>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta}>
        <div>
          <span>AVELA</span>
          <h2>Turn the next club opportunity into a better decision — without replacing the stack you already use.</h2>
        </div>
        <div>
          <Link className={styles.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request your club pilot</Link>
          <Link className={styles.finalLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See a live fixture decision ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <strong>AVELA</strong>
        <span>The Opportunity Engine for football club marketing & commercial teams.</span>
        <span>London City Live is an independent public case study.</span>
      </footer>
    </main>
  );
}
