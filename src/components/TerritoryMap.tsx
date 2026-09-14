"use client";

import { useLanguage } from "./LanguageProvider";

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
  const { lang } = useLanguage();
  const es = lang === "es";
  const ranked = [...items]
    .sort((a,b) => getScore(b) - getScore(a))
    .slice(0,8);

  return (
    <section className="mapPanel">
      <div className="mapHeader">
        <div>
          <div className="eyebrow">{es ? "MAPA DE OPORTUNIDAD · SOUTH LONDON" : "SOUTH LONDON OPPORTUNITY VIEW"}</div>
          <h3>{es ? "¿Dónde debería empezar la captación?" : "Where should acquisition start?"}</h3>
        </div>
        <span className="muted">{es ? "Esquema orientativo · no está a escala" : "Schematic — not to geographic scale"}</span>
      </div>

      <div className="territoryMap">
        <div className="mapRing ring1" />
        <div className="mapRing ring2" />
        <div className="mapRing ring3" />

        <div className="hayesLane">
          <div className="hayesDot" />
          <strong>Hayes Lane</strong>
          <span>{es ? "Casa" : "Home"}</span>
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
                <small>{t.borough ?? t.area ?? (es ? "Territorio prioritario" : "Priority territory")}</small>
              </div>
            </div>
          );
        })}

        <div className="mapLabel north">NORTH</div>
        <div className="mapLegend">
          <span><i className="legendDot priorityDot" /> {es ? "90+ prioritario" : "90+ priority"}</span>
          <span><i className="legendDot" /> {es ? "territorio de oportunidad" : "opportunity territory"}</span>
        </div>
      </div>
    </section>
  );
}
