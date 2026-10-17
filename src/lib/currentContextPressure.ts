import tflRoad from "../../data/live/tfl-road.json";
import { bankHolidays, calendar, currentState, eventLandscape, internationalWindows } from "@/lib/data";
import { calendarMoments } from "@/lib/calendarMoments";
import { contextPressure, type ContextPressure } from "@/lib/contextPressure";
import { railStatusForFixture } from "@/lib/mobilityProviderReadiness";
import { roadClosuresOn } from "@/lib/morningRead";

/** Context pressure for one fixture from the latest refresh: events, forecast, TfL and calendar. */
export function getContextPressure(fixtureId: string, date: string): ContextPressure {
  const competing = eventLandscape.events.flatMap((event) =>
    (event.fixtureScores ?? [])
      .filter((score) => score.fixtureId === fixtureId)
      .map((score) => ({ level: score.level, name: event.name }))
  );
  const weather = currentState.weather;
  const rail = railStatusForFixture(date);
  const moments = calendarMoments(calendar, bankHolidays.events, internationalWindows.windows)
    .filter((moment) => moment.fixtureId === fixtureId)
    .map((moment) => moment.label);

  return contextPressure({
    date,
    competing,
    weather: weather ? {
      validFor: weather.valid_for,
      rainProbability: weather.precipitation_probability_max,
      windKmh: (weather as { wind_speed_max?: number }).wind_speed_max
    } : null,
    roadClosures: roadClosuresOn(tflRoad.incidents, date).length,
    railDisruptions: rail ? rail.disruptions.map((item) => `${item.line} ${item.status.toLowerCase()}`) : [],
    moments
  });
}
