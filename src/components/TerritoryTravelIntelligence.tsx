"use client";

import { useMemo, useState } from "react";
import { accessScore } from "@/lib/access";
import {
  territoryAction,
  TerritoryTravelSeed
} from "@/lib/territoryTravel";
import { travelDelta } from "@/lib/travelDelta";
import { useLanguage } from "./LanguageProvider";
import { SignalBadge } from "./SignalBadge";

type Journey = {
  duration: number;
  changes: number;
  walkingMinutes: number;
  disruptions: number;
};

type ApiResult = {
  origin: { label: string; query: string };
  normal: Journey | null;
  matchday: Journey | null;
};

type Payload = {
  status: string;
  territory?: TerritoryTravelSeed;
  source?: string;
  generated_at?: string;
  results?: ApiResult[];
};

function score(j: Journey | null) {
  if (!j) return null;
  return accessScore({
    duration: j.duration,
    changes: j.changes,
    walkingMinutes: j.walkingMinutes,
    disruptions: j.disruptions
  });
}

export function TerritoryTravelIntelligence({
  territories,
  matchDate,
  targetArrival
}: {
  territories: TerritoryTravelSeed[];
  matchDate?: string;
  targetArrival?: string;
}) {
  const { lang } = useLanguage();

  const [selected, setSelected] = useState(
    territories[0]?.territory_id ?? ""
  );
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!selected) return;

    setLoading(true);
    setData(null);

    const params = new URLSearchParams({ territory: selected });
    if (matchDate) params.set("date", matchDate);
    if (targetArrival) params.set("arrival", targetArrival);

    try {
      const response = await fetch(
        `/api/territory-travel?${params.toString()}`
      );
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    return (data?.results ?? []).map((r) => {
      const normalScore = score(r.normal);
      const matchdayScore = score(r.matchday);

      const delta =
        r.normal &&
        r.matchday &&
        normalScore !== null &&
        matchdayScore !== null
          ? travelDelta(
              {
                duration: r.normal.duration,
                changes: r.normal.changes,
                walkingMinutes: r.normal.walkingMinutes,
                disruptions: Array(r.normal.disruptions).fill("")
              },
              {
                duration: r.matchday.duration,
                changes: r.matchday.changes,
                walkingMinutes: r.matchday.walkingMinutes,
                disruptions: Array(r.matchday.disruptions).fill("")
              },
              normalScore,
              matchdayScore
            )
          : null;

      return {
        ...r,
        normalScore,
        matchdayScore,
        delta
      };
    });
  }, [data]);

  const aggregate = useMemo(() => {
    const valid = rows.filter((r) => r.delta);

    if (!valid.length) return null;

    const avgDurationDelta =
      valid.reduce((sum, r) => sum + (r.delta?.durationDelta ?? 0), 0) /
      valid.length;

    const avgScoreDelta =
      valid.reduce((sum, r) => sum + (r.delta?.scoreDelta ?? 0), 0) /
      valid.length;

    const highShare =
      valid.filter((r) => r.delta?.severity === "high").length /
      valid.length;

    const watchShare =
      valid.filter((r) => r.delta?.severity === "watch").length /
      valid.length;

    return {
      validCount: valid.length,
      avgDurationDelta: Math.round(avgDurationDelta),
      avgScoreDelta: Math.round(avgScoreDelta),
      highShare,
      watchShare,
      action: territoryAction(
        {
          avgDurationDelta,
          avgScoreDelta,
          highShare,
          watchShare
        },
        lang
      )
    };
  }, [rows, lang]);

  return (
    <section className="territoryTravelPanel">
      <div className="territoryTravelIntro">
        <div>
          <div className="eyebrow">
            {lang === "es"
              ? "INTELIGENCIA DE VIAJE TERRITORIAL"
              : "TERRITORY TRAVEL INTELLIGENCE"}
          </div>
          <h2>
            {lang === "es"
              ? "¿Es un problema individual o un patrón territorial?"
              : "Is travel friction individual — or territorial?"}
          </h2>
          <p className="muted">
            {lang === "es"
              ? "Comparamos varios orígenes representativos dentro de cada territorio. Esto permite que travel informe la estrategia sin extrapolar desde un solo fan."
              : "The engine compares multiple representative origins within each territory, so travel can inform strategy without extrapolating from one fan."}
          </p>
        </div>

        <div className="fixtureContextMini">
          <span>{lang === "es" ? "Matchday" : "Matchday"}</span>
          <strong>{matchDate ?? "—"}</strong>
          <small>
            {lang === "es" ? "Llegada objetivo" : "Target arrival"}{" "}
            {targetArrival ?? "—"}
          </small>
        </div>
      </div>

      <div className="territoryTravelControls">
        <label>
          <span>{lang === "es" ? "Territorio" : "Territory"}</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {territories.map((territory) => (
              <option
                key={territory.territory_id}
                value={territory.territory_id}
              >
                {territory.territory_name}
              </option>
            ))}
          </select>
        </label>

        <button onClick={run} disabled={loading}>
          {loading
            ? lang === "es"
              ? "Analizando…"
              : "Analysing…"
            : lang === "es"
            ? "Analizar territorio"
            : "Analyse territory"}
        </button>
      </div>

      {rows.length > 0 && (
        <div className="territoryOriginRows">
          {rows.map((row) => (
            <div className="territoryOriginRow" key={row.origin.label}>
              <div>
                <strong>{row.origin.label}</strong>
                <span>
                  {lang === "es"
                    ? "Origen representativo"
                    : "Representative origin"}
                </span>
              </div>

              <div>
                <span>{lang === "es" ? "Ahora" : "Now"}</span>
                <strong>
                  {row.normal
                    ? `${row.normal.duration} min · ${row.normalScore}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Matchday</span>
                <strong>
                  {row.matchday
                    ? `${row.matchday.duration} min · ${row.matchdayScore}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Delta</span>
                <strong>
                  {row.delta
                    ? `${row.delta.durationDelta > 0 ? "+" : ""}${
                        row.delta.durationDelta
                      } min`
                    : "—"}
                </strong>
              </div>

              <div>
                {row.delta ? (
                  <SignalBadge
                    type={
                      row.delta.severity === "high"
                        ? "INFERRED"
                        : row.delta.severity === "watch"
                        ? "MEASURED"
                        : "STRUCTURAL"
                    }
                  />
                ) : (
                  <SignalBadge type="WAITING" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {aggregate && (
        <section className="territoryAggregate">
          <div className="territoryAggregateTop">
            <div>
              <div className="eyebrow">
                {lang === "es"
                  ? "RESPUESTA TERRITORIAL"
                  : "TERRITORY RESPONSE"}
              </div>
              <h3>{aggregate.action.title}</h3>
            </div>
            <div className="territoryActionCode">
              {aggregate.action.code}
            </div>
          </div>

          <div className="territoryAggregateMetrics">
            <div>
              <span>
                {lang === "es"
                  ? "Orígenes válidos"
                  : "Valid origins"}
              </span>
              <strong>
                {aggregate.validCount} / {rows.length}
              </strong>
            </div>

            <div>
              <span>
                {lang === "es"
                  ? "Delta medio tiempo"
                  : "Avg time delta"}
              </span>
              <strong>
                {aggregate.avgDurationDelta > 0 ? "+" : ""}
                {aggregate.avgDurationDelta} min
              </strong>
            </div>

            <div>
              <span>
                {lang === "es"
                  ? "Delta medio Access"
                  : "Avg Access delta"}
              </span>
              <strong>
                {aggregate.avgScoreDelta > 0 ? "+" : ""}
                {aggregate.avgScoreDelta}
              </strong>
            </div>

            <div>
              <span>High friction</span>
              <strong>
                {Math.round(aggregate.highShare * 100)}%
              </strong>
            </div>
          </div>

          <p>{aggregate.action.text}</p>

          <div className="territoryEvidenceNote">
            {lang === "es"
              ? "Los puntos son orígenes representativos para prototipo, no centroides oficiales LSOA. El siguiente nivel sería usar centroides/isochrones exactos y ponderar por población objetivo."
              : "These are representative prototype origins, not official LSOA centroids. The next level is exact centroids/isochrones weighted by target population."}
          </div>
        </section>
      )}
    </section>
  );
}
