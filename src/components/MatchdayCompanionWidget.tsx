import Link from "next/link";
import { mobilityPartnership } from "@/lib/data";
import { mobilityProviderReadiness, summariseMobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";
import { getMatchdayTerritoryContext } from "@/lib/matchdayTerritoryContext";
import { getMatchdayWeatherContext } from "@/lib/matchdayWeatherContext";
import { getMatchdayAttention } from "@/lib/matchdayDecisionAlert";
import styles from "./MatchdayCompanionWidget.module.css";

export function MatchdayCompanionWidget({
  fixtureId,
  fixtureLabel,
  venue,
  fixtureDate
}: {
  fixtureId: string;
  fixtureLabel: string;
  venue: string;
  fixtureDate: string;
}) {
  const pilot = mobilityPartnership.pilots.find((item) => item.fixtureId === fixtureId) ?? null;
  const corridors = [...mobilityPartnership.corridors]
    .sort((a, b) => (b.travelFriction + b.territoryOpportunity) - (a.travelFriction + a.territoryOpportunity))
    .slice(0, 3);
  const maxFriction = corridors[0]?.travelFriction ?? null;
  const state = pilot ? "Pilot candidate" : "Monitor";
  const providerSummary = summariseMobilityProviderReadiness();
  const territory = getMatchdayTerritoryContext();
  const weather = getMatchdayWeatherContext(fixtureId, fixtureDate);
  const attention = getMatchdayAttention(fixtureId, fixtureDate);

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

      {attention ? (
        <div className={styles.attention} data-level={attention.level}>
          <span>{attention.level === "inform" ? "MONITOR" : attention.level.toUpperCase()} · {attention.label}</span>
          <strong>{attention.title}</strong>
          <small>{attention.reason}</small>
        </div>
      ) : null}

      <div className={styles.weather} data-level={weather.materiality}>
        <div>
          <span>Live weather context</span>
          <strong>{weather.state === "forecast" ? (weather.precipitationProbability ?? "—") + "% rain · " + (weather.windKmh ?? "—") + " km/h wind" : "Waiting for operational forecast window"}</strong>
          <small>{weather.source ?? "Open-Meteo"}{weather.generatedAt ? " · updated " + new Date(weather.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</small>
        </div>
        <p>{weather.supporterAction}</p>
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

      <div className={styles.territory}>
        <div>
          <span>Territory intelligence</span>
          <strong>{territory.priorityTerritories.slice(0,3).map((item) => item.borough || item.name).join(" · ")}</strong>
          <small>{territory.geographySource}</small>
        </div>
        <div>
          <span>Public community nodes</span>
          <strong>{territory.publicCommunityNodes.length}</strong>
          <small>Public locations with source URLs and postcodes; suitable for local reach context.</small>
        </div>
        <div>
          <span>Club postcode sectors</span>
          <strong>{territory.authorisedPostcodeState === "club-aggregate" ? "Connected" : "Requires access"}</strong>
          <small>{territory.authorisedPostcodeState === "club-aggregate" ? "Use aggregated sector patterns only." : "No authorised supporter postcode aggregate connected."}</small>
        </div>
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
