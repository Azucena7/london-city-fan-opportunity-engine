"use client";

import { useState } from "react";
import styles from "./CommercialDecisionDemo.module.css";

const scenarios = [
  {
    id: "soft-demand",
    tab: "Sales pace soft",
    phase: "Early fixture read",
    trigger: "Demand risk detected",
    delta: "↓ sales velocity vs comparable fixture",
    confidence: "High",
    signals: [
      ["Ticketing", "Sales pace below the comparable home fixture"],
      ["CRM", "Family buyers from recent home matches are reachable"],
      ["Timing", "Weekend fixture leaves a strong family window"]
    ],
    decision: "Prioritise a family return-attendance campaign.",
    rationale: "Demand is soft, but the club already has a reachable family audience and a fixture window that suits them. AVELA favours precision over broad paid reach.",
    audience: "Recent family buyers",
    channel: "CRM + owned social",
    message: "Come back together",
    spend: "Hold broad paid",
    expected: "Improve conversion without inflating acquisition cost"
  },
  {
    id: "local-collision",
    tab: "Local collision",
    phase: "Context shifts",
    trigger: "Attention window compressed",
    delta: "↓ usable matchday window",
    confidence: "Medium-high",
    signals: [
      ["City", "A competing local event compresses the afternoon window"],
      ["Interest", "Organic match interest is rising"],
      ["Capacity", "Paid media and creative capacity are limited"]
    ],
    decision: "Narrow the audience and move activity closer to high-intent segments.",
    rationale: "The fixture still has interest, but the wider day is more competitive and team capacity is constrained. AVELA protects effort by concentrating on warm audiences.",
    audience: "Warm CRM segments",
    channel: "Owned first",
    message: "Make the match fit the day",
    spend: "Targeted only",
    expected: "Preserve efficiency while reducing wasted reach"
  },
  {
    id: "demand-rising",
    tab: "Demand rising",
    phase: "Demand strengthens",
    trigger: "Momentum detected",
    delta: "↑ sales velocity + content response",
    confidence: "High",
    signals: [
      ["Ticketing", "Sales velocity improves materially"],
      ["Content", "Player-led creative is outperforming generic graphics"],
      ["Inventory", "Availability is tightening in priority areas"]
    ],
    decision: "Stop discount-led messaging and switch to urgency plus player-led creative.",
    rationale: "The fixture no longer needs a demand subsidy. AVELA shifts the play toward scarcity and the creative format already earning attention.",
    audience: "High-intent + lookalikes",
    channel: "Player-led social + CRM",
    message: "Be there before it fills",
    spend: "Scale selectively",
    expected: "Capture momentum without unnecessary discounting"
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
          This is an illustrative product simulation. AVELA reads the fixture as a moving situation, not a static campaign brief.
          Change the context and the recommended audience, channel, message and spend posture change with it.
        </p>
      </div>

      <div className={styles.fixtureStrip} aria-label="Illustrative match state">
        <div><span>Fixture</span><strong>Home match · 18 Oct</strong></div>
        <div><span>Objective</span><strong>Attendance + repeat visit</strong></div>
        <div><span>Decision window</span><strong>T−12 days</strong></div>
        <div className={styles.liveState}><i /> <strong>Monitoring live context</strong></div>
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
            <span>Home fixture · Decision orchestration</span>
            <strong>Marketing & commercial decision</strong>
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

      <div className={styles.footer}>
        <span>Fixture</span><i>→</i><span>Signals</span><i>→</i><span>Audience + offer + channel</span><i>→</i><strong>Measured matchday learning</strong>
      </div>
    </section>
  );
}
