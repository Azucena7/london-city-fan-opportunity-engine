"use client";

import { FormEvent, useMemo, useState } from "react";
import { SignalBadge } from "./SignalBadge";
import { accessLabel, accessScore } from "@/lib/access";
import { engineResponse, travelDelta } from "@/lib/travelDelta";
import { useLanguage } from "./LanguageProvider";

type Journey = {
  duration: number;
  startDateTime?: string;
  arrivalDateTime?: string;
  changes: number;
  walkingMinutes: number;
  disruptions: string[];
  legs: {
    mode: string;
    duration: number;
    departurePoint?: string;
    arrivalPoint?: string;
    instruction?: string | null;
    line?: string | null;
  }[];
};

type Geocode = {
  status: string;
  displayName?: string;
  postcode?: string | null;
  scope?: "london" | "national";
  locality?: string;
  reason?: string;
};

type Payload = {
  status: string;
  reason?: string;
  source?: string;
  generated_at?: string;
  journeys?: Journey[];
};

function bestJourney(data: Payload | null) {
  if (!data?.journeys?.length) return null;
  return [...data.journeys].sort((a, b) => a.duration - b.duration)[0];
}

function scoreJourney(journey: Journey | null) {
  if (!journey) return null;

  return accessScore({
    duration: journey.duration,
    changes: journey.changes,
    walkingMinutes: journey.walkingMinutes,
    disruptions: journey.disruptions.length
  });
}

function localizedAccessLabel(score: number, lang: "en" | "es") {
  const label = accessLabel(score);
  if (lang === "en") return label;
  if (label === "LOW FRICTION") return "FRICCIÓN BAJA";
  if (label === "GOOD") return "BUENO";
  if (label === "MANAGEABLE") return "GESTIONABLE";
  return "FRICCIÓN ALTA";
}

function targetArrival(kickoff?: string) {
  if (!kickoff) return undefined;

  const parts = kickoff.split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return undefined;

  const total = parts[0] * 60 + parts[1] - 45;
  const safe = (total + 24 * 60) % (24 * 60);

  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

export function JourneyPlanner({
  matchDate,
  matchKickoff
}: {
  matchDate?: string;
  matchKickoff?: string;
}) {
  const { t, lang } = useLanguage();

  const [origin, setOrigin] = useState("");
  const [resolved, setResolved] = useState<Geocode | null>(null);
  const [normalData, setNormalData] = useState<Payload | null>(null);
  const [matchdayData, setMatchdayData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);

  const arrivalTime = targetArrival(matchKickoff);

  async function loadJourney(
    geo: Geocode,
    scenario: "normal" | "matchday"
  ): Promise<Payload> {
    const params = new URLSearchParams();

    if (scenario === "matchday" && matchDate && arrivalTime) {
      params.set("date", matchDate);
      params.set("time", arrivalTime);
    }

    if (geo.scope === "london") {
      params.set("from", origin.trim());

      if (scenario === "matchday" && matchDate && arrivalTime) {
        params.set("timeIs", "Arriving");
      }

      const response = await fetch(`/api/journey?${params.toString()}`);
      return response.json();
    }

    if (geo.postcode) params.set("postcode", geo.postcode);

    const response = await fetch(
      `/api/national-journey?${params.toString()}`
    );

    return response.json();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!origin.trim()) return;

    setLoading(true);
    setResolved(null);
    setNormalData(null);
    setMatchdayData(null);

    try {
      const geoResponse = await fetch(
        `/api/geocode?q=${encodeURIComponent(origin.trim())}`
      );
      const geo: Geocode = await geoResponse.json();
      setResolved(geo);

      if (geo.status !== "resolved") {
        setNormalData({
          status: "unavailable",
          reason: geo.reason ?? t.travel.routeUnavailable
        });
        return;
      }

      const normalPromise = loadJourney(geo, "normal");

      const canPlanMatchday = Boolean(matchDate && arrivalTime);
      const matchdayPromise = canPlanMatchday
        ? loadJourney(geo, "matchday")
        : Promise.resolve<Payload>({
            status: "unavailable",
            reason:
              lang === "es"
                ? "Falta una fecha u hora de inicio verificadas para calcular el escenario del día de partido."
                : "A verified fixture date or kickoff is required for the matchday scenario."
          });

      const [normal, matchday] = await Promise.all([
        normalPromise,
        matchdayPromise
      ]);

      setNormalData(normal);
      setMatchdayData(matchday);
    } catch {
      setNormalData({
        status: "unavailable",
        reason: t.travel.routeUnavailable
      });
    } finally {
      setLoading(false);
    }
  }

  const normal = useMemo(() => bestJourney(normalData), [normalData]);
  const matchday = useMemo(() => bestJourney(matchdayData), [matchdayData]);

  const normalScore = useMemo(() => scoreJourney(normal), [normal]);
  const matchdayScore = useMemo(() => scoreJourney(matchday), [matchday]);

  const delta =
    normal &&
    matchday &&
    normalScore !== null &&
    matchdayScore !== null
      ? travelDelta(normal, matchday, normalScore, matchdayScore)
      : null;

  const response = delta ? engineResponse(delta, lang) : null;

  return (
    <section className="journeyPlanner">
      <div className="journeyIntro">
        <div>
          <div className="eyebrow">
            {lang === "es" ? "TRAYECTO INDIVIDUAL" : "FAN JOURNEY"}
          </div>
          <h2>
            {lang === "es"
              ? "¿Se complica este trayecto el día de partido?"
              : "Does matchday make this journey harder?"}
          </h2>
          <p className="muted">
            {lang === "es"
              ? "Comparamos el trayecto actual con el trayecto planificado para llegar a Hayes Lane 45 minutos antes del inicio."
              : "The engine compares the current journey with the scheduled matchday journey arriving at Hayes Lane 45 minutes before kickoff."}
          </p>
        </div>

        <div className="journeyDestination">
          <span>{t.common.destination}</span>
          <strong>Hayes Lane</strong>
          <small>
            {matchDate ?? "—"} · {matchKickoff ?? "—"} {lang === "es" ? "hora de inicio" : "kickoff"}
          </small>
        </div>
      </div>

      <form className="journeyForm deltaForm" onSubmit={submit}>
        <label>
          <span>{t.travel.originLabel}</span>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={t.travel.originPlaceholder}
          />
        </label>

        <div className="arrivalTarget">
          <span>
            {lang === "es" ? "Llegada objetivo" : "Target arrival"}
          </span>
          <strong>{arrivalTime ?? "—"}</strong>
        </div>

        <button
          className="journeySubmit"
          type="submit"
          disabled={loading || !origin.trim()}
        >
          {loading
            ? lang === "es"
              ? "Comparando…"
              : "Comparing…"
            : lang === "es"
            ? "Comparar trayectos"
            : "Compare journeys"}
        </button>
      </form>

      {resolved?.status === "resolved" && (
        <div className="originResolution">
          <div>
            <span>{t.travel.originRecognised}</span>
            <strong>{resolved.locality ?? origin}</strong>
            <small>{resolved.displayName}</small>
          </div>
          <div>
            <span>{t.travel.routingLayer}</span>
            <strong>
              {resolved.scope === "london" ? "TfL" : t.travel.gb}
            </strong>
            <small>
              {resolved.scope === "national" && resolved.postcode
                ? `${lang === "es" ? "Punto representativo" : "Representative routing point"}: ${resolved.postcode}`
                : resolved.postcode ?? t.travel.noPostcode}
            </small>
          </div>
        </div>
      )}

      {(normalData?.status === "needs_credentials" ||
        matchdayData?.status === "needs_credentials") && (
        <div className="nationalSetup">
          <SignalBadge type="WAITING" />
          <div>
            <strong>{t.travel.nationalSetup}</strong>
            <p>
              {lang === "es"
                ? "El origen está reconocido. Los trayectos de Londres están disponibles; la capa nacional de rutas todavía no está conectada."
                : "The origin is recognised. London journeys are available; the national routing layer is not connected yet."}
            </p>
          </div>
        </div>
      )}

      {normalData?.status === "unavailable" && !normal && (
        <div className="journeyError">
          <SignalBadge type="WAITING" />
          <strong>{t.travel.routeUnavailable}</strong>
          <span>{normalData.reason}</span>
        </div>
      )}

      {normal && normalScore !== null && (
        <div className="deltaComparison">
          <ScenarioCard
            title={lang === "es" ? "Trayecto actual" : "Current journey"}
            subtitle={lang === "es" ? "Referencia observada ahora" : "Observed baseline now"}
            journey={normal}
            score={normalScore}
            lang={lang}
          />

          <div className="deltaArrow">→</div>

          {matchday && matchdayScore !== null ? (
            <ScenarioCard
              title={lang === "es" ? "Trayecto del día de partido" : "Matchday journey"}
              subtitle={
                arrivalTime
                  ? `${lang === "es" ? "Llegada objetivo" : "Target arrival"} ${arrivalTime}`
                  : ""
              }
              journey={matchday}
              score={matchdayScore}
              lang={lang}
            />
          ) : (
            <div className="scenarioCard waitingScenario">
              <SignalBadge type="WAITING" />
              <h3>
                {lang === "es"
                  ? "Escenario del día de partido no disponible"
                  : "Matchday scenario unavailable"}
              </h3>
              <p className="muted">{matchdayData?.reason}</p>
            </div>
          )}
        </div>
      )}

      {delta && response && (
        <section className={`engineResponse ${delta.severity}`}>
          <div className="engineResponseTop">
            <div>
              <div className="eyebrow">
                {lang === "es" ? "RESPUESTA DEL SISTEMA" : "ENGINE RESPONSE"}
              </div>
              <h3>{response.title}</h3>
            </div>
            <div className="responseLabel">{response.label}</div>
          </div>

          <div className="deltaMetrics">
            <div>
              <span>{lang === "es" ? "Cambio de tiempo" : "Time delta"}</span>
              <strong>
                {delta.durationDelta > 0 ? "+" : ""}
                {delta.durationDelta} min
              </strong>
            </div>
            <div>
              <span>{lang === "es" ? "Cambio en la puntuación de acceso" : "Access Score delta"}</span>
              <strong>
                {delta.scoreDelta > 0 ? "+" : ""}
                {delta.scoreDelta}
              </strong>
            </div>
            <div>
              <span>{lang === "es" ? "Severidad" : "Severity"}</span>
              <strong>{delta.severity.toUpperCase()}</strong>
            </div>
          </div>

          <p>{response.text}</p>

          <div className="sampleWarning">
            {lang === "es"
              ? "Importante: un trayecto individual no debe mover presupuesto territorial por sí solo. Cualquier cambio de inversión requiere que el patrón se repita de forma consistente en varios orígenes del territorio."
              : "Important: one individual journey should not move territory budget by itself. Spend changes require the pattern to repeat across multiple origins in the territory."}
          </div>
        </section>
      )}
    </section>
  );
}

function ScenarioCard({
  title,
  subtitle,
  journey,
  score,
  lang
}: {
  title: string;
  subtitle: string;
  journey: Journey;
  score: number;
  lang: "en" | "es";
}) {
  return (
    <article className="scenarioCard">
      <div className="scenarioTop">
        <div>
          <div className="eyebrow">{title}</div>
          <span className="muted">{subtitle}</span>
        </div>
        <div className="scenarioScore">
          <strong>{score}</strong>
          <span>{localizedAccessLabel(score, lang)}</span>
        </div>
      </div>

      <div className="scenarioDuration">{journey.duration} min</div>

      <div className="scenarioFacts">
        <div>
          <span>{lang === "es" ? "Transbordos" : "Changes"}</span>
          <strong>{journey.changes}</strong>
        </div>
        <div>
          <span>{lang === "es" ? "A pie" : "Walking"}</span>
          <strong>{journey.walkingMinutes} min</strong>
        </div>
        <div>
          <span>{lang === "es" ? "Incidencias" : "Disruptions"}</span>
          <strong>{journey.disruptions.length}</strong>
        </div>
      </div>

      {journey.disruptions.length > 0 && (
        <div className="scenarioDisruptions">
          {journey.disruptions.slice(0, 2).map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
      )}
    </article>
  );
}
