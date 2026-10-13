"use client";

import { useState } from "react";
import styles from "./CommercialDecisionDemo.module.css";

const scenarios = [
  {
    id: "travel-weather",
    tab: "Travel + rain",
    phase: "External pressure",
    trigger: "Attendance friction increased",
    delta: "↓ walk-up confidence · ↑ travel friction",
    confidence: "Medium-high",
    signals: [
      ["Weather", "Rain risk increases close to the fixture window"],
      ["Transport", "Rail works create extra travel friction"],
      ["Demand", "Family CRM segment remains reachable"]
    ],
    decision: "Move CRM earlier and make travel reassurance part of the proposition.",
    rationale: "The external context weakens the walk-up assumption. AVELA does not block the plan; it changes timing and message while keeping a reachable audience in play.",
    audience: "Recent family buyers",
    channel: "Earlier CRM + owned social",
    message: "Plan the journey · make the day easy",
    spend: "Hold broad paid",
    expected: "Protect conversion before travel friction becomes a late surprise"
  },
  {
    id: "competing-attention",
    tab: "TV overlap",
    phase: "Competing attention",
    trigger: "Attention window compressed",
    delta: "↓ strongest content window",
    confidence: "Medium",
    signals: [
      ["Football", "A high-interest televised fixture overlaps the strongest send window"],
      ["City", "No major local event adds incremental footfall"],
      ["Demand", "Warm CRM segments still show match interest"]
    ],
    decision: "Shift campaign timing and concentrate on high-intent audiences.",
    rationale: "The fixture is still viable, but competing football changes when the message is most likely to earn attention. AVELA moves the timing rather than treating the overlap as a hard blocker.",
    audience: "Warm CRM segments",
    channel: "Owned first",
    message: "Make the match part of the day",
    spend: "Targeted only",
    expected: "Avoid paying to compete in the weakest attention window"
  },
  {
    id: "family-window",
    tab: "Family window",
    phase: "Opportunity strengthens",
    trigger: "Family context improved",
    delta: "↑ proposition fit · no major conflict",
    confidence: "High",
    signals: [
      ["Calendar", "School holiday improves family-day flexibility"],
      ["City", "No major competing event in the key window"],
      ["Ticketing", "Recent family buyers remain addressable"]
    ],
    decision: "Prioritise a family return-attendance proposition.",
    rationale: "External context and club demand signals reinforce the same opportunity. AVELA prepares the audience, timing and proposition while rights and execution checks remain separate.",
    audience: "Recent family buyers",
    channel: "CRM + owned social",
    message: "Come back together",
    spend: "Scale selectively",
    expected: "Use a stronger family window without unnecessary discounting"
  }
] as const;

export function CommercialDecisionDemo() {
  const [activeId, setActiveId] = useState<(typeof scenarios)[number]["id"]>("travel-weather");
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0];

  return (
    <section className={styles.wrap} aria-labelledby="decision-demo-title">
      <div className={styles.intro}>
        <span>Try the opportunity engine</span>
        <h2 id="decision-demo-title">Change the outside context. Watch the matchday decision change.</h2>
        <p>
          This is an illustrative simulation using synthetic context. AVELA treats a fixture as part of a wider city, travel, football and audience environment — not as an isolated campaign brief.
        </p>
      </div>

      <div className={styles.fixtureStrip} aria-label="Illustrative match state">
        <div><span>Fixture</span><strong>Home match · 18 Oct</strong></div>
        <div><span>Objective</span><strong>Attendance + repeat visit</strong></div>
        <div><span>Decision window</span><strong>T−12 days</strong></div>
        <div className={styles.liveState}><i /> <strong>Synthetic context stream</strong></div>
      </div>

      <div className={styles.scenarioTabs} role="tablist" aria-label="Change external match context">
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
            <span>Home fixture · Opportunity Engine</span>
            <strong>External context → matchday decision</strong>
          </div>
          <i>ILLUSTRATIVE</i>
        </div>

        <div className={styles.interactiveGrid}>
          <div className={styles.signalColumn}>
            <span className={styles.columnLabel}>Signals AVELA is combining</span>
            {active.signals.map(([label, signal], index) => (
              <article key={label}>
                <span>{String(index + 1).padStart(2, "0")} · {label}</span>
                <strong>{signal}</strong>
              </article>
            ))}
          </div>

          <div className={styles.decisionCore} aria-hidden="true">
            <span>Signals</span>
            <i>→</i>
            <strong>AVELA</strong>
            <i>→</i>
            <span>Move</span>
          </div>

          <div className={styles.recommendation}>
            <span>Prepared matchday move</span>
            <h3>{active.decision}</h3>
            <p className={styles.rationale}>{active.rationale}</p>
            <div className={styles.playGrid}>
              <div><span>Audience</span><strong>{active.audience}</strong></div>
              <div><span>Channel</span><strong>{active.channel}</strong></div>
              <div><span>Message</span><strong>{active.message}</strong></div>
              <div><span>Spend posture</span><strong>{active.spend}</strong></div>
            </div>
            <div className={styles.expected}>
              <span>Why this move now</span>
              <strong>{active.expected}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>External signal</span><i>→</i><span>Club context</span><i>→</i><span>Opportunity / pressure</span><i>→</i><strong>Prepared decision</strong>
      </div>
    </section>
  );
}
