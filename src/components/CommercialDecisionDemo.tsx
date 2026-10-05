"use client";

import { useState } from "react";
import styles from "./CommercialDecisionDemo.module.css";

const scenarios = [
  {
    id: "soft-demand",
    tab: "Sales pace soft",
    phase: "Early fixture read",
    signals: [
      ["Ticketing", "Sales pace below the comparable home fixture"],
      ["CRM", "Family buyers from recent home matches are reachable"],
      ["Timing", "Weekend fixture leaves a strong family window"]
    ],
    decision: "Prioritise a family return-attendance campaign.",
    audience: "Recent family buyers",
    channel: "CRM + owned social",
    message: "Come back together",
    spend: "Hold broad paid"
  },
  {
    id: "local-collision",
    tab: "Local collision",
    phase: "Context shifts",
    signals: [
      ["City", "A competing local event compresses the afternoon window"],
      ["Interest", "Organic match interest is rising"],
      ["Capacity", "Paid media and creative capacity are limited"]
    ],
    decision: "Narrow the audience and move activity closer to high-intent segments.",
    audience: "Warm CRM segments",
    channel: "Owned first",
    message: "Make the match fit the day",
    spend: "Targeted only"
  },
  {
    id: "demand-rising",
    tab: "Demand rising",
    phase: "Demand strengthens",
    signals: [
      ["Ticketing", "Sales velocity improves materially"],
      ["Content", "Player-led creative is outperforming generic graphics"],
      ["Inventory", "Availability is tightening in priority areas"]
    ],
    decision: "Stop discount-led messaging and switch to urgency plus player-led creative.",
    audience: "High-intent + lookalikes",
    channel: "Player-led social + CRM",
    message: "Be there before it fills",
    spend: "Scale selectively"
  }
] as const;

export function CommercialDecisionDemo() {
  const [activeId, setActiveId] = useState<(typeof scenarios)[number]["id"]>("soft-demand");
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[0];

  return (
    <section className={styles.wrap} aria-labelledby="decision-demo-title">
      <div className={styles.intro}>
        <span>Try the matchday decision</span>
        <h2 id="decision-demo-title">Change the signal. Watch the marketing play change.</h2>
        <p>
          Illustrative simulation: choose what changes around the fixture. AVELA updates the recommended audience,
          channel, message and spend posture instead of treating every home match the same.
        </p>
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

      <div className={styles.interactiveStage} role="tabpanel">
        <div className={styles.fixtureHeader}>
          <div>
            <span>Home fixture · Marketing intelligence</span>
            <strong>Matchday growth decision</strong>
          </div>
          <i>LIVE SIMULATION</i>
        </div>

        <div className={styles.interactiveGrid}>
          <div className={styles.signalColumn}>
            <span className={styles.columnLabel}>What AVELA is reading</span>
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
            <span>Play</span>
          </div>

          <div className={styles.recommendation}>
            <span>Recommended marketing play</span>
            <h3>{active.decision}</h3>
            <div className={styles.playGrid}>
              <div><span>Audience</span><strong>{active.audience}</strong></div>
              <div><span>Channel</span><strong>{active.channel}</strong></div>
              <div><span>Message</span><strong>{active.message}</strong></div>
              <div><span>Spend posture</span><strong>{active.spend}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>Fixture</span><i>→</i><span>Signals</span><i>→</i><span>Audience + offer + channel</span><i>→</i><strong>Measured matchday learning</strong>
      </div>
    </section>
  );
}
