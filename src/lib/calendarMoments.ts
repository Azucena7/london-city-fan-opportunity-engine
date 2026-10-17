// Calendar moments around home fixtures: UK bank holidays, FIFA international windows and
// council school holidays (only periods verified against the council's own page).
// Only stated facts are used — a moment is the fixture's position relative to a published
// date, never an estimate of its effect on attendance.

type Fixture = { id: string; date: string; opponent: string; homeAway: string; status?: string };
type Holiday = { date: string; title: string };
type Window = { id: string; start: string; end: string };
export type SchoolHolidayPeriod = { layer: string; layerLabel: string; label: string; start: string; end: string; verified: boolean };

export type CalendarMoment = {
  fixtureId: string;
  kind: "bank-holiday" | "before-window" | "during-window" | "after-window" | "school-holiday";
  label: string;
};

const DAY = 86_400_000;

function gap(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);
}

export function calendarMoments(fixtures: Fixture[], holidays: Holiday[], windows: Window[], schoolHolidays: SchoolHolidayPeriod[] = []): CalendarMoment[] {
  const home = fixtures
    .filter((fixture) => fixture.homeAway === "home" && fixture.status !== "final")
    .sort((a, b) => a.date.localeCompare(b.date));
  const moments: CalendarMoment[] = [];

  for (const fixture of home) {
    const holiday = holidays.find((item) => Math.abs(gap(fixture.date, item.date)) <= 1);
    if (holiday) {
      const when = holiday.date === fixture.date ? "on" : gap(fixture.date, holiday.date) > 0 ? "the day before" : "the day after";
      moments.push({ fixtureId: fixture.id, kind: "bank-holiday", label: `Bank holiday weekend: ${fixture.opponent} is ${when} ${holiday.title}` });
    }
  }

  for (const window of windows) {
    for (const fixture of home) {
      if (fixture.date >= window.start && fixture.date <= window.end) {
        moments.push({ fixtureId: fixture.id, kind: "during-window", label: `${fixture.opponent} falls inside the international window: internationals may be away` });
      }
    }
    // The last home match before a window and the first one after it, when they are close.
    const before = [...home].reverse().find((fixture) => fixture.date < window.start);
    if (before && gap(before.date, window.start) <= 7) {
      moments.push({ fixtureId: before.id, kind: "before-window", label: `Last home match before the international window (${before.opponent})` });
    }
    const after = home.find((fixture) => fixture.date > window.end);
    if (after && gap(window.end, after.date) <= 14) {
      moments.push({ fixtureId: after.id, kind: "after-window", label: `First home match after the international window (${after.opponent}): internationals return` });
    }
  }

  // A fixture inside school holidays: one moment per fixture, naming every verified layer it falls in.
  for (const fixture of home) {
    const layers = schoolHolidays.filter((period) => period.verified && fixture.date >= period.start && fixture.date <= period.end);
    if (layers.length) {
      moments.push({
        fixtureId: fixture.id,
        kind: "school-holiday",
        label: `${fixture.opponent} falls in school holidays: ${layers.map((period) => `${period.layerLabel} ${period.label.toLowerCase()}`).join("; ")}`
      });
    }
  }

  return moments;
}
