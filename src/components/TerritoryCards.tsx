"use client";

import { useLanguage } from "./LanguageProvider";
import type { Territory } from "@/lib/models";

function opportunityScore(t: Territory) {
  return Number(t.opportunityScore ?? t.finalOpportunity ?? t.score ?? 0);
}

function territoryName(t: Territory) {
  return String(t.name ?? t.lsoaName ?? t.lsoa ?? t.id ?? "Unknown");
}

function numberOrDash(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "—";
}

export function TerritoryCards({ items }: { items: Territory[] }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const ranked = [...items].sort((a, b) => opportunityScore(b) - opportunityScore(a)).slice(0, 8);

  return (
    <div className="territoryCards">
      {ranked.map((territory, index) => {
        const households = territory.householdsWithDependentChildren;
        const density = territory.familyDensity;
        const travel = territory.sundayTravelMinutes ?? territory.travelMinutes;
        const transfers = territory.transfers;
        const competition = territory.competitionPressure;

        return (
          <article className="territoryCard block15TerritoryCard" key={`${territoryName(territory)}-${index}`}>
            <div className="territoryCardTop">
              <span className="eyebrow">#{String(index + 1).padStart(2, "0")}</span>
              <div className="territoryScoreLockup">
                <span>{es ? "Oportunidad" : "Opportunity"}</span>
                <strong className="territoryBigScore">{opportunityScore(territory)}</strong>
              </div>
            </div>

            <h3>{territoryName(territory)}</h3>
            <p className="muted">
              {String(territory.borough ?? territory.area ?? (es ? "Territorio prioritario de South London" : "Priority South London territory"))}
            </p>

            <div className="territoryMeta block15TerritoryMeta">
              <div>
                <span>{es ? "Hogares con menores" : "Dependent-child HH"}</span>
                <strong>{numberOrDash(households)}</strong>
                <small>{density !== undefined ? `${es ? "Densidad" : "Density"} ${numberOrDash(density)}` : ""}</small>
              </div>
              <div>
                <span>{es ? "Red de fútbol femenino" : "Girls network"}</span>
                <strong>{numberOrDash(territory.girlsNetworkScore)}</strong>
                <small>{es ? "Capacidad de distribución" : "Distribution strength"}</small>
              </div>
              <div>
                <span>{es ? "Acceso en domingo" : "Sunday access"}</span>
                <strong>{typeof travel === "number" ? `${travel} min` : "—"}</strong>
                <small>
                  {typeof transfers === "number"
                    ? `${transfers} ${es ? (transfers === 1 ? "transbordo" : "transbordos") : transfers === 1 ? "change" : "changes"}`
                    : ""}
                </small>
              </div>
              <div className="competitionContextMetric">
                <span>{es ? "Contexto competitivo" : "Competition context"}</span>
                <strong>{numberOrDash(competition)}</strong>
                <small>{es ? "No se resta" : "Not deducted"}</small>
              </div>
            </div>

            <div className="territoryMeaning">
              <strong>{es ? "Oportunidad estructural" : "Structural opportunity"}</strong>
              <span>{es ? "No es una decisión de campaña por sí sola." : "Not a campaign decision on its own."}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
