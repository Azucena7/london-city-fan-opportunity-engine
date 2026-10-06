import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calendar, mobilityPartnership } from "@/lib/data";
import { mobilityProviderReadiness, summariseMobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";
import { MatchdayExternalTravelLink, MatchdayOfficialDirectionsLink, MatchdayOfficialTicketingLink, MatchdayUtilityTracker } from "@/components/MatchdayUtilityTracker";
import { getVerifiedFixtureTicketUrl } from "@/lib/verifiedFixtureTicketing";
import { getMatchdayWeatherContext } from "@/lib/matchdayWeatherContext";
import styles from "./matchday.module.css";

export async function generateMetadata({ params }: { params: Promise<{ fixtureId: string }> }): Promise<Metadata> {
  const { fixtureId } = await params;
  const fixture = calendar.find((item) => item.id === fixtureId && item.homeAway === "home");
  if (!fixture) return { title: "Matchday Journey · London City" };
  return {
    title: `London City v ${fixture.opponent} · Matchday Journey`,
    description: `Plan travel to ${fixture.venue} for London City v ${fixture.opponent} on ${fixture.date}. Fixture details, travel context and official directions in one place.`,
    alternates: { canonical: `/matchday/${fixture.id}` },
    openGraph: {
      title: `London City v ${fixture.opponent} · Matchday Journey`,
      description: `Travel guidance and matchday context for London City v ${fixture.opponent}.`,
      type: "website"
    }
  };
}

export default async function MatchdayJourneyPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;
  const fixture = calendar.find((item) => item.id === fixtureId && item.homeAway === "home");
  if (!fixture) notFound();

  const pilot = mobilityPartnership.pilots.find((item) => item.fixtureId === fixtureId) ?? null;
  const corridors = [...mobilityPartnership.corridors]
    .sort((a,b) => (b.travelFriction + b.territoryOpportunity) - (a.travelFriction + a.territoryOpportunity));
  const matchDate = new Intl.DateTimeFormat("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    .format(new Date(fixture.date + "T12:00:00Z"));
  const eventStart = fixture.kickoff ? `${fixture.date}T${fixture.kickoff}:00` : fixture.date;
  const providerSummary = summariseMobilityProviderReadiness();
  const weather = getMatchdayWeatherContext(fixtureId, fixture.date);
  const ticketing = getVerifiedFixtureTicketUrl(fixtureId);

  return (
    <main className={styles.shell}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `London City Lionesses v ${fixture.opponent}`,
            startDate: eventStart,
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: fixture.venue,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bromley",
                addressRegion: "London",
                addressCountry: "GB"
              }
            },
            organizer: {
              "@type": "SportsOrganization",
              name: "London City Lionesses",
              url: "https://www.londoncitylionesses.com/"
            },
            ...(ticketing ? { offers: { "@type": "Offer", url: ticketing.url } } : {})
          }).replace(/</g, "\\u003c")
        }}
      />
      <MatchdayUtilityTracker fixtureId={fixtureId} />
      <header className={styles.top}>
        <Link href="/live/london-city" className={styles.brand}>LONDON CITY · MATCHDAY</Link>
        <span>Travel information · supporter service</span>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>MATCHDAY JOURNEY</span>
          <h1>Plan the trip. Arrive ready for the match.</h1>
          <p>One place for fixture details, official ground information and the travel context most likely to affect your day.</p>
        </div>
        <aside>
          <span>London City v</span>
          <strong>{fixture.opponent}</strong>
          <small>{matchDate} · {fixture.kickoff ?? "TBC"} · {fixture.venue}</small>
        </aside>
      </section>

      <section className={styles.status}>
        <article data-state="known">
          <span>Fixture</span>
          <strong>{fixture.kickoff ?? "TBC"} kickoff</strong>
          <small>{fixture.competition}</small>
        </article>
        <article data-state="known">
          <span>Venue</span>
          <strong>{fixture.venue}</strong>
          <small>Bromley · London</small>
        </article>
        <article data-state={providerSummary.state === "live" ? "known" : "pending"}>
          <span>Live disruption</span>
          <strong>{providerSummary.configured}/{providerSummary.total} layers configured</strong>
          <small>{providerSummary.state === "live" ? "Live travel context available." : "Use official transport information before travelling."}</small>
        </article>
        <article data-state={pilot ? "pilot" : "known"}>
          <span>Journey service</span>
          <strong>{pilot ? "Pilot candidate" : "Matchday guidance"}</strong>
          <small>{pilot?.purpose.en ?? "Official supporter travel guidance."}</small>
        </article>
      </section>

      <section className={styles.weatherBand} data-level={weather.materiality}>
        <div>
          <span>WEATHER CONTEXT</span>
          <strong>{weather.state === "forecast" ? (weather.precipitationProbability ?? "—") + "% rain · " + (weather.windKmh ?? "—") + " km/h wind" : "Forecast not yet in the operational window"}</strong>
          <small>{weather.source ?? "Open-Meteo"}{weather.generatedAt ? " · updated " + new Date(weather.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</small>
        </div>
        <p>{weather.supporterAction}</p>
      </section>

      <section className={styles.networkChecks} aria-label="Live travel checks">
        <div className={styles.sectionHead}>
          <span>CHECK BEFORE YOU LEAVE</span>
          <h2>Live network information, without pretending AVELA is the transport operator.</h2>
          <p>Use official live sources for current road and rail conditions, then return here for the fixture-specific matchday context.</p>
        </div>
        <div className={styles.networkGrid}>
          <MatchdayExternalTravelLink fixtureId={fixtureId} source="road" href="https://tfl.gov.uk/traffic/status">
            <span>ROAD · LIVE SOURCE</span>
            <strong>Check TfL traffic status ↗</strong>
            <small>Incidents, closures and exceptional delays across London.</small>
          </MatchdayExternalTravelLink>
          <MatchdayExternalTravelLink fixtureId={fixtureId} source="rail" href="https://www.nationalrail.co.uk/">
            <span>RAIL · LIVE SOURCE</span>
            <strong>Check National Rail ↗</strong>
            <small>Journey planning, live departures and disruption information.</small>
          </MatchdayExternalTravelLink>
          <MatchdayOfficialDirectionsLink fixtureId={fixtureId} href="https://www.londoncitylionesses.com/hayes-lane-directions">
            <span>STADIUM · CLUB SOURCE</span>
            <strong>Open London City directions ↗</strong>
            <small>Ground access, station, parking and walking guidance from the club.</small>
          </MatchdayOfficialDirectionsLink>
        </div>
      </section>

      <section className={styles.plan}>
        <div className={styles.sectionHead}>
          <span>PLAN YOUR ARRIVAL</span>
          <h2>Useful starting points for supporters.</h2>
          <p>These corridors are planning scenarios, not live route recommendations. Live routing will only appear when an authorised provider is connected.</p>
        </div>
        <div className={styles.routes}>
          {corridors.map((corridor) => (
            <article key={corridor.id}>
              <div>
                <span>{corridor.label.en}</span>
                <strong>{corridor.representativeOrigins.join(" · ")}</strong>
              </div>
              <div className={styles.friction}>
                <span>Travel friction</span>
                <b>{corridor.travelFriction}/100</b>
              </div>
              <p>{corridor.note.en}</p>
            </article>
          ))}
        </div>
      </section>

      {ticketing ? (
        <section className={styles.ticketing}>
          <div>
            <span>OFFICIAL TICKETS</span>
            <h2>Continue to the verified club ticket route.</h2>
            <p>AVELA only shows this CTA when a fixture-specific official source has been observed and stored.</p>
          </div>
          <MatchdayOfficialTicketingLink fixtureId={fixtureId} href={ticketing.url}>{ticketing.label} ↗</MatchdayOfficialTicketingLink>
        </section>
      ) : null}

      <section className={styles.help}>
        <div>
          <span>OFFICIAL DIRECTIONS</span>
          <h2>Check the club’s latest ground information before you leave.</h2>
          <p>Station, parking, walking and access advice can change. The club’s official directions remain the source of truth until live journey providers are connected here.</p>
        </div>
        <MatchdayOfficialDirectionsLink fixtureId={fixtureId} href="https://www.londoncitylionesses.com/hayes-lane-directions">Open official directions ↗</MatchdayOfficialDirectionsLink>
      </section>

      <section className={styles.future}>
        <span>LIVE TRAVEL READINESS</span>
        <div>
          {mobilityProviderReadiness.map((provider) => (
            <article key={provider.id} data-state={provider.state}>
              <strong>{provider.label}</strong>
              <p>{provider.state === "live" ? provider.scope : provider.fallback}</p>
              <small>{provider.state.replace("-", " ")} · {provider.provider}</small>
            </article>
          ))}
          <article><strong>Matchday experience</strong><p>Doors, fan zone, family area, food and pre/post-match activity.</p><small>Club content layer</small></article>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Independent AVELA demo surface · public information only</span>
        <Link href="/live/london-city">London City case →</Link>
      </footer>
    </main>
  );
}
