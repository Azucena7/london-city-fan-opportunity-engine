"use client";

import { useState } from "react";
import styles from "./CommercialDecisionDemo.module.css";

// Each scenario starts from something outside the club. Internal context then validates
// whether it is worth acting on. Illustrative only: no club data sits behind these lines.
const scenarios = [
  {
    id: "competing-kickoff",
    tab: "Competing kick-off",
    phase: "Competing football",
    trigger: "A nearby Premier League match now kicks off 30 minutes earlier",
    delta: "↓ usable family window",
    confidence: "Medium-high",
    signals: [
      ["Competing football", "A London Premier League kick-off moves into the same afternoon window"],
      ["CRM", "Family buyers from recent home matches are reachable"],
      ["Calendar", "Weekend fixture with no school-day clash"]
    ],
    decision: "Re-invite recent family buyers early, before the clash fills their afternoon.",
    rationale: "The clash compresses the day, not the club's appeal. AVELA moves the ask earlier and concentrates it on people who already came, instead of buying broad reach against a bigger fixture.",
    audience: "Recent family buyers",
    channel: "CRM + owned social",
    message: "Make our match your afternoon",
    spend: "Hold broad paid",
    expected: "Protect attendance without paying to compete for the same attention"
  },
  {
    id: "rail-disruption",
    tab: "Rail disruption",
    phase: "Transport",
    trigger: "Planned engineering works close the main rail line on matchday",
    delta: "↓ easy routes to the stadium",
    confidence: "High",
    signals: [
      ["Transport", "Rail replacement buses on the line most fans use"],
      ["Ticketing", "Many recent buyers travel from areas served by that line"],
      ["Rights", "The travel partner has unused matchday activation rights"]
    ],
    decision: "Send a travel plan with the reminder and activate the travel partner.",
    rationale: "The risk is not interest but friction. AVELA turns the disruption into a useful message and a partner moment the contract already allows.",
    audience: "Ticket holders on the affected line",
    channel: "CRM + partner channels",
    message: "Here is the easiest way in",
    spend: "No paid spend",
    expected: "Reduce no-shows and deliver a partner obligation at the same time"
  },
  {
    id: "broadcast-pick",
    tab: "Broadcast pick",
    phase: "Broadcast window",
    trigger: "The match is picked for live TV",
    delta: "↑ reach · ↓ reason to attend",
    confidence: "Medium",
    signals: [
      ["Broadcast", "Live TV pick confirmed for the fixture"],
      ["Content", "Player-led clips are outperforming generic graphics"],
      ["Inventory", "Seats remain in family areas"]
    ],
    decision: "Sell what the stadium adds that the broadcast cannot, with player-led creative.",
    rationale: "Broadcast exposure helps the sponsor story but gives undecided fans a reason to stay home. AVELA shifts the message to the in-stadium experience and uses the format already earning attention.",
    audience: "Warm, undecided local fans",
    channel: "Player-led social + CRM",
    message: "Be there, not just watching",
    spend: "Targeted only",
    expected: "Keep the TV pick from cannibalising the gate"
  }
] as const;

export function CommercialDecisionDemo() {
  const [activeId, setActiveId] = useState<(typeof scenarios)[number]["id"]>("competing-kickoff");
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0];

  return (
    <section className={styles.wrap} aria-labelledby="decision-demo-title">
      <div className={styles.intro}>
        <h2 id="decision-demo-title">Change what happens around the match. Watch the plan change.</h2>
        <p>
          Try it: change the context. This is an illustrative product simulation. Each scenario starts outside the club; internal context then decides
          whether it is worth acting on. Change the context and the audience, channel, message and spend posture change with it.
        </p>
      </div>

      <div className={styles.product} data-ui>
      <div className={styles.fixtureStrip} aria-label="Illustrative match state">
        <div><span>Fixture</span><strong>Home match · 18 Oct</strong></div>
        <div><span>Objective</span><strong>Attendance + repeat visit</strong></div>
        <div><span>Decision window</span><strong>T−12 days</strong></div>
        <div className={styles.liveState}><i /> <strong>Illustrative fixture</strong></div>
      </div>

      <div className={styles.scenarioTabs} role="tablist" aria-label="Change match context">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            role="tab"
            aria-selected={active.id === scenario.id}
            className={active.id === scenario.id ? styles.activeTab : ""}
            onClick={() => setActiveId(scenario.id)}
          >
            <span>{scenario.phase}</span>
            <strong>{scenario.tab}</strong>
          </button>
        ))}
      </div>

      <div className={styles.changeBanner} aria-live="polite">
        <div>
          <span>What changed</span>
          <strong>{active.trigger}</strong>
        </div>
        <div className={styles.delta}>{active.delta}</div>
        <div>
          <span>Decision confidence</span>
          <strong>{active.confidence}</strong>
        </div>
      </div>

      <div className={styles.interactiveStage} role="tabpanel">
        <div className={styles.fixtureHeader}>
          <div>
            <span>Home fixture · Illustrative simulation</span>
            <strong>Marketing & commercial decision</strong>
          </div>
          <i>SIMULATION</i>
        </div>

        <div className={styles.interactiveGrid}>
          <div className={styles.signalColumn}>
            <span className={styles.columnLabel}>What AVELA is reading</span>
            {active.signals.map(([label, signal]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{signal}</strong>
              </article>
            ))}
          </div>

          <div className={styles.decisionCore} aria-hidden="true">
            <span>Signals</span>
            <i>→</i>
            <strong>AVELA</strong>
            <i>→</i>
            <span>Play</span>
          </div>

          <div className={styles.recommendation}>
            <span>Recommended marketing play</span>
            <h3>{active.decision}</h3>
            <p className={styles.rationale}>{active.rationale}</p>
            <div className={styles.playGrid}>
              <div><span>Audience</span><strong>{active.audience}</strong></div>
              <div><span>Channel</span><strong>{active.channel}</strong></div>
              <div><span>Message</span><strong>{active.message}</strong></div>
              <div><span>Spend posture</span><strong>{active.spend}</strong></div>
            </div>
            <div className={styles.expected}>
              <span>Why this play now</span>
              <strong>{active.expected}</strong>
            </div>
          </div>
        </div>
      </div>

      </div>

      <div className={styles.footer}>
        <span>Signal</span><i>→</i><span>Impact</span><i>→</i><span>Prepared move</span><i>→</i><strong>Measured matchday learning</strong>
      </div>
    </section>
  );
}
