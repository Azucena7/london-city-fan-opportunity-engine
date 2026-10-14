import sourceHealth from "../../data/live/source-health.json";
import { bankHolidays, calendar, currentState, eventLandscape, internationalWindows, liveSignals } from "@/lib/data";
import { calendarMoments } from "@/lib/calendarMoments";
import { currentProductDate } from "@/lib/currentProductDate";
import { buildMorningRead } from "@/lib/morningRead";
import type { ProductOpportunity } from "@/lib/productOpportunity";

/** The Morning Commercial Read lines from the latest refresh: shared by the home page and the daily digest. */
export function getCurrentMorningRead(live: ProductOpportunity | null) {
  return buildMorningRead({
    today: currentProductDate(currentState.updated_at),
    calendar,
    events: eventLandscape.events,
    signals: liveSignals,
    weather: currentState.weather,
    sources: sourceHealth.sources,
    live,
    moments: calendarMoments(calendar, bankHolidays.events, internationalWindows.windows)
  });
}
