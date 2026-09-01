function getScore(item: any) {
  return item.opportunityScore ?? item.opportunity_score ?? item.finalOpportunity ?? item.score ?? 0;
}

function getName(item: any) {
  return item.name ?? item.lsoaName ?? item.lsoa ?? item.id ?? "Unknown";
}

const positions = [
  { left: 64, top: 18 },
  { left: 23, top: 26 },
  { left: 73, top: 48 },
  { left: 17, top: 56 },
  { left: 50, top: 72 },
  { left: 36, top: 12 },
  { left: 82, top: 72 },
  { left: 8, top: 78 }
];

export function TerritoryMap({ items }: { items: any[] }) {
  const ranked = [...items]
    .sort((a,b) => getScore(b) - getScore(a))
    .slice(0,8);

  return (
    <section className="mapPanel">
      <div className="mapHeader">
        <div>
          <div className="eyebrow">SOUTH LONDON OPPORTUNITY VIEW</div>
          <h3>Where should acquisition start?</h3>
        </div>
        <span className="muted">Schematic — not to geographic scale</span>
      </div>

      <div className="territoryMap">
        <div className="mapRing ring1" />
        <div className="mapRing ring2" />
        <div className="mapRing ring3" />

        <div className="hayesLane">
          <div className="hayesDot" />
          <strong>Hayes Lane</strong>
          <span>Home</span>
        </div>

        {ranked.map((t, i) => {
          const p = positions[i] ?? positions[0];
          const score = getScore(t);
          return (
            <div
              className={`mapNode ${score >= 90 ? "priority" : ""}`}
              key={`${getName(t)}-${i}`}
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
            >
              <span className="mapScore">{score}</span>
              <div>
                <strong>{getName(t)}</strong>
                <small>{t.borough ?? t.area ?? "Priority territory"}</small>
              </div>
            </div>
          );
        })}

        <div className="mapLabel north">NORTH</div>
        <div className="mapLegend">
          <span><i className="legendDot priorityDot" /> 90+ priority</span>
          <span><i className="legendDot" /> opportunity territory</span>
        </div>
      </div>
    </section>
  );
}
