import sourceHealth from "../../data/live/source-health.json";
import { currentState } from "@/lib/data";
import { engineSignals } from "@/lib/engineSignals";
import type { ProductOpportunity } from "@/lib/productOpportunity";
import styles from "./OpportunityEngineStage.module.css";

function fixtureDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

// The hero visual: external signals flow into the engine, which returns the three things a
// commercial lead needs. Every line is read from the live case; nothing here is illustrative.
export function OpportunityEngineStage({ live }: { live: ProductOpportunity | null }) {
  const signals = engineSignals(sourceHealth);
  const weather = currentState.weather;
  const forecast =
    live && weather?.valid_for === live.fixture.date
      ? `${Math.round(weather.temperature_max)}° · ${weather.precipitation_probability_max}% rain risk`
      : null;
  const changed = live?.liveSignals.find((signal) => signal.materiality === "high") ?? live?.liveSignals[0];
  const liveCount = signals.filter((signal) => signal.state === "live").length;

  return (
    <figure className={styles.engine} aria-label="AVELA Opportunity Engine" data-ui>
      <figcaption className={styles.caption}>
        <span>AVELA Opportunity Engine</span>
        <strong>
          {live ? `${live.fixture.opponent} · Home · ${fixtureDate(live.fixture.date)} · ${live.timingLabel}` : "Next home fixture"}
        </strong>
      </figcaption>

      <ul className={styles.signals} aria-label="Signals around the match">
        {signals.map((signal) => (
          <li key={signal.id} className={signal.state === "live" ? styles.live : styles.pilot}>
            <i aria-hidden="true" />
            <div>
              <strong>{signal.label}</strong>
              <span>{signal.id === "weather" && forecast ? forecast : signal.detail}</span>
            </div>
            <small>{signal.state === "live" ? "Reading now" : "In a pilot"}</small>
          </li>
        ))}
      </ul>

      <ol className={styles.outputs} aria-label="What the engine returns">
        <li>
          <span>What changed</span>
          <strong>{changed?.title ?? "No material change detected yet."}</strong>
        </li>
        <li>
          <span>Why it matters</span>
          <strong>{live?.opportunity ?? "Review current evidence."}</strong>
        </li>
        <li className={styles.move}>
          <span>Prepared move</span>
          <strong>{live?.recommendedAction ?? "Hold until the evidence moves."}</strong>
        </li>
      </ol>

      <div className={styles.footnote}>
        <span>{liveCount} of {signals.length} signal families read live today · the rest connect in a club pilot</span>
        {live ? <span>Decision state: <b>{live.decisionState}</b></span> : null}
      </div>
    </figure>
  );
}
