import { decisionFromScore, planningScore } from "@/lib/scoring";

function normalize(f: any) {
  const territory = Number(f.territoryOpportunity ?? f.territory_opportunity ?? f.territoryScore ?? 0);
  const calendar = Number(f.calendarWhitespace ?? f.calendar_whitespace ?? f.calendarScore ?? 0);
  const attentionPressure = Number(f.attentionPressure ?? f.attention_pressure ?? 50);
  const attentionAvailability = Number(
    f.attentionAvailability ?? f.attention_availability ?? 100 - attentionPressure
  );
  const appeal = Number(f.fixtureAppeal ?? f.fixture_appeal ?? f.appeal ?? 65);
  const score =
    Number(f.planningScore ?? f.planning_score) ||
    planningScore({
      territory,
      calendar,
      attentionAvailability,
      fixtureAppeal: appeal
    });

  return {
    ...f,
    territory,
    calendar,
    attentionPressure,
    attentionAvailability,
    appeal,
    score,
    decision: f.decision ?? decisionFromScore(score),
    opponent: f.opponent ?? f.fixture ?? "TBC",
    date: f.date ?? "TBC",
    product: f.product ?? f.recommendedProduct ?? "Hat-Trick / First Match Welcome",
    target: f.targetTerritory ?? f.target_territory ?? f.territory ?? "Priority territory"
  };
}

export function FixtureTable({ items }: { items: any[] }) {
  const normalized = items.map(normalize).sort((a,b) => String(a.date).localeCompare(String(b.date)));

  return (
    <div className="fixtureTable">
      <div className="fixtureHead">
        <span>Fixture</span>
        <span>Territory</span>
        <span>Calendar</span>
        <span>Attention</span>
        <span>Score</span>
        <span>Decision</span>
      </div>
      {normalized.map((f, i) => (
        <div className="fixtureRow" key={`${f.opponent}-${i}`}>
          <div>
            <strong>{f.opponent}</strong>
            <small>{f.date}</small>
          </div>
          <div>{f.target}</div>
          <div>{f.calendar}</div>
          <div>{f.attentionPressure}</div>
          <div className="scoreCell">{f.score}</div>
          <div><span className={`decisionPill ${f.decision.toLowerCase().replaceAll(" ","-").replaceAll("/","")}`}>{f.decision}</span></div>
        </div>
      ))}
    </div>
  );
}
