import { fixtures } from "@/lib/data";
import {
  fixtureDate,
  fixtureOpponent,
  isoDateForWeather,
  nextHomeFixture
} from "@/lib/fixtures";
import { LocalizedThisWeek } from "@/components/LocalizedThisWeek";

export default function ThisWeekPage() {
  const nextFixture = nextHomeFixture(fixtures);
  const targetDate = isoDateForWeather(nextFixture);
  const parsedDate = fixtureDate(nextFixture ?? {});
  const displayDate = parsedDate
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(parsedDate)
    : undefined;

  return (
    <LocalizedThisWeek
      opponent={fixtureOpponent(nextFixture)}
      displayDate={displayDate}
      venue={nextFixture?.venue ?? nextFixture?.stadium ?? "Hayes Lane"}
      targetDate={targetDate}
    />
  );
}
