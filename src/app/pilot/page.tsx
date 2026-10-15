import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import ed from "@/components/editorial.module.css";
import styles from "./pilot.module.css";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { calendar, currentState } from "@/lib/data";
import { currentProductDate } from "@/lib/currentProductDate";
import { CYCLE_STATE_KEY, PILOT_WINDOW, cycleStates } from "@/lib/pilotWindow";

export const metadata: Metadata = {
  title: "Club Pilot · The Opportunity Engine for Marketing & Commercial Teams",
  description: "A focused AVELA pilot for football club marketing and commercial teams: 4–6 fixtures or a bounded campaign window, one or two workflows and measurable decision learning."
};

const cycle = [
  ["Signal", "Read what is changing around each fixture and keep only the signals that could change a decision."],
  ["Prepared move", "Validate it against demand, rights and availability, then make the move, owner, blockers and measurement plan explicit."],
  ["Execute", "Run it through the club's existing tools with human approval and clear ownership."],
  ["Learn", "Compare recommendation, execution and outcome so the next read starts from what actually happened."]
];

const sources = [
  ["External signals", "Weather, city events, competing football, calendar moments and public news — read from day one."],
  ["Ticketing / CRM", "Demand, purchases, scans, contactability and repeat behaviour where authorised."],
  ["Marketing / content", "Campaign activity, channel response, social and web evidence already available."],
  ["Commercial context", "Sponsor rights, player assets, contracts, campaigns and priority moments."],
  ["Operational context", "Calendar pressure, availability, ownership, approvals and delivery capacity."]
];

// The pilot page, on the shared editorial system: a hero board, then sections that change by
// whole fields of colour. Cycle states come from the calendar (lib/pilotWindow), never from copy.
export default function PilotPage() {
  const live = getCurrentProductOpportunity();
  const states = cycleStates(calendar, currentProductDate(currentState.updated_at));

  return (
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />

      <header className={`${ed.board} ${styles.board}`}>
        <div className={`${ed.titleTile} ${styles.titleTile}`}>
          <p className={ed.tileMeta}>Focused club pilot · 4–6 fixtures or a bounded campaign window</p>
          <h1>Point the engine at 4–6 fixtures.</h1>
        </div>
        <div className={`${ed.leadTile} ${styles.leadTile}`}>
          <p>
            Test AVELA on one or two real marketing and commercial decisions using the stack the club already has.
            The pilot answers a simple question: does the Opportunity Engine surface the signals that matter early enough to change what the team prepares, executes and learns?
          </p>
          <Link className={ed.lightButton} href="/app/demo?utm_source=pilot&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=hero">Try the guided demo</Link>
        </div>
        <aside className={`${ed.accentTile} ${styles.buyingTile}`} aria-label="What the club is buying">
          <div>
            <p className={styles.buyingLabel}>What the club is buying</p>
            <p className={styles.buying}>A bounded decision test</p>
            <p className={styles.buyingScope}>4–6 fixtures or a campaign window · 1–2 workflows · one priority objective · pre-agreed measurement.</p>
          </div>
          <Link className={ed.inkButton} href="/for-clubs?utm_source=pilot&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=hero#demo">Request a club pilot</Link>
        </aside>
      </header>

      <section className={styles.outcomes} aria-label="What the pilot answers">
        <article><p>Decision quality</p><h2>What should we do next?</h2><p>Prioritise one action with the evidence, constraints and trade-offs visible.</p></article>
        <article><p>Execution fit</p><h2>Can the club actually do it?</h2><p>Make ownership, player/sponsor rights, timing and operational blockers explicit.</p></article>
        <article><p>Learning</p><h2>What changes next time?</h2><p>Keep the outcome with the decision so the next cycle starts smarter.</p></article>
      </section>

      <section className={styles.rhythm} aria-labelledby="rhythm-title">
        <h2 id="rhythm-title">One rhythm, four moments.</h2>
        <ol className={styles.moments}>
          {cycle.map(([title, body]) => (
            <li key={title}><h3>{title}</h3><p>{body}</p></li>
          ))}
        </ol>
      </section>

      <section className={styles.stack} aria-labelledby="stack-title">
        <h2 id="stack-title">Add only context that helps.</h2>
        <p className={styles.stackNote}><strong>Start with the current stack.</strong> No rip-and-replace programme is required. The pilot can begin with public context and the strongest authorised aggregates the club can provide.</p>
        <table className={styles.sources}>
          <caption className={ed.visuallyHidden}>Context a pilot can add</caption>
          <tbody>
            {sources.map(([name, detail]) => (
              <tr key={name}><th scope="row">{name}</th><td>{detail}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.window} aria-labelledby="window-title">
        <h2 id="window-title">Four cycles, four decisions.</h2>
        <aside className={styles.windowNote}>
          <p><strong>Public demonstration · London City (independent case)</strong></p>
          <p>This is how a bounded pilot becomes useful: not by repeating the same dashboard four times, but by testing whether AVELA adapts the decision as fixture context, evidence and commercial constraints change.</p>
          <p>The public London City case provides proof of method, not proof of club adoption. A real club pilot would replace public-only evidence with authorised club sources and pre-agreed success measures.</p>
        </aside>
        <ol className={styles.pilotWindow}>
          {PILOT_WINDOW.map((item) => (
            <li key={item.fixture} data-state={CYCLE_STATE_KEY[states[item.fixtureId]]}>
              <div className={styles.cycleHead}>
                <h3>{item.fixture}</h3>
                <span>{states[item.fixtureId]}</span>
              </div>
              <p className={styles.focus}>{item.focus}</p>
              <p>{item.decision}</p>
              <small>{item.evidence}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.week} aria-labelledby="week-title">
        <div className={styles.weekIntro}>
          <h2 id="week-title">A decision view, not a dashboard.</h2>
          <p>What a live cycle looks like. This example uses the same current match-plan state as the AVELA workspace. Commercial impact remains unfilled until the required audience and conversion evidence exists.</p>
        </div>
        <div className={styles.stage}>
          <dl className={styles.weekCard} data-ui aria-label="Current cycle">
            <div><dt>Opportunity</dt><dd>{live?.opportunityLabel ?? "Under review"}</dd></div>
            <div><dt>Next action</dt><dd>{live?.nextAction.label ?? "Pending current fixture"}</dd></div>
            <div><dt>Evidence</dt><dd>{live?.audience.value !== null && live?.audience.value !== undefined ? live.audience.value.toLocaleString("en-GB") + " measured" : "Requires club data"}</dd></div>
            <div><dt>Decision state</dt><dd>{live?.decisionState ?? "HOLD"}</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.paths} aria-labelledby="paths-title">
        <div className={styles.pathsIntro}>
          <h2 id="paths-title">You decide on AVELA too.</h2>
          <p>End of pilot. The pilot should create enough evidence to choose one of three paths — not automatically justify a bigger implementation.</p>
        </div>
        <ul className={styles.playbook}>
          <li><span>CONTINUE</span><p>Expand the workflows where AVELA clearly improves decision quality.</p></li>
          <li><span>ADJUST</span><p>Fix missing data, process or ownership before deeper integration.</p></li>
          <li><span>STOP</span><p>Do not scale the product if the decision improvement is not material.</p></li>
        </ul>
      </section>

      <section className={styles.cta} aria-labelledby="cta-title">
        <h2 id="cta-title">The detail lives one level deeper.</h2>
        <p>Want the operating detail? The Operating Pack covers onboarding, data contract, roles, privacy and measurement design. The guided demo shows the product flow in three minutes.</p>
        <div className={ed.actions}>
          <Link className={ed.coralButton} href="/for-clubs?utm_source=pilot&utm_medium=internal_cta&utm_campaign=club_pilot&utm_content=final_cta#demo">Request a club pilot</Link>
          <Link className={ed.textLink} href="/app/demo?utm_source=pilot&utm_medium=internal_cta&utm_campaign=guided_demo&utm_content=final_cta">Try the guided demo</Link>
          <Link className={ed.textLink} href="/pilot/operating-pack?utm_source=pilot&utm_medium=internal_cta&utm_campaign=operating_pack&utm_content=final_cta">Open the Operating Pack</Link>
          <Link className={ed.textLink} href="/live/london-city?utm_source=pilot&utm_medium=internal_cta&utm_campaign=live_case&utm_content=final_cta">See the public live case</Link>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
