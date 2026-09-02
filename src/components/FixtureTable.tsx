"use client";

import { useLanguage } from "./LanguageProvider";
import type { Fixture } from "@/lib/models";

export function FixtureTable({ items }: { items: Fixture[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const rows = [...items].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="fixtureTable block15FixtureTable">
      <div className="fixtureDecisionHead">
        <span>{es ? "Partido" : "Fixture"}</span>
        <span>{es ? "Territorio objetivo" : "Target territory"}</span>
        <span>{es ? "Score" : "Planning score"}</span>
        <span>{es ? "Acción" : "Action"}</span>
      </div>

      {rows.map((fixture) => (
        <details className="fixtureDecisionItem" key={`${fixture.date}-${fixture.opponent}`}>
          <summary className="fixtureDecisionSummary">
            <div>
              <strong>{fixture.opponent}</strong>
              <small>{fixture.date} · {fixture.kickoff ?? "TBC"}</small>
            </div>
            <div className="fixtureTarget">{fixture.targetTerritory}</div>
            <div className="scoreCell">{fixture.planningScore}</div>
            <div><span className="decisionPill">{fixture.decision}</span></div>
          </summary>

          <div className="fixtureDecisionBreakdown">
            <div>
              <span>{es ? "Oportunidad territorial" : "Territory opportunity"}</span>
              <strong>{fixture.territoryOpportunity}</strong>
              <small>STRUCTURAL</small>
            </div>
            <div>
              <span>{es ? "Hueco de calendario" : "Calendar whitespace"}</span>
              <strong>{fixture.calendarWhitespace}</strong>
              <small>PLANNING</small>
            </div>
            <div>
              <span>{es ? "Disponibilidad de atención" : "Attention availability"}</span>
              <strong>{fixture.attentionAvailability}</strong>
              <small>PLANNING</small>
            </div>
            <div>
              <span>{es ? "Atractivo del partido" : "Fixture appeal"}</span>
              <strong>{fixture.fixtureAppeal}</strong>
              <small>INFERRED</small>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
