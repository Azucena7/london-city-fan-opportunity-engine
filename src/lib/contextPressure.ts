// Context pressure: how much the world outside the club is pressing on a fixture right now.
// It is added to the Radar rank so that external signals change what is looked at first, and
// every point carries a named driver, a source and its evidence state. It is attention, not a
// forecast: it never says how many people will come, only that the context deserves a look.
import { weatherLevel } from "@/lib/weatherThresholds";

export type ContextDriver = {
  family: "competing-events" | "weather" | "transport" | "calendar";
  label: string;
  points: number;
  evidence: "scheduled" | "forecast" | "reported";
  source: string;
};

export type ContextPressure = { points: number; drivers: ContextDriver[] };

export type ContextPressureInput = {
  date: string;
  competing: Array<{ level: string; name: string }>;
  weather?: { validFor?: string; rainProbability?: number | null; windKmh?: number | null; previousRainProbability?: number | null } | null;
  roadClosures: number;
  railDisruptions: string[];
  /** TfL names strike or industrial action as the reason for a disruption on the day. */
  strike?: boolean;
  moments: string[];
};

export const CONTEXT_PRESSURE_CAP = 20;

/** " (up from 20%)" when the rain risk moved by 10 points or more since the previous refresh. */
function forecastChange(previous: number | null | undefined, current: number | null | undefined) {
  if (previous == null || current == null || Math.abs(current - previous) < 10) return "";
  return ` (${current > previous ? "up" : "down"} from ${previous}%)`;
}
const COMPETING_CAP = 9;
const CALENDAR_CAP = 4;

export function contextPressure({ date, competing, weather, roadClosures, railDisruptions, strike = false, moments }: ContextPressureInput): ContextPressure {
  const drivers: ContextDriver[] = [];

  const high = competing.filter((event) => event.level === "high");
  const medium = competing.filter((event) => event.level === "medium");
  const competingPoints = Math.min(high.length * 3 + medium.length, COMPETING_CAP);
  if (competingPoints > 0) {
    const lead = (high[0] ?? medium[0]).name;
    const count = high.length + medium.length;
    drivers.push({
      family: "competing-events",
      label: `${count} competing fixture${count === 1 ? "" : "s"} close in time and place (e.g. ${lead})`,
      points: competingPoints,
      evidence: "scheduled",
      source: "Event landscape"
    });
  }

  if (weather && weather.validFor === date) {
    const level = weatherLevel(weather.rainProbability, weather.windKmh);
    if (level !== "low") {
      drivers.push({
        family: "weather",
        label: `${weather.rainProbability ?? 0}% rain risk${weather.windKmh ? `, ${Math.round(weather.windKmh)} km/h wind` : ""} on matchday${forecastChange(weather.previousRainProbability, weather.rainProbability)}`,
        points: level === "high" ? 6 : 3,
        evidence: "forecast",
        source: "Open-Meteo"
      });
    }
  }

  if (roadClosures > 0 || railDisruptions.length > 0) {
    const parts = [
      roadClosures > 0 ? `${roadClosures} road closure${roadClosures === 1 ? "" : "s"} within 5 km` : null,
      railDisruptions.length ? `rail: ${railDisruptions.join(", ")}` : null
    ].filter(Boolean);
    drivers.push({ family: "transport", label: `${strike ? "Strike or industrial action · " : ""}${parts.join(" · ")}`, points: 6, evidence: "reported", source: "TfL" });
  }

  if (moments.length) {
    drivers.push({
      family: "calendar",
      label: moments.join(" · "),
      points: Math.min(moments.length * 3, CALENDAR_CAP),
      evidence: "scheduled",
      source: "GOV.UK, FIFA and council calendars"
    });
  }

  const total = drivers.reduce((sum, driver) => sum + driver.points, 0);
  return { points: Math.min(total, CONTEXT_PRESSURE_CAP), drivers: drivers.sort((a, b) => b.points - a.points) };
}
