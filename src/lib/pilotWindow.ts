// The public demonstration pilot window: four London City home fixtures, each testing a
// different decision. Shared by /pilot and the in-app tracker so both read the same cycles,
// and every cycle's state comes from the calendar, never from copy.

type CalendarFixture = { id: string; date: string; status?: string; attendance?: number | null };

export const PILOT_WINDOW = [
  {
    fixture: "Brighton · 26 Sep",
    fixtureId: "2026-09-26-bha-h",
    focus: "Experience + retention",
    decision: "Extend the football day, protect service confidence and learn from repeat behaviour.",
    evidence: "Public activation + reported attendance; CRM, scans and spend remain gated."
  },
  {
    fixture: "Everton · 18 Oct",
    fixtureId: "2026-10-18-eve-h",
    focus: "Segmentation + VIP + broadcast",
    decision: "Separate family, Oktoberfest, VIP and remote-viewer journeys instead of one generic campaign.",
    evidence: "Official matchday proposition, VIP availability and broadcast context."
  },
  {
    fixture: "Crystal Palace · 28 Oct",
    fixtureId: "2026-10-28-cry-h",
    focus: "Bundle + ticketing",
    decision: "Test bundle versus single-match journeys and measure purchase and scan behaviour per fixture.",
    evidence: "Official three-game cup bundle and sale windows."
  },
  {
    fixture: "Manchester City · 1 Nov",
    fixtureId: "2026-11-01-mci-h",
    focus: "Pricing + CRM cohorts",
    decision: "Use prior buyers, registered prospects and priority cohorts with verified price windows.",
    evidence: "Official ticket launch; conversion remains unmeasured until club data is connected."
  }
] as const;

/** The end-of-window decision, which belongs to the club. */
export const END_OPTIONS = [
  ["Continue", "Run the same workflows over the next window."],
  ["Adjust", "Keep going with a changed objective, workflow or measure."],
  ["Stop", "End the test; the decision record stays with the club."],
  ["Deepen integration", "Connect authorised club data the window showed was missing."]
] as const;

export type CycleState = "Observed" | "Played · evidence pending" | "Active" | "Next";

export const CYCLE_STATE_KEY: Record<CycleState, string> = {
  Observed: "observed",
  "Played · evidence pending": "pending",
  Active: "active",
  Next: "next"
};

/**
 * Observed only once a fixture is played and a public attendance is on record; a played
 * fixture without one is "evidence pending"; the first fixture still ahead is Active.
 */
export function cycleStates(calendar: CalendarFixture[], today: string): Record<string, CycleState> {
  const fixtures = PILOT_WINDOW.map((item) => calendar.find((fixture) => fixture.id === item.fixtureId));
  const firstAhead = fixtures.find((fixture) => fixture && fixture.status !== "final" && fixture.date >= today)?.id;
  return Object.fromEntries(PILOT_WINDOW.map((item, index) => {
    const fixture = fixtures[index];
    const played = fixture ? fixture.status === "final" || fixture.date < today : false;
    const state: CycleState = played
      ? fixture?.attendance ? "Observed" : "Played · evidence pending"
      : item.fixtureId === firstAhead ? "Active" : "Next";
    return [item.fixtureId, state];
  }));
}

/** Where the window stands: how many cycles are played, and whether the end decision is due. */
export function windowProgress(states: Record<string, CycleState>) {
  const values = Object.values(states);
  const played = values.filter((state) => state === "Observed" || state === "Played · evidence pending").length;
  return {
    total: values.length,
    played,
    observed: values.filter((state) => state === "Observed").length,
    remaining: values.length - played,
    endDecisionDue: played === values.length
  };
}
