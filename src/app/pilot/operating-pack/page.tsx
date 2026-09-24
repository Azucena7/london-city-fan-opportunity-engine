import type { Metadata } from "next";
import Link from "next/link";
import { ProductJourneyNav } from "@/components/ProductJourneyNav";
import { crmTicketingReadiness } from "@/lib/data";
import styles from "./operating-pack.module.css";

export const metadata: Metadata = {
  title: "Pilot Operating Pack",
  description: "The practical onboarding, data, roles and weekly cadence for a 90-day Fan Growth Pilot."
};

const roles = [
  ["Club sponsor", "Owns the pilot outcome, removes blockers and approves material decisions."],
  ["CRM / marketing lead", "Owns audiences, campaign execution and channel coordination."],
  ["Ticketing / data lead", "Provides fixture, transaction, scan and product data."],
  ["Measurement lead", "Defines attribution, scorecards and post-match learning."]
];

const success = [
  "Every fixture has one explicit opportunity and decision owner.",
  "Every recommended action has a measurement plan before launch.",
  "Ticketing and CRM evidence can be joined at fixture and pseudonymous supporter level.",
  "Post-match learning changes at least one subsequent fixture decision.",
  "The club can explain what is measured, assumed and still missing."
];

export default function OperatingPackPage() {
  const ready = crmTicketingReadiness.coverage.filter((item) => item.state === "ready").length;
  const demo = crmTicketingReadiness.coverage.filter((item) => item.state === "demo").length;
  const requiresAccess = crmTicketingReadiness.coverage.filter((item) => item.state === "requires-access").length;

  return (
    <main className={`${styles.shell} productAppShell`}>
      <ProductJourneyNav active="pilot" />

      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>90-day pilot · operating pack</span>
          <h1>Turn the pilot proposition into an executable club workflow.</h1>
          <p>
            This is the operational layer behind the sales page: what we need in week zero, who owns what,
            how each fixture cycle runs and what evidence defines success.
          </p>
        </div>
        <aside className={styles.status}>
          <span>Current data-contract readiness</span>
          <strong>{ready} ready · {demo} demo · {requiresAccess} requires access</strong>
          <p>Based on the existing CRM/ticketing import contract, not on live club access.</p>
        </aside>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Week 0</span>
          <h2>Onboarding before the first fixture decision.</h2>
        </div>
        <div className={styles.steps}>
          <article><span>01</span><h3>Confirm scope</h3><p>Choose six home fixtures, primary commercial outcomes and named decision owners.</p></article>
          <article><span>02</span><h3>Connect minimum data</h3><p>Fixture keys, ticket transactions, scans, campaign identifiers and a pseudonymous supporter key.</p></article>
          <article><span>03</span><h3>Set measurement rules</h3><p>Agree attribution boundaries, privacy rules, baseline windows and what counts as a valid result.</p></article>
          <article><span>04</span><h3>Run the first dry cycle</h3><p>Generate one opportunity, review assumptions, test the action plan and confirm the post-match scorecard.</p></article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Minimum data contract</span>
          <h2>Start narrow. Make the gaps explicit.</h2>
          <p>{crmTicketingReadiness.headline.en}</p>
        </div>
        <div className={styles.coverage}>
          {crmTicketingReadiness.coverage.map((item) => (
            <article key={item.id}>
              <div className={styles.coverageTop}>
                <strong>{item.label.en}</strong>
                <span data-state={item.state}>{item.state}</span>
              </div>
              <p>{item.detail.en}</p>
            </article>
          ))}
        </div>
        <div className={styles.links}>
          <a href={crmTicketingReadiness.templateUrl}>CRM/ticketing import template</a>
          <a href={crmTicketingReadiness.schemaUrl}>Data contract schema</a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Club roles</span>
          <h2>The product needs named humans around the decision.</h2>
        </div>
        <div className={styles.roles}>
          {roles.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={styles.cycle}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Per-fixture cadence</span>
          <h2>One repeatable decision cycle.</h2>
        </div>
        <div className={styles.timeline}>
          <div><span>T-10 → T-7</span><strong>Discover</strong><p>Opportunity, audience hypothesis and evidence review.</p></div>
          <div><span>T-7 → T-3</span><strong>Decide</strong><p>Approve action, budget, owner, measurement and blockers.</p></div>
          <div><span>T-3 → Matchday</span><strong>Act</strong><p>Execute with campaign and fixture identifiers intact.</p></div>
          <div><span>T+1 → T+7</span><strong>Learn</strong><p>Close result, attribution, attendance and next-decision implications.</p></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.eyebrow}>Pilot success</span>
          <h2>Success is not “the dashboard looked useful”.</h2>
        </div>
        <div className={styles.success}>
          {success.map((item, index) => <article key={item}><span>0{index + 1}</span><strong>{item}</strong></article>)}
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}>Ready for a club conversation</span>
          <h2>The next step is to replace demo assumptions with one club&apos;s real fixture and fan data.</h2>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/pilot">Back to pilot proposition</Link>
          <Link className={styles.secondary} href="/brief">Open Morning Brief</Link>
        </div>
      </section>
    </main>
  );
}
