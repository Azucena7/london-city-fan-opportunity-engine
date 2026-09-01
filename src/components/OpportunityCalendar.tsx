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
    score,
    decision: f.decision ?? decisionFromScore(score),
    opponent: f.opponent ?? f.fixture ?? "TBC",
    date: f.date ?? "TBC"
  };
}

export function OpportunityCalendar({ items }: { items: any[] }) {
  const rows = items.map(normalize).sort((a,b) => String(a.date).localeCompare(String(b.date)));

  return (
    <div className="opportunityCalendar">
      {rows.map((f, i) => {
        const width = Math.max(10, Math.min(100, f.score));
        return (
          <div className="calendarRow" key={`${f.opponent}-${i}`}>
            <div className="calendarMeta">
              <strong>{f.opponent}</strong>
              <span>{f.date}</span>
            </div>
            <div className="calendarTrack">
              <div className="calendarBar" style={{ width: `${width}%` }} />
            </div>
            <div className="calendarScore">{f.score}</div>
            <div className="calendarDecision">{f.decision}</div>
          </div>
        );
      })}
    </div>
  );
}
