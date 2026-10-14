import { bankHolidays, calendar, campaignPlans, currentState, eventLandscape, internationalWindows, liveSignals } from "@/lib/data";
import { calendarMoments } from "@/lib/calendarMoments";
import { currentProductDate } from "@/lib/currentProductDate";
import { buildPreparedMoves, preparationWindow } from "@/lib/preparedMoves";

/** Engine drafts for the next home fixtures that have no curated campaign plan. */
export function getCurrentPreparedMoves() {
  return buildPreparedMoves({
    today: currentProductDate(currentState.updated_at),
    fixtures: calendar,
    signals: liveSignals,
    events: eventLandscape.events,
    moments: calendarMoments(calendar, bankHolidays.events, internationalWindows.windows),
    weather: currentState.weather,
    plannedFixtureIds: new Set(campaignPlans.campaigns.map((campaign) => campaign.fixtureId))
  });
}

/** Fixture ids inside the preparation window, so later fixtures are not read as "no signal". */
export function getPreparationWindowIds() {
  return new Set(preparationWindow(calendar, currentProductDate(currentState.updated_at)).map((fixture) => fixture.id));
}
