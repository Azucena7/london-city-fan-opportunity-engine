function getScore(item: any) {
  return (
    item.opportunityScore ??
    item.opportunity_score ??
    item.finalOpportunity ??
    item.score ??
    0
  );
}

function getName(item: any) {
  return item.name ?? item.lsoaName ?? item.lsoa ?? item.id ?? "Unknown";
}

export function TerritoryList({ items }: { items: any[] }) {
  const sorted = [...items]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 6);

  return (
    <div className="territoryList">
      {sorted.map((item, index) => (
        <div className="territoryRow" key={`${getName(item)}-${index}`}>
          <div>
            <span className="rank">{String(index + 1).padStart(2, "0")}</span>
            <strong>{getName(item)}</strong>
            <div className="muted">
              {item.borough ?? item.area ?? item.strategy ?? "Priority territory"}
            </div>
          </div>
          <div className="territoryScore">{getScore(item)}</div>
        </div>
      ))}
    </div>
  );
}
