"use client";

import { FormEvent, useMemo, useState } from "react";
import { SignalBadge } from "./SignalBadge";
import { accessLabel, accessScore } from "@/lib/access";

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

export function JourneyPlanner({
  matchDate
}: {
  matchDate?: string;
}) {
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
          reason: geo.reason ?? "Origin could not be resolved."
        });
        return;
      }

      const params = new URLSearchParams();

      if (mode === "matchday" && matchDate) {
        params.set("date", matchDate);
        params.set("time", "12:00");
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
        reason: "Journey services could not be reached."
      });
    } finally {
      setLoading(false);
    }
  }

  const best = useMemo(() => {
    if (!data?.journeys?.length) return null;
    return [...data.journeys].sort((a,b) => a.duration - b.duration)[0];
  }, [data]);

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
          <div className="eyebrow">UK → HAYES LANE</div>
          <h2>Where are you coming from?</h2>
          <p className="muted">
            The engine now resolves the origin first. London journeys route through
            TfL; origins elsewhere in Great Britain route through the national layer.
          </p>
        </div>
        <div className="journeyDestination">
          <span>Destination</span>
          <strong>Hayes Lane</strong>
          <small>Bromley · BR2 9EF</small>
        </div>
      </div>

      <form className="journeyForm" onSubmit={submit}>
        <label>
          <span>Postcode, station, town or city</span>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Cambridge, CR0 7AB, London Bridge"
          />
        </label>

        <div className="journeyMode">
          <button
            type="button"
            className={mode === "now" ? "active" : ""}
            onClick={() => setMode("now")}
          >
            Travel now
          </button>
          <button
            type="button"
            disabled={!matchDate}
            className={mode === "matchday" ? "active" : ""}
            onClick={() => setMode("matchday")}
          >
            Matchday
          </button>
        </div>

        <button className="journeySubmit" type="submit" disabled={loading || !origin.trim()}>
          {loading ? "Resolving…" : "Check journey"}
        </button>
      </form>

      {resolved?.status === "resolved" && (
        <div className="originResolution">
          <div>
            <span>Origin recognised</span>
            <strong>{resolved.locality ?? origin}</strong>
            <small>{resolved.displayName}</small>
          </div>
          <div>
            <span>Routing layer</span>
            <strong>
              {resolved.scope === "london" ? "TfL" : "Great Britain"}
            </strong>
            <small>{resolved.postcode ?? "No postcode returned"}</small>
          </div>
        </div>
      )}

      {data?.status === "needs_credentials" && (
        <div className="nationalSetup">
          <SignalBadge type="WAITING" />
          <div>
            <strong>National origin recognised — routing layer needs activation</strong>
            <p>{data.reason}</p>
            <small>
              Once the two TransportAPI environment variables are added in Vercel,
              Cambridge and other GB origins can return multimodal routes here.
            </small>
          </div>
        </div>
      )}

      {(data?.status === "unavailable" || data?.status === "needs_postcode") && (
        <div className="journeyError">
          <SignalBadge type="WAITING" />
          <strong>Journey unavailable</strong>
          <span>{data.reason}</span>
        </div>
      )}

      {best && score !== null && (
        <div className="journeyResult">
          <div className="accessScoreBlock">
            <div className="eyebrow">ACCESS SCORE</div>
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
              <div><span>Changes</span><strong>{best.changes}</strong></div>
              <div><span>Walking</span><strong>{best.walkingMinutes} min</strong></div>
              <div>
                <span>Provider</span>
                <strong>{data.source ?? "Journey planner"}</strong>
              </div>
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
          <span>Source: {data.source}</span>
          <span>
            Checked {data.generated_at ? new Date(data.generated_at).toLocaleString() : "now"}
          </span>
        </div>
      )}
    </section>
  );
}
