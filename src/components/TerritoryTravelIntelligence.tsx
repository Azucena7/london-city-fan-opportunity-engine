"use client";

import { useMemo, useState } from "react";
import { accessScore } from "@/lib/access";
import { territoryAction, TerritoryTravelSeed } from "@/lib/territoryTravel";
import { travelDelta } from "@/lib/travelDelta";
import { useLanguage } from "./LanguageProvider";
import { FrictionBadge } from "./FrictionBadge";

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

function score(journey: Journey | null) {
  if (!journey) return null;
  return accessScore({
    duration: journey.duration,
    changes: journey.changes,
    walkingMinutes: journey.walkingMinutes,
    disruptions: journey.disruptions
  });
}

function median(values: number[]) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
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
  const es = lang === "es";

  const [selected, setSelected] = useState(territories[0]?.territory_id ?? "");
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
      const response = await fetch(`/api/territory-travel?${params.toString()}`);
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    return (data?.results ?? []).map((result) => {
      const normalScore = score(result.normal);
      const matchdayScore = score(result.matchday);

      const delta =
        result.normal &&
        result.matchday &&
        normalScore !== null &&
        matchdayScore !== null
          ? travelDelta(
              {
                duration: result.normal.duration,
                changes: result.normal.changes,
                walkingMinutes: result.normal.walkingMinutes,
                disruptions: Array(result.normal.disruptions).fill("")
              },
              {
                duration: result.matchday.duration,
                changes: result.matchday.changes,
                walkingMinutes: result.matchday.walkingMinutes,
                disruptions: Array(result.matchday.disruptions).fill("")
              },
              normalScore,
              matchdayScore
            )
          : null;

      return { ...result, normalScore, matchdayScore, delta };
    });
  }, [data]);

  const aggregate = useMemo(() => {
    if (!rows.length) return null;

    const valid = rows.filter((row) => row.delta !== null);
    const requiredValid = Math.max(2, Math.ceil(rows.length * (2 / 3)));

    if (!valid.length) {
      return {
        validCount: 0,
        requiredValid,
        enoughSample: false,
        medianDurationDelta: 0,
        medianScoreDelta: 0,
        highShare: 0,
        action: null
      };
    }

    const medianDurationDelta = median(valid.map((row) => row.delta?.durationDelta ?? 0));
    const medianScoreDelta = median(valid.map((row) => row.delta?.scoreDelta ?? 0));
    const highShare = valid.filter((row) => row.delta?.severity === "high").length / valid.length;
    const watchShare = valid.filter((row) => row.delta?.severity === "watch").length / valid.length;
    const enoughSample = valid.length >= requiredValid;

    return {
      validCount: valid.length,
      requiredValid,
      enoughSample,
      medianDurationDelta: Math.round(medianDurationDelta),
      medianScoreDelta: Math.round(medianScoreDelta),
      highShare,
      action: enoughSample
        ? territoryAction(
            { medianDurationDelta, medianScoreDelta, highShare, watchShare },
            lang
          )
        : null
    };
  }, [rows, lang]);

  return (
    <section className="territoryTravelPanel">
      <div className="territoryTravelIntro">
        <div>
          <div className="eyebrow">{es ? "ACCESO TERRITORIAL" : "TERRITORY ACCESS"}</div>
          <h2>{es ? "¿Puede este territorio llegar realmente a Hayes Lane?" : "Can this territory actually get to Hayes Lane?"}</h2>
          <p className="muted">
            {es
              ? "Comparamos varios orígenes representativos dentro de cada territorio. El acceso puede informar la estrategia sin extrapolar desde una sola persona."
              : "The engine compares multiple representative origins within each territory, so travel can inform strategy without extrapolating from one fan."}
          </p>
        </div>

        <div className="fixtureContextMini">
          <span>{es ? "Día de partido" : "Matchday"}</span>
          <strong>{matchDate ?? "—"}</strong>
          <small>{es ? "Llegada objetivo" : "Target arrival"} {targetArrival ?? "—"}</small>
        </div>
      </div>

      <div className="territoryTravelControls">
        <label>
          <span>{es ? "Territorio" : "Territory"}</span>
          <select value={selected} onChange={(event) => setSelected(event.target.value)}>
            {territories.map((territory) => (
              <option key={territory.territory_id} value={territory.territory_id}>
                {territory.territory_name}
              </option>
            ))}
          </select>
        </label>

        <button onClick={run} disabled={loading}>
          {loading ? (es ? "Analizando…" : "Analysing…") : (es ? "Analizar territorio" : "Analyse territory")}
        </button>
      </div>

      {rows.length > 0 && (
        <div className="territoryOriginRows">
          {rows.map((row) => (
            <div className="territoryOriginRow" key={row.origin.label}>
              <div>
                <strong>{row.origin.label}</strong>
                <span>{es ? "Origen representativo" : "Representative origin"}</span>
              </div>

              <div>
                <span>{es ? "Ahora" : "Now"}</span>
                <strong>{row.normal ? `${row.normal.duration} min · ${row.normalScore}` : "—"}</strong>
              </div>

              <div>
                <span>{es ? "Día de partido" : "Matchday"}</span>
                <strong>{row.matchday ? `${row.matchday.duration} min · ${row.matchdayScore}` : "—"}</strong>
              </div>

              <div>
                <span>{es ? "Cambio" : "Delta"}</span>
                <strong>
                  {row.delta
                    ? `${row.delta.durationDelta > 0 ? "+" : ""}${row.delta.durationDelta} min`
                    : "—"}
                </strong>
              </div>

              <div>
                <FrictionBadge state={row.delta?.severity ?? "waiting"} />
              </div>
            </div>
          ))}
        </div>
      )}

      {aggregate && !aggregate.enoughSample && (
        <section className="territorySampleHold">
          <FrictionBadge state="waiting" />
          <div>
            <strong>{es ? "Muestra insuficiente para una respuesta territorial" : "Not enough evidence for a territory response"}</strong>
            <p>
              {es
                ? `${aggregate.validCount} de ${rows.length} orígenes devolvieron trayectos comparables. Se requieren al menos ${aggregate.requiredValid} para emitir una respuesta territorial.`
                : `${aggregate.validCount} of ${rows.length} origins returned comparable journeys. At least ${aggregate.requiredValid} are required before issuing a territory response.`}
            </p>
          </div>
        </section>
      )}

      {aggregate?.enoughSample && aggregate.action && (
        <section className="territoryAggregate">
          <div className="territoryAggregateTop">
            <div>
              <div className="eyebrow">{es ? "RESPUESTA TERRITORIAL" : "TERRITORY RESPONSE"}</div>
              <h3>{aggregate.action.title}</h3>
            </div>
            <div className="territoryActionCode">{aggregate.action.code}</div>
          </div>

          <div className="territoryAggregateMetrics">
            <div>
              <span>{es ? "Orígenes válidos" : "Valid origins"}</span>
              <strong>{aggregate.validCount} / {rows.length}</strong>
            </div>
            <div>
              <span>{es ? "Mediana de tiempo" : "Median time delta"}</span>
              <strong>{aggregate.medianDurationDelta > 0 ? "+" : ""}{aggregate.medianDurationDelta} min</strong>
            </div>
            <div>
              <span>{es ? "Mediana de acceso" : "Median Access delta"}</span>
              <strong>{aggregate.medianScoreDelta > 0 ? "+" : ""}{aggregate.medianScoreDelta}</strong>
            </div>
            <div>
              <span>{es ? "Fricción alta" : "High friction"}</span>
              <strong>{Math.round(aggregate.highShare * 100)}%</strong>
            </div>
          </div>

          <p>{aggregate.action.text}</p>

          <div className="territoryEvidenceNote">
            {es
              ? "Regla de muestra: la respuesta requiere trayectos válidos para al menos 2/3 de los orígenes representativos. Usamos la mediana para reducir el efecto de un origen atípico. Los puntos actuales son orígenes de prototipo, no centroides oficiales LSOA."
              : "Sample rule: a territory response requires valid journeys for at least two-thirds of representative origins. Medians reduce the influence of an outlier origin. Current points are prototype origins, not official LSOA centroids."}
          </div>
        </section>
      )}
    </section>
  );
}
