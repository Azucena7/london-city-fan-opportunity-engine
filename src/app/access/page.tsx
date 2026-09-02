import { fixtures } from "@/lib/data";
import { isoDateForWeather, matchdayArrivalTime, nextHomeFixture } from "@/lib/fixtures";
import { territoryTravelSeeds } from "@/lib/territoryTravel";
import { LocalizedAccessPage } from "@/components/LocalizedAccessPage";

export default function AccessPage() {
  const fixture = nextHomeFixture(fixtures);
  return <LocalizedAccessPage
    territories={territoryTravelSeeds}
    matchDate={isoDateForWeather(fixture)}
    matchKickoff={fixture?.kickoff}
    targetArrival={matchdayArrivalTime(fixture, 45)}
  />;
}
