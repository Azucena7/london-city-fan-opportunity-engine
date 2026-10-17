import type { ProductOpportunity } from "@/lib/productOpportunity";
import styles from "./FixtureSignalStrip.module.css";

type Signal = ProductOpportunity["liveSignals"][number];

const STATE_LABEL: Record<Signal["state"], string> = {
  measured: "Measured",
  confirmed: "Confirmed",
  reported: "Reported",
  forecast: "Forecast",
  inferred: "Inferred",
  waiting: "Waiting"
};
const WEIGHT = { high: 0, medium: 1, low: 2 } as const;

function day(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** The signals behind this fixture, first and open: the most material ones with state, source and date. */
export function FixtureSignalStrip({ signals, limit = 4 }: { signals: Signal[]; limit?: number }) {
  const shown = [...signals]
    .sort((a, b) => WEIGHT[a.materiality] - WEIGHT[b.materiality] || b.observedAt.localeCompare(a.observedAt))
    .slice(0, limit);

  return (
    <section className={styles.strip} aria-labelledby="fixture-signals-title">
      <div className={styles.head}>
        <span className={styles.eyebrow}>Anticipate</span>
        <h2 id="fixture-signals-title">What changed around this fixture</h2>
        {signals.length ? <a href="#signals">All {signals.length} signals · exclude &amp; recalculate →</a> : null}
      </div>
      {shown.length ? (
        <ul className={styles.list}>
          {shown.map((signal) => (
            <li key={signal.id} data-materiality={signal.materiality}>
              <span className={styles.state}>{STATE_LABEL[signal.state]}</span>
              <strong>{signal.title}</strong>
              <small>
                <a href={signal.sourceUrl} target="_blank" rel="noreferrer">{signal.sourceName}</a>
                {day(signal.observedAt) ? <> · <time dateTime={signal.observedAt}>{day(signal.observedAt)}</time></> : null}
                {" · "}{signal.materiality} materiality
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No material signal has arrived for this fixture yet. The recommendation stands on the fixture context alone.</p>
      )}
    </section>
  );
}
