import sourceHealth from "../../data/live/source-health.json";
import tflRail from "../../data/live/tfl-rail.json";
import tflRoad from "../../data/live/tfl-road.json";
import { bankHolidays, calendar, crmTicketingLive, currentState, eventLandscape, internationalWindows, liveSignals } from "@/lib/data";
import { calendarMoments } from "@/lib/calendarMoments";
import { schoolHolidayPeriods } from "@/lib/schoolHolidays";
import { currentProductDate } from "@/lib/currentProductDate";
import { buildMorningRead } from "@/lib/morningRead";
import type { ProductOpportunity } from "@/lib/productOpportunity";

/** The latest exported fixture whose buyers have postcode origins, or null outside a club aggregate. */
function latestOrigins() {
  if (crmTicketingLive.datasetState !== "club-aggregate") return null;
  const summary = [...crmTicketingLive.fixtureSummaries].reverse().find((item) => item.origins?.all.supporters);
  return summary?.origins ? { fixtureId: summary.fixtureId, ...summary.origins.all } : null;
}

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
    moments: calendarMoments(calendar, bankHolidays.events, internationalWindows.windows, schoolHolidayPeriods),
    road: tflRoad,
    rail: tflRail,
    origins: latestOrigins()
  });
}
