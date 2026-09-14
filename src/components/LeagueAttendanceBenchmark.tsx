"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import type { LeagueAttendanceBenchmark as BenchmarkData, LeagueAttendanceClub } from "@/lib/models";

type BenchmarkView = "all" | "london";

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function trendLabel(club: LeagueAttendanceClub, previous: LeagueAttendanceClub | undefined, es: boolean) {
  if (!previous || previous.attendance === null) return es ? "primera observación" : "first observation";
  if (previous.homeMatchesObserved === club.homeMatchesObserved) return es ? "sin nuevo partido en casa" : "no new home match";
  if (club.attendance === null) return es ? "pendiente" : "pending";
  const change = Math.round(((club.attendance - previous.attendance) / previous.attendance) * 100);
  if (change === 0) return es ? "estable" : "flat";
  return (change > 0 ? "+" : "") + change + "%";
}

export function LeagueAttendanceBenchmark({ data }: { data: BenchmarkData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const [view, setView] = useState<BenchmarkView>("all");
  const latest = data.snapshots[data.snapshots.length - 1];
  const previous = data.snapshots[data.snapshots.length - 2];
  const observed = latest.clubs.filter((club) => club.attendance !== null)
    .sort((a, b) => (b.attendance ?? 0) - (a.attendance ?? 0));
  const shown = observed.filter((club) => view === "all" || club.londonMarket);
  const pending = latest.clubs.filter((club) => club.attendance === null);
  const london = observed.find((club) => club.club === data.targetClub);
  const londonRank = observed.findIndex((club) => club.club === data.targetClub) + 1;
  const observedMedian = median(observed.map((club) => club.attendance as number));
  const localPeers = observed.filter((club) => club.directCohort && club.club !== data.targetClub);
  const localMedian = median(localPeers.map((club) => club.attendance as number));
  const localMultiple = london?.attendance ? (london.attendance / localMedian).toFixed(1) : "—";
  const maxAttendance = Math.max(...shown.map((club) => club.attendance as number));

  return (
    <section className="leagueBenchmark" aria-labelledby="league-benchmark-title">
      <div className="leagueBenchmarkTop">
        <div>
          <div className="eyebrow">{es ? "BENCHMARK WSL" : "WSL BENCHMARK"} · {latest.label[lang]}</div>
          <h2 id="league-benchmark-title">{es ? "London City es tercero entre los clubes con dato publicado" : "London City ranks third among clubs with published data"}</h2>
          <p>{es
            ? "La comparación es secundaria al histórico propio: ayuda a leer escala, presión competitiva local y si el crecimiento pertenece al club o al mercado."
            : "This comparison is secondary to the club's own history: it helps explain scale, local competitive pressure and whether growth belongs to the club or the wider market."}</p>
        </div>
        <div className="benchmarkView" role="group" aria-label={es ? "Alcance del benchmark" : "Benchmark scope"}>
          <button type="button" className={view === "all" ? "active" : ""} aria-pressed={view === "all"} onClick={() => setView("all")}>{es ? "WSL observada" : "Observed WSL"}</button>
          <button type="button" className={view === "london" ? "active" : ""} aria-pressed={view === "london"} onClick={() => setView("london")}>{es ? "Mercado Londres" : "London market"}</button>
        </div>
      </div>

      <div className="leagueBenchmarkKpis">
        <div><strong>#{londonRank}<small>/{observed.length}</small></strong><span>{es ? "ranking con dato" : "rank with data"}</span></div>
        <div><strong>{london?.attendance?.toLocaleString(locale)}</strong><span>{es ? "media actual London City" : "London City current average"}</span></div>
        <div><strong>{observedMedian.toLocaleString(locale)}</strong><span>{es ? "mediana observada" : "observed median"}</span></div>
        <div><strong>{localMultiple}×</strong><span>{es ? "mediana del cohort South/East" : "South/East cohort median"}</span></div>
      </div>

      <div className="leagueBenchmarkGrid">
        <div className="leagueBenchmarkChart" role="list" aria-label={es ? "Asistencia media local publicada por club" : "Published average home attendance by club"}>
          {shown.map((club, index) => {
            const isLondon = club.club === data.targetClub;
            const earlier = previous?.clubs.find((item) => item.club === club.club);
            const width = Math.max(3, Math.round(((club.attendance as number) / maxAttendance) * 100));
            return (
              <div className={["leagueBenchmarkRow", isLondon ? "current" : ""].filter(Boolean).join(" ")} key={club.club} role="listitem">
                <span className="benchmarkRank">{index + 1}</span>
                <div className="benchmarkClub"><strong>{club.club}</strong><small>{trendLabel(club, earlier, es)} · n={club.homeMatchesObserved}</small></div>
                <div className="leagueBenchmarkTrack"><div className="leagueBenchmarkBar" style={{ width: String(width) + "%" }} /></div>
                <strong className="leagueBenchmarkValue">{club.attendance?.toLocaleString(locale)}</strong>
                {club.soldOut ? <span className="benchmarkTag">sold out</span> : <span />}
              </div>
            );
          })}
        </div>

        <aside className="leagueBenchmarkRead">
          <span>{es ? "QUÉ SIGNIFICA" : "WHAT IT MEANS"}</span>
          <strong>{es ? "Escala e intensidad no son lo mismo" : "Scale and intensity are not the same"}</strong>
          <p>{data.marketingImplication[lang]}</p>
          <div><small>{es ? "SIGUIENTE PRUEBA" : "NEXT TEST"}</small><b>{es ? "Retención frente a Brighton" : "Retention versus Brighton"}</b></div>
        </aside>
      </div>

      <div className="benchmarkPending">
        <strong>{es ? "Pendientes; no son cero:" : "Pending; these are not zero:"}</strong>
        {pending.map((club) => <span key={club.club}>{club.club}</span>)}
      </div>

      <details className="leagueBenchmarkMethod">
        <summary>{es ? "Muestra, tendencia y fuente" : "Sample, trend and source"}</summary>
        <p>{data.methodology[lang]}</p>
        <p>{latest.completeness[lang]}. {es ? "El cambio por club se activará cuando exista una segunda observación local comparable." : "Club-level change will activate when a second comparable home observation exists."}</p>
        <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.sourceName} ↗</a>
      </details>
    </section>
  );
}
