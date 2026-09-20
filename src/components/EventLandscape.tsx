"use client";

import { useLanguage } from "./LanguageProvider";
import type { CalendarFixture, EventLandscapeData } from "@/lib/models";

function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00`));
}

export function EventLandscape({ data, calendar }: { data: EventLandscapeData; calendar: CalendarFixture[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const fixtureNames = new Map(calendar.map((fixture) => [
    fixture.id,
    fixture.homeAway === "home" ? `London City v ${fixture.opponent}` : `${fixture.opponent} v London City`
  ]));
  const fixtureGroups = calendar
    .filter((fixture) => fixture.homeAway === "home" && fixture.status === "scheduled")
    .map((fixture) => ({
      fixture,
      events: data.events
        .filter((event) => event.fixtureIds.includes(fixture.id))
        .map((event) => ({
          event,
          assessment: event.fixtureScores?.find((item) => item.fixtureId === fixture.id) ?? {
            score: event.score ?? 0,
            level: event.level ?? "context",
            reasons: event.reasons ?? []
          }
        }))
        .sort((a, b) => b.assessment.score - a.assessment.score)
        .slice(0, 4)
    }))
    .filter((group) => group.events.length);
  const rawCount = data.rawEventCount ?? data.events.length;

  return (
    <section className="eventLandscape" aria-labelledby="event-landscape-title">
      <div className="eventLandscapeHead">
        <div>
          <div className="eyebrow">{es ? "COMPETENCIA DE ATENCIÓN" : "ATTENTION COMPETITION"}</div>
          <h2 id="event-landscape-title">{es ? "Qué más ocurre en Londres" : "What else is happening in London"}</h2>
          <p>{es
            ? "Competencia relevante puntuada por horario, proximidad, audiencia, escala y carácter extraordinario. Incluye otros deportes y partidos simultáneos de Barclays WSL."
            : "Relevant competition scored by timing, proximity, audience, scale and distinctiveness. It includes other sports and simultaneous Barclays WSL fixtures."}</p>
        </div>
        <div className={`eventLandscapeState state-${data.state}`}>
          <span>{es ? "ESTADO" : "STATUS"}</span>
          <strong>{data.state}</strong>
          <small>{data.events.length} {es ? `relevantes de ${rawCount} analizados` : `relevant from ${rawCount} analysed`}</small>
        </div>
      </div>

      {fixtureGroups.length ? (
        <div className="eventFixtureGroups">
          {fixtureGroups.map(({ fixture, events }) => (
            <section className="eventFixtureGroup" key={fixture.id} aria-label={fixtureNames.get(fixture.id)}>
              <div className="eventFixtureTitle">
                <div><span>{es ? "PARTIDO" : "FIXTURE"}</span><strong>{fixtureNames.get(fixture.id)}</strong></div>
                <small>{displayDate(fixture.date, locale)} · {fixture.kickoff ?? "TBC"}</small>
              </div>
              <div className="eventLandscapeGrid">
                {events.map(({ event, assessment }) => (
                  <article className={`competition-${assessment.level}`} key={`${fixture.id}-${event.id}`}>
                    <div><span>{event.kind === "same-league-fixture" ? (es ? "MISMA LIGA" : "SAME LEAGUE") : event.category}</span><span>{displayDate(event.date, locale)}{event.time ? ` · ${event.time.slice(0, 5)}` : ""}</span></div>
                    <div className="competitionScore"><strong>{assessment.score}</strong><span>{assessment.level === "high" ? (es ? "Alta" : "High") : assessment.level === "medium" ? (es ? "Media" : "Medium") : (es ? "Contexto" : "Context")}</span></div>
                    <h3>{event.name}</h3>
                    <p>{event.venue} · {event.city}</p>
                    {event.slotCount && event.slotCount > 1 ? <small>{event.slotCount} {es ? "horarios agrupados" : "time slots grouped"}</small> : null}
                    <ul className="competitionReasons">
                      {assessment.reasons.map((reason) => <li key={reason.en}>{es ? reason.es : reason.en}</li>)}
                    </ul>
                    <a href={event.url} target="_blank" rel="noreferrer">{event.sourceName ?? "Ticketmaster"} ↗</a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="eventLandscapeEmpty">
          <strong>{es ? "Esperando el primer refresh oficial" : "Waiting for the first official refresh"}</strong>
          <p>{es
            ? "La última observación válida se conservará si la API no está disponible."
            : "The last valid observation will be retained if the API is unavailable."}</p>
        </div>
      )}

      <div className="eventLandscapeSources">
        {(data.sources ?? [data.source]).map((source) => <a className="eventLandscapeSource" href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.name} ↗</a>)}
      </div>
    </section>
  );
}
