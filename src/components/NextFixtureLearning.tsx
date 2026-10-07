import Link from "next/link";
import styles from "./NextFixtureLearning.module.css";
import type { NextFixtureLearning as NextFixtureLearningModel } from "@/lib/learningRecommendation";

export function NextFixtureLearning({
  learning,
  nextFixtureId,
  nextFixtureLabel
}: {
  learning: NextFixtureLearningModel;
  nextFixtureId?: string;
  nextFixtureLabel?: string;
}) {
  return (
    <section className={styles.wrap} aria-label="Next fixture adjustment">
      <div className={styles.head}>
        <div>
          <span>Next fixture adjustment</span>
          <h2>Turn this evidence into one better decision.</h2>
          <p>{learning.rationale}</p>
        </div>
        <div className={styles.confidence}>
          <span>Learning confidence</span>
          <strong>{learning.confidence}</strong>
          <small>{learning.evidenceState} evidence</small>
        </div>
      </div>

      <div className={styles.learned}>
        <span>What AVELA learned</span>
        <strong>{learning.learned}</strong>
      </div>

      <div className={styles.actions}>
        <article>
          <span>Repeat</span>
          <strong>{learning.repeat}</strong>
        </article>
        <article>
          <span>Change</span>
          <strong>{learning.change}</strong>
        </article>
        <article>
          <span>Measure next</span>
          <strong>{learning.measure}</strong>
        </article>
      </div>

      <div className={styles.footer}>
        <p>No confidence uplift is applied automatically. The next fixture recommendation should only change when the new evidence is relevant and comparable.</p>
        {nextFixtureId ? <Link href={`/app/matches/${nextFixtureId}`}>Open {nextFixtureLabel ?? "next fixture"} →</Link> : null}
      </div>
    </section>
  );
}
