"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import type { SearchDemandData } from "@/lib/models";

const stageCode = { player: "01", club: "02", fixture: "03", ticket: "04", travel: "05" } as const;

function stateLabel(state: string, es: boolean) {
  if (state === "measured") return es ? "Medido" : "Measured";
  if (state === "insufficient-sample") return es ? "Muestra insuficiente" : "Insufficient sample";
  if (state === "requires-access") return es ? "Requiere acceso" : "Requires access";
  return es ? "Fuente no disponible" : "Source unavailable";
}

export function SearchDemandObservatory({ data }: { data: SearchDemandData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const measuredSets = data.markets.flatMap((market) => market.comparisonSets)
    .filter((set) => set.snapshots.some((snapshot) => snapshot.state === "measured")).length;

  return (
    <section className="searchObservatory" aria-labelledby="search-observatory-title">
      <div className="searchObservatoryHead">
        <div>
          <div className="eyebrow">SEARCH → EXPERIENCE</div>
          <h2 id="search-observatory-title">{es ? "¿El interés por Alexia se convierte en intención de viaje?" : "Does interest in Alexia become travel intent?"}</h2>
          <p>{es
            ? "El observatorio separa notoriedad, interés por el club, búsqueda de partido, intención de entrada e intención de viaje. No convierte un pico relativo en demanda comercial sin una señal posterior."
            : "The observatory separates awareness, club interest, fixture search, ticket intent and travel intent. It does not turn a relative spike into commercial demand without a downstream signal."}</p>
        </div>
        <div className={`searchSourceState ${data.source.state}`}>
          <span>{es ? "PRIMER BASELINE" : "FIRST BASELINE"}</span>
          <strong>{measuredSets}/{data.markets.length * 2}</strong>
          <small>{stateLabel(data.source.state, es)}</small>
        </div>
      </div>

      <div className="intentLadder">
        {data.ladder.map((item) => (
          <article className={item.state} key={item.stage}>
            <span>{stageCode[item.stage]}</span>
            <strong>{item.label[lang]}</strong>
            <p>{item.question[lang]}</p>
          </article>
        ))}
      </div>

      <div className="searchMarketGrid">
        {data.markets.map((market) => (
          <article key={market.code}>
            <div className="searchMarketTitle"><span>{market.code}</span><strong>{market.label[lang]}</strong></div>
            {market.comparisonSets.map((set) => {
              const latest = set.snapshots.at(-1);
              return (
                <div className="comparisonSet" key={set.id}>
                  <div><strong>{set.label[lang]}</strong><span className={latest?.state}>{stateLabel(latest?.state ?? "source-unavailable", es)}</span></div>
                  <p>{set.terms.map((term) => term.query).join(" · ")}</p>
                  <a href={set.exploreUrl} target="_blank" rel="noreferrer">Google Trends ↗</a>
                  <small>{latest?.note[lang]}</small>
                </div>
              );
            })}
          </article>
        ))}
      </div>

      <div className="activationSearchLinks">
        <div className="sectionHeader">
          <div><div className="eyebrow">{es ? "ACTIVACIÓN → SEÑAL" : "ACTIVATION → SIGNAL"}</div><h3>{es ? "Qué cambio esperar de las acciones observadas" : "What change to expect from observed actions"}</h3></div>
          <p>{es ? "Una relación temporal permite formular una hipótesis; la conversión exige UTMs, ticketing o una prueba posterior." : "Timing supports a hypothesis; conversion still requires UTMs, ticketing or a downstream test."}</p>
        </div>
        {data.activationLinks.map((link) => (
          <article key={link.activationId}>
            <span>{link.activationId}</span>
            <strong>{link.expectedStage}</strong>
            <p>{link.hypothesis[lang]}</p>
            <b>{link.measurementState === "measurable" ? (es ? "medible" : "measurable") : (es ? "esperando baseline" : "waiting for baseline")}</b>
          </article>
        ))}
      </div>

      <div className="experienceGates">
        <div><span>{es ? "DECISIÓN HOSPITALITY / VIAJE" : "HOSPITALITY / TRAVEL DECISION"}</span><strong>{es ? "No lanzar un paquete solo porque Alexia genera búsquedas" : "Do not launch a package merely because Alexia generates search"}</strong></div>
        {data.experienceGates.map((gate) => (
          <article key={gate.id} className={gate.state}><span>{gate.state}</span><strong>{gate.label[lang]}</strong><p>{gate.threshold[lang]}</p></article>
        ))}
      </div>

      <div className="searchExperienceCta">
        <div><span>{es ? "SIGUIENTE PRUEBA" : "NEXT TEST"}</span><strong>{es ? "Contrastar intención con una configuración real de experiencia" : "Test intent with a real experience configuration"}</strong></div>
        <Link href="/experience">{es ? "Abrir laboratorio de experiencias" : "Open experience lab"} →</Link>
      </div>

      <details className="searchMethod">
        <summary>{es ? "Método, limitaciones y captura" : "Method, limitations and capture"}</summary>
        <p>{data.methodology.rule[lang]} {es ? "La API oficial con escala consistente sigue en acceso alpha; hasta disponer de ella, cada exportación debe conservar el mismo mercado, ventana y grupo de comparación." : "The consistently scaled official API remains in alpha access; until it is available, each export must preserve the same market, window and comparison group."}</p>
        <a href={data.source.url} target="_blank" rel="noreferrer">{data.source.name} ↗</a>
      </details>
    </section>
  );
}
