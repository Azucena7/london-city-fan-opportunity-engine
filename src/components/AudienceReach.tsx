"use client";

import { useLanguage } from "./LanguageProvider";
import type { AudienceReachData } from "@/lib/models";

function shortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" })
    .format(new Date(value + "T12:00:00"));
}

export function AudienceReach({ data }: { data: AudienceReachData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const youtube = data.channels.find((channel) => channel.id === "lcl-youtube");
  const eleven = data.channels.find((channel) => channel.id === "eleven-tv");
  const search = data.channels.find((channel) => channel.id === "search");

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
