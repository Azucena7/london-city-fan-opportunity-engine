import sourceHealth from "../../data/live/source-health.json";
import { calendar, currentState, eventLandscape, liveSignals } from "@/lib/data";
import { currentProductDate } from "@/lib/currentProductDate";
import { buildMorningRead } from "@/lib/morningRead";
import type { ProductOpportunity } from "@/lib/productOpportunity";
import styles from "./MorningCommercialRead.module.css";

function readAt(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
  });
}

export function MorningCommercialRead({ live }: { live: ProductOpportunity | null }) {
  const lines = buildMorningRead({
    today: currentProductDate(currentState.updated_at),
    calendar,
    events: eventLandscape.events,
    signals: liveSignals,
    weather: currentState.weather,
    sources: sourceHealth.sources,
    live
  });

  return (
    <section className={styles.wrap} aria-labelledby="morning-read-title">
      <div className={styles.intro}>
        <span>Morning Commercial Read</span>
        <h2 id="morning-read-title">What a commercial lead reads before the first meeting.</h2>
        <p>
          Built from the latest refresh for the London City demonstration, {readAt(currentState.updated_at)}. Signals AVELA
          cannot read yet are marked, never filled in.
        </p>
      </div>
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
    </section>
  );
}
