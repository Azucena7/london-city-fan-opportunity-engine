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

  return (
    <section className="eventLandscape" aria-labelledby="event-landscape-title">
      <div className="eventLandscapeHead">
        <div>
          <div className="eyebrow">{es ? "COMPETENCIA DE ATENCIÓN" : "ATTENTION COMPETITION"}</div>
          <h2 id="event-landscape-title">{es ? "Qué más ocurre en Londres" : "What else is happening in London"}</h2>
          <p>{es
            ? "Eventos públicos a un día o menos de los próximos partidos en casa. Son contexto de planificación, no una estimación de asistencia."
            : "Public events within one day of upcoming home fixtures. This is planning context, not an attendance estimate."}</p>
        </div>
        <div className={`eventLandscapeState state-${data.state}`}>
          <span>{es ? "ESTADO" : "STATUS"}</span>
          <strong>{data.state}</strong>
          <small>{data.events.length} {es ? "eventos coincidentes" : "overlapping events"}</small>
        </div>
      </div>

      {data.events.length ? (
        <div className="eventLandscapeGrid">
          {data.events.slice(0, 12).map((event) => (
            <article key={event.id}>
              <div><span>{event.category}</span><span>{displayDate(event.date, locale)}{event.time ? ` · ${event.time.slice(0, 5)}` : ""}</span></div>
              <h3>{event.name}</h3>
              <p>{event.venue} · {event.city}</p>
              <small>{event.fixtureIds.map((id) => fixtureNames.get(id) ?? id).join(" · ")}</small>
              <a href={event.url} target="_blank" rel="noreferrer">Ticketmaster ↗</a>
            </article>
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

      <a className="eventLandscapeSource" href={data.source.url} target="_blank" rel="noreferrer">{data.source.name} ↗</a>
    </section>
  );
}
