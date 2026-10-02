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
};

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

  function toggle(id: string) {
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
      </div>

      {changed ? (
        <div className={recommendationNeedsReview ? styles.review : styles.maintained}>
          <strong>{recommendationNeedsReview ? "The plan can no longer be supported by the remaining material signals." : "The recommendation is unchanged."}</strong>
          <span>
            {recommendationNeedsReview
              ? "Re-enable a material signal or review the plan manually before approval."
              : `The same action remains supported, but confidence is now ${currentConfidence.toLowerCase()}.`}
          </span>
        </div>
      ) : null}

      <div className={styles.list}>
        {signals.map((signal) => {
          const enabled = !excluded.includes(signal.id);
          return (
            <article className={enabled ? styles.enabled : styles.disabled} key={signal.id}>
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggle(signal.id)}
                />
                <span className={styles.switch} aria-hidden="true" />
                <div>
                  <span>{signal.materiality} · {signal.state}</span>
                  <h3>{signal.title}</h3>
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

      <p className={styles.note}>
        Match-level review only. Excluding a signal here does not delete the source or change the underlying engine data.
      </p>
    </div>
  );
}
