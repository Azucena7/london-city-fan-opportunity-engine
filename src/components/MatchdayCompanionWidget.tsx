import Link from "next/link";
import { mobilityPartnership } from "@/lib/data";
import { mobilityProviderReadiness, summariseMobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";
import styles from "./MatchdayCompanionWidget.module.css";

export function MatchdayCompanionWidget({
  fixtureId,
  fixtureLabel,
  venue
}: {
  fixtureId: string;
  fixtureLabel: string;
  venue: string;
}) {
  const pilot = mobilityPartnership.pilots.find((item) => item.fixtureId === fixtureId) ?? null;
  const corridors = [...mobilityPartnership.corridors]
    .sort((a, b) => (b.travelFriction + b.territoryOpportunity) - (a.travelFriction + a.territoryOpportunity))
    .slice(0, 3);
  const maxFriction = corridors[0]?.travelFriction ?? null;
  const state = pilot ? "Pilot candidate" : "Monitor";
  const providerSummary = summariseMobilityProviderReadiness();

  return (
    <section className={styles.shell} aria-label="Matchday Companion">
      <div className={styles.head}>
        <div>
          <span>Matchday Companion · fan utility</span>
          <h2>Could travel friction change this matchday decision?</h2>
          <p>AVELA turns access, transport, weather and disruption context into a supporter-service decision — without pretending modelled routes are live travel data.</p>
        </div>
        <div className={styles.state} data-live={providerSummary.state === "live" ? "true" : "false"}>
          <span>Journey layer</span>
          <strong>{state}</strong>
          <small>{providerSummary.configured}/{providerSummary.total} provider layers configured · {providerSummary.state.replace("-", " ")}</small>
        </div>
      </div>

      <div className={styles.summary}>
        <article>
          <span>Fixture</span>
          <strong>{fixtureLabel}</strong>
          <small>{venue}</small>
        </article>
        <article>
          <span>Travel friction</span>
          <strong>{maxFriction !== null ? maxFriction + "/100" : "—"}</strong>
          <small>Highest modelled corridor · planning signal only</small>
        </article>
        <article>
          <span>Recommended service</span>
          <strong>Publish a matchday journey surface</strong>
          <small>Then escalate messaging only if live disruption becomes material.</small>
        </article>
      </div>

      <div className={styles.corridors}>
        <div className={styles.corridorHead}>
          <span>Representative corridors</span>
          <small>Modelled, aggregate and privacy-safe</small>
        </div>
        {corridors.map((corridor) => (
          <article key={corridor.id}>
            <div>
              <strong>{corridor.label.en}</strong>
              <small>{corridor.representativeOrigins.join(" · ")}</small>
            </div>
            <div className={styles.score}>
              <span>Friction</span>
              <b>{corridor.travelFriction}</b>
            </div>
            <p>{corridor.note.en}</p>
          </article>
        ))}
      </div>

      <div className={styles.providers}>
        {mobilityProviderReadiness.map((provider) => (
          <article key={provider.id} data-state={provider.state}>
            <span>{provider.label}</span>
            <strong>{provider.state.replace("-", " ")}</strong>
            <small>{provider.provider}</small>
          </article>
        ))}
      </div>

      <div className={styles.actions}>
        <div>
          <span>Next product step</span>
          <strong>Connect one authorised journey / traffic provider, preserve source timestamps, then let AVELA decide when travel deserves communication.</strong>
        </div>
        <Link href={"/matchday/" + fixtureId}>Preview fan utility →</Link>
      </div>
    </section>
  );
}
