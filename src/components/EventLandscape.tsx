"use client";

import { useLanguage } from "./LanguageProvider";
import type { CalendarFixture, EventLandscapeData } from "@/lib/models";

function displayDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00`));
}

function competitionLabel(kind: EventLandscapeData["events"][number]["kind"], category: string, es: boolean) {
  if (kind === "same-league-fixture") return es ? "MISMA LIGA" : "SAME LEAGUE";
  if (kind === "england-men-fixture") return es ? "INGLATERRA" : "ENGLAND";
  if (kind === "london-premier-league-fixture") return es ? "PREMIER · LONDRES" : "PREMIER · LONDON";
  if (kind === "london-europe-fixture") return es ? "EUROPA · CLUB LONDINENSE" : "EUROPE · LONDON CLUB";
  if (kind === "london-efl-fixture") return es ? "EFL · LONDRES" : "EFL · LONDON";
  if (kind === "national-marquee-fixture") return es ? "FÚTBOL NACIONAL" : "NATIONAL FOOTBALL";
  return category;
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
    }));
  const rawCount = data.rawEventCount ?? data.events.length;

  return (
    <section className="eventLandscape" aria-labelledby="event-landscape-title">
      <div className="eventLandscapeHead">
        <div>
          <div className="eyebrow">{es ? "COMPETENCIA DE ATENCIÓN" : "ATTENTION COMPETITION"}</div>
          <h2 id="event-landscape-title">{es ? "Qué compite realmente por la atención" : "What genuinely competes for attention"}</h2>
          <p>{es
            ? "Una selección estricta: WSL simultánea, fútbol masculino londinense, Inglaterra y grandes citas deportivas. Los conciertos, musicales y eventos culturales rutinarios se excluyen por defecto."
            : "A strict selection: simultaneous WSL, London men's football, England and major sports occasions. Routine concerts, musicals and cultural events are excluded by default."}</p>
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
              {events.length ? <div className="eventLandscapeGrid">
                {events.map(({ event, assessment }) => (
                  <article className={`competition-${assessment.level}`} key={`${fixture.id}-${event.id}`}>
                    <div><span>{competitionLabel(event.kind, event.category, es)}</span><span>{displayDate(event.date, locale)}{event.time ? ` · ${event.time.slice(0, 5)}` : ""}</span></div>
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
              </div> : <div className="competitionWhitespace">
                <strong>{es ? "Sin competencia material identificada" : "No material competition identified"}</strong>
                <span>{es ? "Ventana limpia según las fuentes conectadas; no equivale a ausencia total de actividad." : "Clear window in connected sources; this does not mean no other activity exists."}</span>
              </div>}
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
