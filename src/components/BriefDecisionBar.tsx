"use client";

import { useEffect, useState, type MouseEvent } from "react";
import styles from "./BriefDecisionBar.module.css";

/**
 * Keeps the decision within reach on a long brief: once the summary at the top scrolls away, a
 * bar shows the decision state and open gates and links to the human decision. It hides again
 * while the summary or the decision section itself is on screen, so it never repeats them.
 * It only links: approving, modifying or holding is still recorded in the decision section.
 */
export function BriefDecisionBar({
  opponent,
  decisionState,
  gateCount
}: {
  opponent: string;
  decisionState: string;
  gateCount: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const summary = document.getElementById("decision");
    const decision = document.getElementById("human-decision")?.closest("details") ?? document.getElementById("human-decision");
    if (!summary || !decision) return;
    let frame = 0;
    // Measured on scroll rather than observed: a fast jump can skip past the summary without it
    // ever intersecting the viewport, and an observer would then never report a change.
    const measure = () => {
      frame = 0;
      const pastSummary = summary.getBoundingClientRect().bottom < 0;
      const box = decision.getBoundingClientRect();
      const decisionOnScreen = box.top < window.innerHeight && box.bottom > 0
        && (!(decision instanceof HTMLDetailsElement) || decision.open);
      setVisible(pastSummary && !decisionOnScreen);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    decision.addEventListener("toggle", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      decision.removeEventListener("toggle", schedule);
    };
  }, []);

  // A phase is a closed <details>; open it even when the hash is already the same.
  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    for (let panel = target.closest("details"); panel; panel = panel.parentElement?.closest("details") ?? null) panel.open = true;
    history.replaceState(null, "", "#" + id);
    target.scrollIntoView({ block: "start" });
  }

  const hold = decisionState === "HOLD";
  return (
    <aside className={styles.bar} aria-label="Decision bar" hidden={!visible}>
      <div className={styles.state}>
        <span>{opponent}</span>
        <strong data-hold={hold ? "true" : undefined}>{decisionState}</strong>
        <small>{gateCount ? `${gateCount} approval gate${gateCount === 1 ? "" : "s"} open` : "No approval gate open"}</small>
      </div>
      <div className={styles.actions}>
        <a href="#readiness" onClick={(event) => go(event, "readiness")}>Check feasibility</a>
        <a className={styles.primary} href="#human-decision" onClick={(event) => go(event, "human-decision")}>{hold ? "Review the hold →" : "Decide →"}</a>
      </div>
    </aside>
  );
}
