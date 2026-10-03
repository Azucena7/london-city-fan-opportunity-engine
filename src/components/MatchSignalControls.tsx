"use client";

import { useMemo, useState } from "react";
import styles from "./MatchSignalControls.module.css";

type Signal = {
  id: string;
  title: string;
  state: "measured" | "confirmed" | "reported" | "forecast" | "inferred" | "waiting";
  materiality: "high" | "medium" | "low";
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  lens?: string;
};

function isCoreEvidence(signal: Signal) {
  return signal.materiality === "high" && (signal.state === "measured" || signal.state === "confirmed");
}

function evidenceRole(signal: Signal) {
  if (isCoreEvidence(signal)) return "Core evidence";
  if (signal.materiality === "high") return "Material context";
  if (signal.materiality === "medium") return "Supporting evidence";
  return "Context only";
}

function confidence(active: Signal[]) {
  const strong = active.filter((signal) =>
    (signal.state === "measured" || signal.state === "confirmed") &&
    signal.materiality !== "low"
  ).length;
  if (strong >= 3) return "High";
  if (strong >= 2) return "Medium";
  return "Low";
}

export function MatchSignalControls({
  signals,
  baseRecommendation
}: {
  signals: Signal[];
  baseRecommendation: string;
}) {
  const [excluded, setExcluded] = useState<string[]>([]);

  const active = useMemo(
    () => signals.filter((signal) => !excluded.includes(signal.id)),
    [signals, excluded]
  );
  const activeMaterial = active.filter((signal) => signal.materiality !== "low");
  const changed = excluded.length > 0;
  const recommendationNeedsReview = activeMaterial.length === 0;
  const currentConfidence = confidence(active);
  const baseConfidence = confidence(signals);
  const excludedMaterial = signals.filter((signal) => excluded.includes(signal.id) && signal.materiality !== "low");
  const confidenceChanged = baseConfidence !== currentConfidence;

  function toggle(id: string) {
    const signal = signals.find((item) => item.id === id);
    if (!signal || isCoreEvidence(signal)) return;
    setExcluded((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id]
    );
  }

  return (
    <div className={styles.control}>
      <div className={styles.summary}>
        <div>
          <span>Signals used</span>
          <strong>{active.length} of {signals.length} active</strong>
        </div>
        <div>
          <span>Confidence with this selection</span>
          <strong>{currentConfidence}</strong>
        </div>
        <div>
          <span>Recommendation</span>
          <strong>{recommendationNeedsReview ? "Needs review" : changed ? "Maintained" : "Current engine plan"}</strong>
        </div>
        <div>
          <span>Scenario impact</span>
          <strong>{changed ? `${excludedMaterial.length} material excluded` : "Baseline"}</strong>
        </div>
      </div>

      {changed ? (
        <div className={recommendationNeedsReview ? styles.review : styles.maintained}>
          <strong>{recommendationNeedsReview ? "The play can no longer be supported by the remaining material signals." : "The recommended play is unchanged in this scenario."}</strong>
          <span>
            {recommendationNeedsReview
              ? "Restore material evidence or review the recommendation manually before approval."
              : confidenceChanged
                ? `Confidence changes from ${baseConfidence} to ${currentConfidence}. No source data has been changed.`
                : `Confidence remains ${currentConfidence}. No source data has been changed.`}
          </span>
        </div>
      ) : null}

      <div className={styles.list}>
        {signals.map((signal) => {
          const enabled = !excluded.includes(signal.id);
          const core = isCoreEvidence(signal);
          return (
            <article className={enabled ? styles.enabled : styles.disabled} key={signal.id}>
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={core}
                  onChange={() => toggle(signal.id)}
                  aria-label={core ? `${signal.title} is core evidence and cannot be excluded from this scenario` : `Include ${signal.title}`}
                />
                <span className={styles.switch} aria-hidden="true" />
                <div>
                  <span>{signal.lens ? `${signal.lens} · ` : ""}{signal.materiality} · {signal.state}</span>
                  <h3>{signal.title}</h3>
                  <div className={styles.signalMeta}>
                    <b>{evidenceRole(signal)}</b>
                    <b>Observed {new Date(signal.observedAt).toLocaleDateString("en-GB")}</b>
                    {core ? <b>Locked in scenario</b> : <b>{enabled ? "Included" : "Excluded temporarily"}</b>}
                  </div>
                </div>
              </label>
              <a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName} ↗</a>
            </article>
          );
        })}
      </div>

      <div className={styles.currentPlan}>
        <span>Plan being tested</span>
        <strong>{baseRecommendation}</strong>
      </div>

      {excluded.length ? (
        <button type="button" onClick={() => setExcluded([])}>Restore all signals</button>
      ) : null}

      <div className={styles.explain}>
        <strong>How recalculation works</strong>
        <p>AVELA recomputes this review scenario from the signals left active. High-materiality measured or confirmed evidence is treated as core evidence and stays locked. Other signals can be excluded temporarily to test whether the play still holds.</p>
      </div>

      <p className={styles.note}>
        Match-level scenario only. Excluding a signal here does not delete the source, edit the evidence register, change the saved Radar rank or authorise a campaign.
      </p>
    </div>
  );
}
