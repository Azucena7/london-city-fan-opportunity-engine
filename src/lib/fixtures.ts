export type GenericFixture = Record<string, any>;

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;

    // Support UK-style DD/MM/YYYY without pretending ambiguous values are US dates.
    const uk = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (uk) {
      const [, d, m, y] = uk;
      const parsed = new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}T12:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  return null;
}

export function fixtureDate(fixture: GenericFixture): Date | null {
  return (
    parseDateValue(fixture.date) ||
    parseDateValue(fixture.fixtureDate) ||
    parseDateValue(fixture.fixture_date) ||
    parseDateValue(fixture.kickoff) ||
    parseDateValue(fixture.kickoff_at)
  );
}

export function isHomeFixture(fixture: GenericFixture): boolean {
  const explicitHome =
    fixture.home === true ||
    fixture.isHome === true ||
    fixture.is_home === true ||
    String(fixture.venueType ?? "").toLowerCase() === "home";

  if (explicitHome) return true;

  const homeTeam = String(
    fixture.homeTeam ?? fixture.home_team ?? fixture.homeClub ?? fixture.home_club ?? ""
  ).toLowerCase();

  if (homeTeam.includes("london city")) return true;

  const venue = String(fixture.venue ?? fixture.stadium ?? "").toLowerCase();
  if (venue.includes("hayes lane") || venue.includes("copperjax")) return true;

  // Seed files in this project are intended to represent London City home inventory.
  // Only fall back to true when no away/home information exists at all.
  const awayTeam = fixture.awayTeam ?? fixture.away_team ?? fixture.awayClub ?? fixture.away_club;
  const hasAnyHomeAwayField =
    fixture.homeTeam || fixture.home_team || fixture.homeClub || fixture.home_club ||
    awayTeam || fixture.home !== undefined || fixture.isHome !== undefined || fixture.is_home !== undefined;

  return !hasAnyHomeAwayField;
}

export function nextHomeFixture(
  fixtures: GenericFixture[],
  now = new Date()
): GenericFixture | null {
  const candidates = fixtures
    .map((fixture) => ({ fixture, date: fixtureDate(fixture) }))
    .filter(
      (item): item is { fixture: GenericFixture; date: Date } =>
        Boolean(item.date) &&
        isHomeFixture(item.fixture) &&
        item.date!.getTime() >= now.getTime()
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return candidates[0]?.fixture ?? null;
}

export function isoDateForWeather(fixture: GenericFixture | null): string | undefined {
  if (!fixture) return undefined;
  const date = fixtureDate(fixture);
  if (!date) return undefined;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fixtureOpponent(fixture: GenericFixture | null): string {
  if (!fixture) return "No upcoming home fixture";
  return String(
    fixture.opponent ??
    fixture.awayTeam ??
    fixture.away_team ??
    fixture.fixture ??
    "TBC"
  );
}
