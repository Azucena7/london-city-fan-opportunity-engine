const rows = [
  ["Territory opportunity", "STRUCTURAL", "Modelled from families, grassroots network and access."],
  ["Calendar whitespace", "STRUCTURAL", "Competitor home inventory and local fixture context."],
  ["Attention pressure", "MONITORED", "Events, TV, holidays and competing sport."],
  ["Weather", "LIVE", "Only activated inside a reliable forecast window."],
  ["Attendance momentum", "LIVE", "Requires current sales / scans / recent demand data."],
  ["Fixture appeal", "HEURISTIC", "Expert prior until enough observed club data replaces it."]
];

export function AiTransparency() {
  return (
    <section className="panel">
      <div className="sectionHeader">
        <div>
          <div className="eyebrow">MODEL TRANSPARENCY</div>
          <h3>What is automated, measured or inferred?</h3>
        </div>
      </div>

      <div className="transparencyTable">
        {rows.map(([signal, type, detail]) => (
          <div className="transparencyRow" key={signal}>
            <strong>{signal}</strong>
            <span className="signalType">{type}</span>
            <p>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
