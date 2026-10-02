"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./DemoTour.module.css";

type Props = {
  fixtureId: string;
  fixtureLabel: string;
  timingLabel: string;
  opportunity: string;
  whyNow: string;
  confidence: string;
  signals: number;
  nextAction: string;
  campaignTitle: string;
  campaignObjective: string;
  campaignAudience: string;
};

const steps = [
  { id: "detect", label: "Fixture detected" },
  { id: "decide", label: "Engine recommends" },
  { id: "build", label: "Campaign built" },
  { id: "launch", label: "Review & launch" }
] as const;

export function DemoTour(props: Props) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <section className={styles.wrap}>
      <header className={styles.hero}>
        <div>
          <span>3-minute guided demo</span>
          <h1>See the club workflow from fixture to campaign.</h1>
          <p>This walkthrough uses the same live product data as the club workspace. Nothing here is a separate mock dashboard.</p>
        </div>
        <Link href={props.fixtureId ? `/app/matches/${props.fixtureId}` : "/app/matches"}>Open full product →</Link>
      </header>

      <div className={styles.progress} aria-label="Demo progress">
        {steps.map((item, index) => (
          <button key={item.id} type="button" className={index === step ? styles.activeStep : index < step ? styles.doneStep : ""} onClick={() => setStep(index)}>
            <span>{index < step ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        <div className={styles.stageMeta}>
          <span>Step {step + 1} of {steps.length}</span>
          <strong>{current.label}</strong>
        </div>

        {step === 0 ? (
          <div className={styles.panelGrid}>
            <article className={styles.mainCard}>
              <span>{props.timingLabel}</span>
              <h2>{props.fixtureLabel}</h2>
              <p>The fixture calendar starts the work automatically. The club does not need to create a project or campaign first.</p>
            </article>
            <article className={styles.sideCard}>
              <span>What the engine sees</span>
              <strong>{props.signals} sourced signals</strong>
              <p>Fixture context, demand, club activity and available audience evidence are read before a recommendation is surfaced.</p>
            </article>
          </div>
        ) : null}

        {step === 1 ? (
          <div className={styles.panelGrid}>
            <article className={styles.mainCard}>
              <span>Recommended opportunity</span>
              <h2>{props.opportunity}</h2>
              <p>{props.whyNow}</p>
            </article>
            <article className={styles.sideCard}>
              <span>Confidence</span>
              <strong>{props.confidence}</strong>
              <p>{props.signals} signals support the recommendation. Evidence can be inspected or excluded before the club acts.</p>
            </article>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={styles.campaign}>
            <div className={styles.campaignLead}>
              <span>Proposed campaign</span>
              <h2>{props.campaignTitle}</h2>
              <p>{props.campaignObjective}</p>
            </div>
            <div className={styles.recipe}>
              <article><span>Audience</span><strong>{props.campaignAudience}</strong></article>
              <article><span>Content</span><strong>Email + vertical video + carousel</strong></article>
              <article><span>Channels</span><strong>CRM + Instagram + Facebook + paid social</strong></article>
              <article><span>Automation</span><strong>Follow-up flow + scheduling</strong></article>
            </div>
            <p className={styles.note}>The full builder lets the club remove items, add variants and see credit cost plus campaign coverage change in real time.</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className={styles.panelGrid}>
            <article className={styles.mainCard}>
              <span>Next action</span>
              <h2>{props.nextAction}</h2>
              <p>Before launch, the club sees approvals, credit budget, missing channels and what has been removed from the recommended scope.</p>
              <Link href={props.fixtureId ? `/app/matches/${props.fixtureId}#campaign` : "/app/matches"}>Open campaign builder →</Link>
            </article>
            <article className={styles.sideCard}>
              <span>Launch principle</span>
              <strong>Review first. Execute second.</strong>
              <p>Connected channels can eventually publish or send directly. Until then, unsupported actions remain explicit handoffs rather than simulated execution.</p>
            </article>
          </div>
        ) : null}

        <div className={styles.controls}>
          <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>← Back</button>
          {step < steps.length - 1 ? (
            <button type="button" className={styles.primary} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Continue →</button>
          ) : (
            <Link className={styles.primary} href={props.fixtureId ? `/app/matches/${props.fixtureId}` : "/app/matches"}>Explore the product →</Link>
          )}
        </div>
      </div>
    </section>
  );
}
