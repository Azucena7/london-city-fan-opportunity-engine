function getScore(item: any) {
  return item.opportunityScore ?? item.opportunity_score ?? item.finalOpportunity ?? item.score ?? 0;
}

function getName(item: any) {
  return item.name ?? item.lsoaName ?? item.lsoa ?? item.id ?? "Unknown";
}

export function TerritoryCards({ items }: { items: any[] }) {
  const ranked = [...items]
    .sort((a,b) => getScore(b) - getScore(a))
    .slice(0,8);

  return (
    <div className="territoryCards">
      {ranked.map((t, i) => (
        <article className="territoryCard" key={`${getName(t)}-${i}`}>
          <div className="territoryCardTop">
            <span className="eyebrow">#{String(i + 1).padStart(2,"0")}</span>
            <span className="territoryBigScore">{getScore(t)}</span>
          </div>
          <h3>{getName(t)}</h3>
          <p className="muted">{t.borough ?? t.area ?? "Priority South London territory"}</p>
          <div className="territoryMeta">
            <div><span>Families</span><strong>{t.familyScore ?? t.family_score ?? "—"}</strong></div>
            <div><span>Girls network</span><strong>{t.girlsNetworkScore ?? t.girls_network_score ?? "—"}</strong></div>
            <div><span>Travel</span><strong>{t.travelMinutes ?? t.travel_minutes ?? "—"}{(t.travelMinutes ?? t.travel_minutes) ? " min" : ""}</strong></div>
            <div><span>Competition</span><strong>{t.competitionPressure ?? t.competition_pressure ?? "—"}</strong></div>
          </div>
          <div className="strategyLine">
            {t.strategy ?? t.play ?? "ATTACK / TEST"}
          </div>
        </article>
      ))}
    </div>
  );
}
