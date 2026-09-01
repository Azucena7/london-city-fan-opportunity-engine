import type { Fixture } from "./models";

function parseDateValue(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function fixtureDate(fixture: Partial<Fixture>): Date | null {
  return parseDateValue(fixture.date);
}

export function nextHomeFixture(fixtures: Fixture[], now = new Date()): Fixture | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return [...fixtures]
    .map((fixture) => ({ fixture, date: fixtureDate(fixture) }))
    .filter((x): x is { fixture: Fixture; date: Date } => x.date !== null && x.date.getTime() >= today.getTime())
    .sort((a,b) => a.date.getTime() - b.date.getTime())[0]?.fixture ?? null;
}

export function isoDateForWeather(fixture: Fixture | null): string | undefined {
  return fixture?.date;
}

export function fixtureOpponent(fixture: Fixture | null): string {
  return fixture?.opponent ?? "No upcoming home fixture";
}

export function matchdayArrivalTime(fixture: Fixture | null, leadMinutes = 45): string | undefined {
  if (!fixture?.kickoff) return undefined;
  const [h,m] = fixture.kickoff.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return undefined;
  const total = h * 60 + m - leadMinutes;
  const hh = String(Math.floor((total + 1440) % 1440 / 60)).padStart(2,"0");
  const mm = String((total + 1440) % 60).padStart(2,"0");
  return `${hh}:${mm}`;
}
