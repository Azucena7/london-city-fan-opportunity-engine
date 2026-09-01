import { SignalBadge } from "./SignalBadge";

const signals = [
  {
    name: "Territory",
    score: "95",
    type: "STRUCTURAL" as const,
    detail: "Bromley / Croydon priority territories"
  },
  {
    name: "Calendar",
    score: "95",
    type: "MEASURED" as const,
    detail: "High whitespace vs nearby WSL inventory"
  },
  {
    name: "Attention",
    score: "62",
    type: "INFERRED" as const,
    detail: "Availability after external pressure"
  },
  {
    name: "Fixture appeal",
    score: "78",
    type: "INFERRED" as const,
    detail: "Opponent / occasion prior"
  },
  {
    name: "Weather",
    score: "—",
    type: "WAITING" as const,
    detail: "Activate in forecast window"
  },
  {
    name: "Momentum",
    score: "—",
    type: "WAITING" as const,
    detail: "Needs current sales / scans"
  }
];

export function LiveSignalGrid() {
  return (
    <div className="liveSignalGrid">
      {signals.map((s) => (
        <article className="liveSignalCard" key={s.name}>
          <div className="liveSignalTop">
            <span>{s.name}</span>
            <SignalBadge type={s.type} />
          </div>
          <div className="liveSignalScore">{s.score}</div>
          <div className="muted">{s.detail}</div>
        </article>
      ))}
    </div>
  );
}
