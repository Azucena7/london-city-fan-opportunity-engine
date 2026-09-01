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

type Payload = {
  status: string;
  reason?: string;
  source?: string;
  destination?: string;
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
  const [loading, setLoading] = useState(false);

  const matchDateAvailable = Boolean(matchDate);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!origin.trim()) return;

    setLoading(true);
    setData(null);

    const params = new URLSearchParams({ from: origin.trim() });

    if (mode === "matchday" && matchDate) {
      params.set("date", matchDate);
      // Planning assumption until exact kick-off / arrival preference is wired.
      params.set("time", "12:00");
    }

    try {
      const response = await fetch(`/api/journey?${params.toString()}`);
      const json = await response.json();
      setData(json);
    } catch {
      setData({
        status: "unavailable",
        reason: "Journey service could not be reached."
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
          <div className="eyebrow">MATCHDAY ACCESS</div>
          <h2>How hard is it to get to Hayes Lane?</h2>
          <p className="muted">
            Enter a postcode, station or London location. The engine turns the
            journey into an accessibility signal rather than treating distance
            as a proxy for travel friction.
          </p>
        </div>
        <div className="journeyDestination">
          <span>Destination</span>
          <strong>Hayes Lane</strong>
          <small>Bromley · London City home</small>
        </div>
      </div>

      <form className="journeyForm" onSubmit={submit}>
        <label>
          <span>Where are you travelling from?</span>
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. CR0 7AB, Bromley South, London Bridge"
            aria-label="Journey origin"
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
            disabled={!matchDateAvailable}
            className={mode === "matchday" ? "active" : ""}
            onClick={() => setMode("matchday")}
          >
            Matchday forecast
          </button>
        </div>

        <button className="journeySubmit" type="submit" disabled={loading || !origin.trim()}>
          {loading ? "Checking…" : "Check journey"}
        </button>
      </form>

      {mode === "matchday" && matchDate && (
        <div className="planningNote">
          Matchday route planning uses {matchDate}. Exact arrival-time logic will
          activate when verified kick-off times are wired into the fixture feed.
        </div>
      )}

      {data?.status === "unavailable" && (
        <div className="journeyError">
          <SignalBadge type="WAITING" />
          <strong>Journey unavailable</strong>
          <span>{data.reason ?? "TfL could not resolve this origin."}</span>
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
                <span>Network</span>
                <strong>{best.disruptions.length ? "Disruption" : "No route disruption"}</strong>
              </div>
            </div>

            {best.disruptions.length > 0 && (
              <div className="disruptionBox">
                <SignalBadge type="LIVE" />
                {best.disruptions.map((d, i) => <p key={i}>{d}</p>)}
              </div>
            )}

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
