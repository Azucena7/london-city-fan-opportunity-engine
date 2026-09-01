"use client";

import { FormEvent, useMemo, useState } from "react";
import { SignalBadge } from "./SignalBadge";
import { accessLabel, accessScore } from "@/lib/access";
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

function localTime(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function JourneyPlanner({ matchDate, matchKickoff }: { matchDate?: string; matchKickoff?: string }) {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState("");
  const [mode, setMode] = useState<"now" | "matchday">("now");
  const [data, setData] = useState<Payload | null>(null);
  const [resolved, setResolved] = useState<Geocode | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!origin.trim()) return;

    setLoading(true);
    setData(null);
    setResolved(null);

    try {
      const geoResponse = await fetch(
        `/api/geocode?q=${encodeURIComponent(origin.trim())}`
      );
      const geo: Geocode = await geoResponse.json();
      setResolved(geo);

      if (geo.status !== "resolved") {
        setData({
          status: "unavailable",
          reason: geo.reason ?? t.travel.routeUnavailable
        });
        return;
      }

      const params = new URLSearchParams();

      if (mode === "matchday" && matchDate) {
        params.set("date", matchDate);
        const [h,m] = (matchKickoff ?? "15:00").split(":").map(Number);
        const total = h * 60 + m - 45;
        params.set("time", `${String(Math.floor(total / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`);
      }

      let endpoint: string;

      if (geo.scope === "london") {
        params.set("from", origin.trim());
        endpoint = `/api/journey?${params.toString()}`;
      } else {
        if (geo.postcode) params.set("postcode", geo.postcode);
        endpoint = `/api/national-journey?${params.toString()}`;
      }

      const journeyResponse = await fetch(endpoint);
      const journeyData = await journeyResponse.json();
      setData(journeyData);
    } catch {
      setData({
        status: "unavailable",
        reason: t.travel.routeUnavailable
      });
    } finally {
      setLoading(false);
    }
  }

  const best = useMemo(() => {
    if (!data?.journeys?.length) return null;
    return [...data.journeys].sort((a,b) => a.duration - b.duration)[0];
  }, [data]);

  const provider = data?.source ?? "Journey planner";

  const score = best
    ? accessScore({
        duration: best.duration,
        changes: best.changes,
        walkingMinutes: best.walkingMinutes,
        disruptions: best.disruptions.length
      })
    : null;

  return (
    <section className="journeyPlanner">
      <div className="journeyIntro">
        <div>
          <div className="eyebrow">{t.travel.ukToHayes}</div>
          <h2>{t.travel.whereFrom}</h2>
          <p className="muted">{t.travel.helper}</p>
        </div>
        <div className="journeyDestination">
          <span>{t.common.destination}</span>
          <strong>Hayes Lane</strong>
          <small>Bromley · BR2 9EF</small>
        </div>
      </div>

      <form className="journeyForm" onSubmit={submit}>
        <label>
          <span>{t.travel.originLabel}</span>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={t.travel.originPlaceholder}
          />
        </label>

        <div className="journeyMode">
          <button
            type="button"
            className={mode === "now" ? "active" : ""}
            onClick={() => setMode("now")}
          >
            {t.travel.travelNow}
          </button>
          <button
            type="button"
            disabled={!matchDate}
            className={mode === "matchday" ? "active" : ""}
            onClick={() => setMode("matchday")}
          >
            {t.travel.matchday}
          </button>
        </div>

        <button className="journeySubmit" type="submit" disabled={loading || !origin.trim()}>
          {loading ? t.travel.resolving : t.travel.check}
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
            <strong>{resolved.scope === "london" ? "TfL" : t.travel.gb}</strong>
            <small>{resolved.postcode ?? t.travel.noPostcode}</small>
          </div>
        </div>
      )}

      {data?.status === "needs_credentials" && (
        <div className="nationalSetup">
          <SignalBadge type="WAITING" />
          <div>
            <strong>{t.travel.nationalSetup}</strong>
            <p>{data.reason}</p>
          </div>
        </div>
      )}

      {(data?.status === "unavailable" || data?.status === "needs_postcode") && (
        <div className="journeyError">
          <SignalBadge type="WAITING" />
          <strong>{t.travel.routeUnavailable}</strong>
          <span>{data.reason}</span>
        </div>
      )}

      {best && score !== null && (
        <div className="journeyResult">
          <div className="accessScoreBlock">
            <div className="eyebrow">{t.travel.accessScore}</div>
            <div className="accessScore">{score}</div>
            <div className="accessLabel">{accessLabel(score)}</div>
          </div>

          <div className="journeySummary">
            <div className="journeyBig">
              {best.duration} min
              <span>
                {localTime(best.startDateTime)} → {localTime(best.arrivalDateTime)}
              </span>
            </div>

            <div className="journeyFacts">
              <div><span>{t.common.changes}</span><strong>{best.changes}</strong></div>
              <div><span>{t.common.walking}</span><strong>{best.walkingMinutes} min</strong></div>
              <div><span>{t.common.provider}</span><strong>{provider}</strong></div>
            </div>

            <div className="journeyLegs">
              {best.legs.map((leg, i) => (
                <div className="journeyLeg" key={`${leg.mode}-${i}`}>
                  <span className="legNumber">{i + 1}</span>
                  <div>
                    <strong>{leg.mode}{leg.line ? ` · ${leg.line}` : ""}</strong>
                    <small>
                      {leg.departurePoint ?? "Start"} → {leg.arrivalPoint ?? "Next"}
                      {" · "}{leg.duration} min
                    </small>
                    {leg.instruction && <p>{leg.instruction}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data?.status === "live" && (
        <div className="journeySource">
          <span>{t.common.source}: {provider}</span>
          <span>
            {t.common.checked} {data.generated_at ? new Date(data.generated_at).toLocaleString() : "now"}
          </span>
        </div>
      )}
    </section>
  );
}
