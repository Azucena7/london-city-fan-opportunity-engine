import { currentState } from "@/lib/data";
import { getCurrentMorningRead } from "@/lib/currentMorningRead";
import type { ProductOpportunity } from "@/lib/productOpportunity";
import styles from "./MorningCommercialRead.module.css";

function readAt(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  });
}

export function MorningCommercialRead({ live }: { live: ProductOpportunity | null }) {
  const lines = getCurrentMorningRead(live);

  return (
    <section className={styles.wrap} aria-labelledby="morning-read-title">
      <h2 id="morning-read-title">The read before the first meeting.</h2>
      <div className={styles.intro}>
        <p>
          The Morning Commercial Read, built from the latest refresh for the London City demonstration. Signals AVELA cannot read
          yet are marked, never filled in.
        </p>
      </div>
      <div className={styles.stage}>
        <article className={styles.sheet} data-ui aria-label="Morning Commercial Read">
          <header>
            <strong>Morning Commercial Read</strong>
            <span>{readAt(currentState.updated_at)}</span>
          </header>
          <ol className={styles.lines}>
            {lines.map((line) => (
              <li key={line.id} className={line.state === "live" ? styles[line.id] : styles.missing}>
                <span className={styles.label}>{line.label}</span>
                <div>
                  <strong>{line.headline}</strong>
                  {line.detail ? <small>{line.detail}</small> : null}
                </div>
                <span className={styles.state}>{line.state === "live" ? "Live" : "Not connected"}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
