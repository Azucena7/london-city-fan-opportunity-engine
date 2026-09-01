import { SignalBadge } from "./SignalBadge";

const evidence = [
  {
    signal: "Territory opportunity",
    type: "STRUCTURAL" as const,
    value: "95 / 100",
    source: "Families + girls' football network + matchday access",
    note: "Modelled from the structural V1 dataset."
  },
  {
    signal: "Calendar whitespace",
    type: "MEASURED" as const,
    value: "95 / 100",
    source: "Competitor home fixtures and local inventory",
    note: "Current schedule-based opportunity layer."
  },
  {
    signal: "Attention pressure",
    type: "INFERRED" as const,
    value: "38 / 100",
    source: "Events, TV, holidays and competing sport",
    note: "Planning estimate; should be re-checked closer to fixture."
  },
  {
    signal: "Weather",
    type: "WAITING" as const,
    value: "—",
    source: "Reliable forecast window only",
    note: "Activates 5–7 days before matchday."
  },
  {
    signal: "Attendance momentum",
    type: "WAITING" as const,
    value: "—",
    source: "Sales / scans / recent demand",
    note: "Requires current club-side or verified attendance data."
  },
  {
    signal: "Fixture appeal",
    type: "INFERRED" as const,
    value: "78 / 100",
    source: "Opponent brand + likely demand + occasion",
    note: "Expert prior until enough observed club data exists."
  }
];

export function EvidenceList() {
  return (
    <div className="evidenceList">
      {evidence.map((e) => (
        <div className="evidenceRow" key={e.signal}>
          <div className="evidenceSignal">
            <strong>{e.signal}</strong>
            <SignalBadge type={e.type} />
          </div>
          <div className="evidenceValue">{e.value}</div>
          <div>
            <div className="evidenceSource">{e.source}</div>
            <div className="muted">{e.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
