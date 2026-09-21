import type { Metadata } from "next";
import { experimentMeasurement, fixtures, mobilityPartnership } from "@/lib/data";
import { isoDateForWeather, matchdayArrivalTime, nextHomeFixture } from "@/lib/fixtures";
import { territoryTravelSeeds } from "@/lib/territoryTravel";
import { LocalizedAccessPage } from "@/components/LocalizedAccessPage";

export const metadata: Metadata = {
  title: "Matchday Access",
  description: "Journey, territory and mobility evidence for getting supporters to Hayes Lane."
};

export default function AccessPage() {
  const fixture = nextHomeFixture(fixtures);
  return <LocalizedAccessPage
    territories={territoryTravelSeeds}
    matchDate={isoDateForWeather(fixture)}
    matchKickoff={fixture?.kickoff}
    targetArrival={matchdayArrivalTime(fixture, 45)}
    fixtureOpponent={fixture?.opponent}
    fixtureScore={fixture?.planningScore}
    fixtureDecision={fixture?.decision}
    mobility={mobilityPartnership}
    measurement={experimentMeasurement}
  />;
}
