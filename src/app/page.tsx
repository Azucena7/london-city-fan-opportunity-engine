import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { OpportunityEngineStage } from "@/components/OpportunityEngineStage";
import { CommercialEcosystem } from "@/components/CommercialEcosystem";
import { CommercialDecisionDemo } from "@/components/CommercialDecisionDemo";
import { CommercialFAQ } from "@/components/CommercialFAQ";
import { MorningCommercialRead } from "@/components/MorningCommercialRead";
import { EngineUseCases, HowTheEngineWorks } from "@/components/EngineStory";
import { HomePromoVideo } from "@/components/HomePromoVideo";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { decisionValidation } from "@/lib/data";
import ed from "@/components/editorial.module.css";
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
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />

      <section className={`${ed.board} ${styles.board}`} aria-labelledby="home-title">
        <div className={`${ed.titleTile} ${styles.titleTile}`}>
          <ul className={ed.tileMeta} aria-label="Built for">
            <li>Marketing</li>
            <li>Commercial & partnerships</li>
            <li>Fan engagement</li>
          </ul>
          <h1 id="home-title">See what could change the match.</h1>
        </div>
        <div className={`${ed.leadTile} ${styles.leadTile}`}>
          <p>
            <strong>The Opportunity Engine for football club marketing & commercial teams.</strong> AVELA connects what is happening
            outside the club with demand, rights and availability inside it — then shows what changed, why it matters and what move is
            worth preparing.
          </p>
          <Link className={ed.lightButton} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=hero">See the London City example</Link>
        </div>
        <div className={`${ed.accentTile} ${styles.pilotTile}`}>
          <p>Prove it on 4–6 of your own fixtures, with the systems you already use.</p>
          <Link className={ed.inkButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
        </div>
        <div className={styles.engineTile}>
          <OpportunityEngineStage live={live} />
        </div>
      </section>

      <HomePromoVideo />

      <section className={styles.proof} aria-labelledby="proof-title">
        <h2 id="proof-title">Hypothesis first. Announcement after.</h2>
        <aside className={styles.sideNote}>
          <p>{proof.caveat.en}</p>
          <p>London City is an independent demonstration, not a customer: this is evidence of relevance. The club pilot is a separate test, on your own authorised data.</p>
        </aside>
        <table className={styles.proofTable}>
          <caption className={ed.visuallyHidden}>The London City hypothesis, in the order it happened</caption>
          <thead className={ed.visuallyHidden}>
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
        <p className={styles.proofCaveat}>Sequence, not cause: London City did not use AVELA, and the announcement was its own decision.</p>
        <div className={`${ed.actions} ${styles.proofActions}`}>
          <Link className={ed.coralButton} href="/case-study?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=proof&utm_content=london_city">See the evidence</Link>
          <Link className={ed.textLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=proof">Open London City Live ↗</Link>
        </div>
      </section>

      <MorningCommercialRead live={live} />

      <CommercialDecisionDemo />

      <HowTheEngineWorks />

      <EngineUseCases />

      <CommercialEcosystem />

      <section className={styles.pilot} aria-labelledby="pilot-title">
        <div className={styles.pilotField}>
          <h2 id="pilot-title">Prove it on <span className={ed.nowrap}>4–6 fixtures</span> first.</h2>
          <p>Start with one marketing/commercial workflow, a limited fixture window and the systems you already use. Our independent public demonstration shows how the decision changes across Brighton, Everton, Crystal Palace and Manchester City; your pilot uses your own authorised data before deeper integration is earned.</p>
          <Link className={ed.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=pilot_section#demo">Request a 4–6 fixture pilot</Link>
        </div>
        <div className={styles.termsField}>
          <dl className={styles.terms}>
            <div className={styles.leadTerm}><dt>4–6 fixtures</dt><dd>Use the real calendar.</dd></div>
            <div><dt>1–2 workflows</dt><dd>Focus on decisions that matter.</dd></div>
            <div><dt>Existing stack</dt><dd>Add only the integrations that improve confidence.</dd></div>
            <div><dt>Measured learning</dt><dd>Compare recommendation, decision, execution and result.</dd></div>
          </dl>
          <div className={styles.links}>
            <Link className={ed.textLink} href="/pilot?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=multi_cycle_proof">See the 4-cycle public demonstration ↗</Link>
            <Link className={ed.textLink} href="/app/demo?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=pilot_section">Try the guided product demo ↗</Link>
          </div>
        </div>
      </section>

      <CommercialFAQ />

      <section className={styles.finalCta} aria-labelledby="final-title">
        <h2 id="final-title">Better decisions, same stack.</h2>
        <div className={ed.actions}>
          <Link className={ed.coralButton} href="/for-clubs?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request your club pilot</Link>
          <Link className={ed.textLink} href="/live/london-city?utm_source=avela_home&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See a live fixture decision ↗</Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
