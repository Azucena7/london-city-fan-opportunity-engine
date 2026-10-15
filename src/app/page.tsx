import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { OpportunityEngineStage } from "@/components/OpportunityEngineStage";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { MorningCommercialRead } from "@/components/MorningCommercialRead";
import { EngineUseCases, HowTheEngineWorks } from "@/components/EngineStory";
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

// The commercial home is laid out like an edited report: one vertical axis at about 42% of the
// width carries every heading and text column, and sections change by whole fields of colour.
export default function Home() {
  const live = getCurrentProductOpportunity();
  const proof = decisionValidation.cases[0];

  return (
    <main className={styles.shell} data-surface="commercial-home">
      <MarketingNav variant="board" />

      <section className={styles.board} aria-labelledby="home-title">
        <div className={styles.titleTile}>
          <ul className={styles.audiences} aria-label="Built for">
            <li>Marketing</li>
            <li>Commercial & partnerships</li>
            <li>Fan engagement</li>
          </ul>
          <h1 id="home-title">See what could change the match.</h1>
        </div>
        <div className={styles.leadTile}>
          <p>
            <strong>The Opportunity Engine for football club marketing & commercial teams.</strong> AVELA connects what is happening
            outside the club with demand, rights and availability inside it — then shows what changed, why it matters and what move is
            worth preparing.
          </p>
          <Link className={styles.lightButton} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=hero">See the London City example</Link>
        </div>
        <div className={styles.pilotTile}>
          <p>Prove it on 4–6 of your own fixtures, with the systems you already use.</p>
          <Link className={styles.inkButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
        </div>
        <div className={styles.engineTile}>
          <OpportunityEngineStage live={live} />
        </div>
      </section>

      <section className={styles.proof} aria-labelledby="proof-title">
        <h2 id="proof-title">A time-stamped AVELA hypothesis. What London City announced next.</h2>
        <aside className={styles.sideNote}>
          <p>{proof.caveat.en}</p>
          <p>London City is an independent demonstration, not a customer: this is evidence of relevance. The club pilot is a separate test, on your own authorised data.</p>
        </aside>
        <table className={styles.proofTable}>
          <caption className={styles.visuallyHidden}>The London City hypothesis, in the order it happened</caption>
          <thead className={styles.visuallyHidden}>
            <tr><th scope="col">Date</th><th scope="col">Step</th><th scope="col">What</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{proof.liveValidation ? shortDate(proof.liveValidation.fixtureDate) : "Fixture"}</td>
              <th scope="row">Fixture + wider football</th>
              <td>{proof.title.en}</td>
            </tr>
            <tr>
              <td>{shortDate(proof.hypothesisGeneratedAt)}</td>
              <th scope="row">AVELA saw · time-stamped</th>
              <td>{proof.hypothesis.en}</td>
            </tr>
            <tr>
              <td>{shortDate(proof.observedAt)}</td>
              <th scope="row">London City later announced</th>
              <td>{proof.observedAction.en}</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.actions}>
          <Link className={styles.coralButton} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=london_city">See the evidence</Link>
          <Link className={styles.textLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=proof">Open London City Live ↗</Link>
        </div>
      </section>

      <MorningCommercialRead live={live} />

      <CommercialDecisionDemo />

      <HowTheEngineWorks />

      <EngineUseCases />

      <CommercialEcosystem />

      <section className={styles.pilot} aria-labelledby="pilot-title">
        <div className={styles.pilotField}>
          <h2 id="pilot-title">Prove AVELA on <span className={styles.nowrap}>4–6 fixtures</span> before you integrate more.</h2>
          <p>Start with one marketing/commercial workflow, a limited fixture window and the systems you already use. Our independent public demonstration shows how the decision changes across Brighton, Everton, Crystal Palace and Manchester City; your pilot uses your own authorised data before deeper integration is earned.</p>
          <Link className={styles.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=pilot_section#demo">Request a 4–6 fixture pilot</Link>
        </div>
        <div className={styles.termsField}>
          <dl className={styles.terms}>
            <div className={styles.leadTerm}><dt>4–6 fixtures</dt><dd>Use the real calendar.</dd></div>
            <div><dt>1–2 workflows</dt><dd>Focus on decisions that matter.</dd></div>
            <div><dt>Existing stack</dt><dd>Add only the integrations that improve confidence.</dd></div>
            <div><dt>Measured learning</dt><dd>Compare recommendation, decision, execution and result.</dd></div>
          </dl>
          <div className={styles.links}>
            <Link className={styles.textLink} href="/pilot?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">See the 4-cycle public demonstration ↗</Link>
            <Link className={styles.textLink} href="/app/demo?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=pilot_section">Try the guided product demo ↗</Link>
          </div>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta} aria-labelledby="final-title">
        <h2 id="final-title">Turn the next club opportunity into a better decision — without replacing the stack you already use.</h2>
        <div className={styles.actions}>
          <Link className={styles.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request your club pilot</Link>
          <Link className={styles.textLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See a live fixture decision ↗</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerColumns}>
          <p><strong>Product</strong> The Opportunity Engine for football club marketing & commercial teams.</p>
          <p><strong>Proof</strong> London City Live is an independent public case study.</p>
          <nav aria-label="Footer">
            <Link href="/for-clubs">For clubs</Link>
            <Link href="/pilot">Pilot</Link>
            <Link href="/case-study">Case study</Link>
            <Link href="/app/demo">Guided demo</Link>
          </nav>
        </div>
        <p className={styles.wordmark} aria-hidden="true">AVELA</p>
      </footer>
    </main>
  );
}
