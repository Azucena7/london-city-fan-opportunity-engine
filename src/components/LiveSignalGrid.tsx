"use client";

import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

type Metric = {
  name: string;
  score: number | string;
  type: "MEASURED" | "PLANNING" | "DYNAMIC" | "INFERRED" | "LIVE" | "WAITING" | "STRUCTURAL";
  detail: string;
};

function DecisionMetric({ metric }: { metric: Metric }) {
  return (
    <div className="decisionMetric">
      <div className="decisionMetricTop">
        <span>{metric.name}</span>
        <SignalBadge type={metric.type} />
      </div>
      <strong className="decisionMetricScore">{metric.score}</strong>
      <small>{metric.detail}</small>
    </div>
  );
}

export function LiveSignalGrid() {
  const { t, lang } = useLanguage();
  const s = useLiveMatch();
  const es = lang === "es";

  const where: Metric[] = [
    {
      name: t.common.territory,
      score: s.fixture.territoryOpportunity,
      type: "STRUCTURAL",
      detail: s.fixture.targetTerritory
    }
  ];

  const when: Metric[] = [
    {
      name: t.common.calendar,
      score: s.fixture.calendarWhitespace,
      type: "PLANNING",
      detail: es ? "Hueco de calendario" : "Calendar whitespace"
    },
    {
      name: es ? "Disponibilidad de atención" : "Attention availability",
      score: s.fixture.attentionAvailability,
      type: "PLANNING",
      detail: es ? "100 − presión externa" : "100 − external pressure"
    },
    {
      name: t.common.fixtureAppeal,
      score: s.fixture.fixtureAppeal,
      type: "INFERRED",
      detail: es ? "Prior experto" : "Expert prior"
    }
  ];

  const matchweek: Metric[] = [
    {
      name: t.common.weather,
      score: s.weatherSuitability ?? "—",
      type: s.weatherStatus,
      detail:
        s.weatherStatus === "LIVE"
          ? es
            ? "Forecast disponible"
            : "Forecast available"
          : es
          ? "Fuera de ventana fiable"
          : "Outside reliable forecast window"
    },
    {
      name: es ? "Momentum de asistencia" : "Attendance momentum",
      score: s.attendanceMomentum ?? "—",
      type: "WAITING",
      detail: es ? "Requiere ventas y accesos verificados" : "Requires verified sales and scans"
    }
  ];

  return (
    <div className="decisionGroups">
      <article className="decisionGroup decisionGroupWhere">
        <div className="decisionGroupHeader">
          <div>
            <span className="decisionGroupCode">WHERE</span>
            <strong>{es ? "Dónde existe la oportunidad" : "Where the opportunity exists"}</strong>
          </div>
          <SignalBadge type="STRUCTURAL" />
        </div>
        <div className="decisionGroupMetrics singleMetric">
          {where.map((metric) => <DecisionMetric key={metric.name} metric={metric} />)}
        </div>
      </article>

      <article className="decisionGroup decisionGroupWhen">
        <div className="decisionGroupHeader">
          <div>
            <span className="decisionGroupCode">WHEN</span>
            <strong>{es ? "Cuándo merece la pena actuar" : "When it is worth acting"}</strong>
          </div>
          <SignalBadge type="PLANNING" />
        </div>
        <div className="decisionGroupMetrics threeMetrics">
          {when.map((metric) => <DecisionMetric key={metric.name} metric={metric} />)}
        </div>
      </article>

      <article className="decisionGroup decisionGroupMatchweek">
        <div className="decisionGroupHeader">
          <div>
            <span className="decisionGroupCode">MATCHWEEK</span>
            <strong>{es ? "Qué puede cambiar cerca del partido" : "What can change close to the fixture"}</strong>
          </div>
          <SignalBadge type="DYNAMIC" />
        </div>
        <div className="decisionGroupMetrics twoMetrics">
          {matchweek.map((metric) => <DecisionMetric key={metric.name} metric={metric} />)}
        </div>
      </article>
    </div>
  );
}
