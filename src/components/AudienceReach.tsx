"use client";

import { useLanguage } from "./LanguageProvider";
import type { AudienceReachData } from "@/lib/models";

function shortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })
    .format(new Date(value + "T12:00:00"));
}

function snapshotStatus(state: string, es: boolean) {
  if (state === "measured") return es ? "Medido" : "Measured";
  if (state === "confirmed") return es ? "Confirmado" : "Confirmed";
  if (state === "requires-access") return es ? "Requiere acceso" : "Requires access";
  return es ? "Pendiente" : "Pending";
}

function refreshLabel(state: string, es: boolean) {
  if (state === "fresh") return es ? "Actualización completa" : "Refresh complete";
  if (state === "partial") return es ? "Actualización parcial" : "Partial refresh";
  return es ? "Esperando fuentes" : "Waiting for sources";
}

export function AudienceReach({ data }: { data: AudienceReachData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const youtube = data.channels.find((channel) => channel.id === "lcl-youtube");
  const eleven = data.channels.find((channel) => channel.id === "eleven-tv");
  const search = data.channels.find((channel) => channel.id === "search");
  const snapshots = [...data.snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  const latestSnapshot = snapshots.at(-1);
  const previousSnapshot = snapshots.at(-2);
  const readyCount = data.measurementReadiness.filter((item) => item.state === "ready").length;

  return (
    <section className="audienceReach" aria-labelledby="audience-reach-title">
      <div className="audienceReachTop">
        <div>
          <div className="eyebrow">{es ? "AUDIENCIA → DEMANDA" : "AUDIENCE → DEMAND"}</div>
          <h2 id="audience-reach-title">{data.headline[lang]}</h2>
          <p>{data.principle[lang]}</p>
        </div>
        <div className="audienceReachSummary">
          <span>{es ? "LECTURA ACTUAL" : "CURRENT READ"}</span>
          <strong>{es ? "Alexia amplía el alcance; la conversión aún no está conectada" : "Alexia expands reach; conversion is not connected yet"}</strong>
          <p>{es ? "La oportunidad no es sumar audiencias incompatibles, sino seguir el recorrido de cada partido." : "The opportunity is not to add incompatible audiences, but to follow each fixture's journey."}</p>
        </div>
      </div>

      <div className="audienceKpis">
        <div><strong>{youtube?.metrics[0].value}</strong><span>{es ? "YouTube London City" : "London City YouTube"}</span></div>
        <div><strong>{youtube?.metrics[1].value}</strong><span>{es ? "vídeos públicos" : "public videos"}</span></div>
        <div><strong>{eleven?.metrics[0].value}</strong><span>{es ? "Eleven TV · España" : "Eleven TV · Spain"}</span></div>
        <div><strong>{search?.metrics[0].value}</strong><span>{es ? "búsquedas a seguir" : "search terms to track"}</span></div>
      </div>

      {data.refresh ? (
        <div className={`publicRefreshHealth ${data.refresh.state}`}>
          <div>
            <span>{es ? "AUTOMATIZACIÓN PÚBLICA" : "PUBLIC AUTOMATION"}</span>
            <strong>{refreshLabel(data.refresh.state, es)}</strong>
            <small>{es ? "Semanal y en ventanas T-7, T+1, T+7 y T+30" : "Weekly and at T-7, T+1, T+7 and T+30 windows"}</small>
          </div>
          {data.refresh.sources.map((source) => (
            <a href={source.sourceUrl} target="_blank" rel="noreferrer" key={source.id} className={source.state}>
              <span>{source.state === "measured" ? (es ? "MEDIDO" : "MEASURED") : (es ? "EN ESPERA" : "WAITING")}</span>
              <strong>{source.label}</strong>
              <small>{shortDate(source.checkedAt.slice(0, 10), locale)} · {es ? "confianza" : "confidence"}: {source.confidence} · {source.message ?? (es ? "fuente respondida" : "source responded")}</small>
            </a>
          ))}
        </div>
      ) : null}

      <details className="audienceExplorer">
        <summary>{es ? "Explorar canales, impacto de búsqueda y conversión por partido" : "Explore channels, search impact and fixture conversion"}</summary>

      <div className="audienceFunnel" aria-label={es ? "Cadena de medición de audiencia a repetición" : "Audience-to-repeat measurement chain"}>
        {data.funnel.map((step, index) => (
          <div key={step.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label[lang]}</strong>
            <small>{step.measure[lang]}</small>
          </div>
        ))}
      </div>

      <section className="audienceImpactTimeline">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">{es ? "AUDIENCE IMPACT TIMELINE" : "AUDIENCE IMPACT TIMELINE"}</div>
            <h3>{es ? "Qué ocurre, qué debería cambiar y cuándo medirlo" : "What happened, what should move and when to measure"}</h3>
          </div>
          <p>{es
            ? "Las anotaciones evitan atribuir todo el movimiento a Alexia cuando coinciden partido, patrocinio y distribución."
            : "Annotations prevent every movement being attributed to Alexia when fixture, partner and distribution effects overlap."}</p>
        </div>
        <div className="impactEventList">
          {data.impactTimeline.map((event) => (
            <article className={event.category} key={event.id}>
              <time>{shortDate(event.date, locale)}</time>
              <span>{event.category}</span>
              <strong>{event.title[lang]}</strong>
              <p>{event.hypothesis[lang]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="audienceSnapshots">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">{es ? "SNAPSHOTS COMPARABLES" : "COMPARABLE SNAPSHOTS"}</div>
            <h3>{latestSnapshot?.label[lang]}</h3>
          </div>
          <div className="snapshotState">
            <strong>{snapshots.length === 1 ? (es ? "Primera observación" : "First observation") : `${snapshots.length} ${es ? "observaciones" : "observations"}`}</strong>
            <span>{latestSnapshot ? shortDate(latestSnapshot.observedAt.slice(0, 10), locale) : "—"}</span>
          </div>
        </div>
        <div className="snapshotMetricGrid">
          {latestSnapshot?.metrics.map((metric) => {
            const previous = previousSnapshot?.metrics.find((item) => item.key === metric.key);
            const delta = metric.value !== null && previous?.value != null ? metric.value - previous.value : null;
            return (
              <article key={metric.key} className={metric.state}>
                <div><span>{snapshotStatus(metric.state, es)}</span><b>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toLocaleString(locale)}`}</b></div>
                <strong>{metric.displayValue}</strong>
                <p>{metric.label[lang]}</p>
                <small>{delta === null
                  ? (es ? "Se necesita otra observación comparable" : "Another comparable observation is required")
                  : (es ? "Cambio frente al snapshot anterior" : "Change versus previous snapshot")}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="measurementReadiness">
        <div className="measurementReadinessIntro">
          <div><div className="eyebrow">{es ? "BRIGHTON · PREPARACIÓN" : "BRIGHTON · READINESS"}</div><h3>{es ? "Cerrar la medición antes de lanzar la campaña" : "Close the measurement design before campaign launch"}</h3></div>
          <strong>{readyCount}/{data.measurementReadiness.length}<span>{es ? "puntos listos" : "points ready"}</span></strong>
        </div>
        <div className="readinessGrid">
          {data.measurementReadiness.map((item) => (
            <article className={item.state} key={item.id}>
              <span>{item.state}</span>
              <strong>{item.label[lang]}</strong>
              <p>{item.action[lang]}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="audienceChannelGrid">
        {data.channels.map((channel) => (
          <article className={"audienceChannel " + channel.category} key={channel.id}>
            <div className="audienceChannelTop">
              <span>{channel.category}</span>
              <b>{channel.state.replaceAll("-", " ")}</b>
            </div>
            <h3>{channel.name}</h3>
            <p className="audienceRole">{channel.role[lang]}</p>
            <div className="audienceMetrics">
              {channel.metrics.map((metric) => (
                <div key={metric.label.en}><strong>{metric.value}</strong><span>{metric.label[lang]}</span></div>
              ))}
            </div>
            <p><strong>{es ? "Sabemos: " : "Known: "}</strong>{channel.known[lang]}</p>
            <details>
              <summary>{es ? "Brecha de datos" : "Data gap"}</summary>
              <p>{channel.missing[lang]}</p>
            </details>
            <div className="audienceAction"><span>{es ? "SIGUIENTE ACCIÓN" : "NEXT ACTION"}</span><strong>{channel.action[lang]}</strong></div>
          </article>
        ))}
      </div>

      <section className="searchDemand">
        <div className="searchDemandIntro">
          <div>
            <div className="eyebrow">{es ? "SEARCH INTEREST" : "SEARCH INTEREST"}</div>
            <h3>{es ? "Medir el efecto Alexia sin confundir pico con demanda" : "Measure the Alexia effect without mistaking a spike for demand"}</h3>
          </div>
          <p>{es
            ? "El índice de Google Trends debe compararse dentro de la misma consulta. Un valor 100 es el máximo relativo del periodo, no cien búsquedas."
            : "Google Trends must be compared within the same query. A value of 100 is the period's relative peak, not one hundred searches."}</p>
        </div>
        <div className="searchDemandGrid">
          <div>
            <span>{es ? "CONSULTAS" : "QUERIES"}</span>
            {data.searchPlan.terms.map((term) => <strong key={term}>{term}</strong>)}
          </div>
          <div>
            <span>{es ? "MERCADOS Y VENTANAS" : "MARKETS & WINDOWS"}</span>
            <strong>{data.searchPlan.markets.join(" · ")}</strong>
            <strong>{data.searchPlan.windows.join(" · ")}</strong>
            <a href="https://trends.google.com/trends/explore?date=today%203-m&geo=GB&q=London%20City%20Lionesses,Alexia%20Putellas,London%20City%20tickets" target="_blank" rel="noreferrer">Google Trends · GB ↗</a>
            <a href="https://trends.google.com/trends/explore?date=today%203-m&geo=ES&q=London%20City%20Lionesses,Alexia%20Putellas,London%20City%20tickets" target="_blank" rel="noreferrer">Google Trends · ES ↗</a>
          </div>
          <div>
            <span>{es ? "ANOTACIONES" : "ANNOTATIONS"}</span>
            {data.searchPlan.annotations.map((item) => <strong key={item.date}>{shortDate(item.date, locale)} · {item.event[lang]}</strong>)}
          </div>
        </div>
        <div className="searchQuestions">
          <div><strong>{es ? "Pico" : "Peak"}</strong><span>{es ? "¿Cuánto sube tras Alexia, Nike o un partido?" : "How far does interest rise after Alexia, Nike or a fixture?"}</span></div>
          <div><strong>{es ? "Persistencia" : "Persistence"}</strong><span>{es ? "¿Qué parte permanece 7, 30 y 90 días?" : "How much remains after 7, 30 and 90 days?"}</span></div>
          <div><strong>{es ? "Intención" : "Intent"}</strong><span>{es ? "¿La marca evoluciona hacia tickets y fixtures?" : "Does brand search progress to tickets and fixtures?"}</span></div>
        </div>
      </section>

      <section className="audienceFixtureTests">
        <div className="sectionHeader">
          <div><div className="eyebrow">{es ? "CASOS POR PARTIDO" : "FIXTURE CASES"}</div><h3>{es ? "Cada partido debe cerrar su propio loop" : "Each fixture must close its own loop"}</h3></div>
        </div>
        {data.fixtureTests.map((fixture) => (
          <article key={fixture.fixtureId}>
            <div><span>{shortDate(fixture.date, locale)} · {fixture.stage}</span><strong>London City v {fixture.opponent}</strong></div>
            <div><span>{es ? "DISTRIBUCIÓN" : "DISTRIBUTION"}</span><strong>{fixture.distribution}</strong></div>
            <div><span>{es ? "ASISTENCIA" : "ATTENDANCE"}</span><strong>{fixture.attendance?.toLocaleString(locale) ?? (es ? "Pendiente" : "Pending")}</strong></div>
            <div><span>{es ? "CONVERSIÓN" : "CONVERSION"}</span><strong>{fixture.conversionState}</strong></div>
            <p>{fixture.nextAction[lang]}</p>
          </article>
        ))}
      </section>

      </details>

      <details className="audienceMethod">
        <summary>{es ? "Principios de medición y fuentes" : "Measurement principles and sources"}</summary>
        <p>{es ? "Las cifras públicas son snapshots, no sustituyen YouTube Analytics, informes de broadcasters ni CRM. Los campos restringidos permanecen pendientes hasta disponer de acceso autorizado." : "Public figures are snapshots; they do not replace YouTube Analytics, broadcaster reports or CRM. Restricted fields remain pending until authorised access exists."}</p>
        <div>{data.channels.map((channel) => <a href={channel.sourceUrl} key={channel.id} target="_blank" rel="noreferrer">{channel.sourceName} ↗</a>)}</div>
      </details>
    </section>
  );
}
