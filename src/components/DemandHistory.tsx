"use client";

import { useLanguage } from "./LanguageProvider";
import type { AttendanceHistory } from "@/lib/models";

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function shortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "2-digit" })
    .format(new Date(value + "T12:00:00"));
}

export function DemandHistory({ data }: { data: AttendanceHistory }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const attendances = data.matches.map((match) => match.attendance);
  const priorAverage = average(attendances);
  const priorMedian = median(attendances);
  const hayesAverage = average(data.matches.filter((match) => match.venueGroup === "hayes-lane").map((match) => match.attendance));
  const record = data.matches.reduce((highest, match) => match.attendance > highest.attendance ? match : highest);
  const current = data.currentBenchmark;
  const uplift = Math.round(((current.attendance - priorAverage) / priorAverage) * 100);
  const recordGap = record.attendance - current.attendance;
  const maxAttendance = Math.max(record.attendance, current.attendance);
  const rows = [...data.matches, { ...current, id: "current-opener", kickoff: "19:00", competition: "Barclays Women\'s Super League", venue: "CopperJax Community Stadium", venueGroup: "hayes-lane" as const, confidence: "HIGH" as const }];

  return (
    <section className="demandHistory" aria-labelledby="demand-history-title">
      <div className="demandHistoryTop">
        <div>
          <div className="eyebrow">{es ? "HISTÓRICO DE DEMANDA" : "DEMAND HISTORY"} · 2025/26 → 2026/27</div>
          <h2 id="demand-history-title">{es ? "El opener fue casi récord; el baseline es más bajo" : "The opener was near-record; the baseline is lower"}</h2>
          <p>{es
            ? "Los 5.402 espectadores ante Manchester United prueban demanda extraordinaria, pero quedaron 12 por debajo del récord de 5.414 ante Arsenal. La comparación correcta es con una media anterior de 3.176."
            : "The 5,402 crowd against Manchester United proves exceptional demand, but sat 12 below the 5,414 record against Arsenal. The correct comparison is with the prior 3,176 average."}</p>
        </div>
        <div className="demandHistoryStatement">
          <span>{es ? "LECTURA PARA MARKETING" : "MARKETING READ"}</span>
          <strong>{es ? "Convertir un pico en repetición" : "Turn a peak into repeat demand"}</strong>
          <p>{es ? "Brighton debe medir cuántos compradores del opener vuelven, de qué territorios y con qué producto." : "Brighton must measure how many opener buyers return, from which territories and through which product."}</p>
        </div>
      </div>

      <div className="demandHistoryKpis">
        <div><strong>{priorAverage.toLocaleString(locale)}</strong><span>{es ? "media 2025/26" : "2025/26 average"}</span></div>
        <div><strong>{priorMedian.toLocaleString(locale)}</strong><span>{es ? "mediana" : "median"}</span></div>
        <div><strong>{hayesAverage.toLocaleString(locale)}</strong><span>{es ? "media Hayes Lane" : "Hayes Lane average"}</span></div>
        <div><strong>{record.attendance.toLocaleString(locale)}</strong><span>{es ? "récord · Arsenal" : "record · Arsenal"}</span></div>
      </div>

      <div className="demandHistoryChart" role="list" aria-label={es ? "Asistencia por partido en casa" : "Home attendance by fixture"}>
        {rows.map((match) => {
          const isCurrent = match.id === "current-opener";
          const isRecord = match.id === record.id;
          const width = Math.max(8, Math.round((match.attendance / maxAttendance) * 100));
          return (
            <div className={["demandHistoryRow", isCurrent ? "current" : ""].filter(Boolean).join(" ")} key={match.id} role="listitem">
              <div className="demandHistoryMeta"><strong>{shortDate(match.date, locale)}</strong><span>{match.opponent}</span></div>
              <div className="demandHistoryTrack"><div className="demandHistoryBar" style={{ width: String(width) + "%" }} /></div>
              <strong className="demandHistoryValue">{match.attendance.toLocaleString(locale)}</strong>
              <div className="demandHistoryTags">
                {isCurrent ? <span>{es ? "temporada actual" : "current season"}</span> : null}
                {isRecord ? <span>{es ? "récord" : "record"}</span> : null}
                {match.soldOut ? <span>sold out</span> : null}
                {match.venueGroup === "the-den" ? <span>The Den</span> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="demandHistoryInsights">
        <div><strong>+{uplift}%</strong><span>{es ? "sobre la media anterior" : "above prior average"}</span></div>
        <div><strong>{recordGap}</strong><span>{es ? "por debajo del récord" : "below the record"}</span></div>
        <div><strong>Brighton</strong><span>{es ? "primera prueba de retención" : "first retention test"}</span></div>
      </div>

      <details className="demandHistoryMethod">
        <summary>{es ? "Fuentes, alcance y discrepancia" : "Sources, scope and discrepancy"}</summary>
        <p>{data.discrepancyNote[lang]}</p>
        <div>{data.sources.map((source) => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}</div>
      </details>
    </section>
  );
}
