import { NavTabs } from "@/components/NavTabs";
import { TerritoryTravelIntelligence } from "@/components/TerritoryTravelIntelligence";
import { territoryTravelSeeds } from "@/lib/territoryTravel";
import { fixtures } from "@/lib/data";
import {
  isoDateForWeather,
  matchdayArrivalTime,
  nextHomeFixture
} from "@/lib/fixtures";

export default function TerritoryTravelPage() {
  const fixture = nextHomeFixture(fixtures);
  const matchDate = isoDateForWeather(fixture);
  const targetArrival = matchdayArrivalTime(fixture, 45);

  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">WHERE × ACCESS</div>
        <h1 className="pageTitle">
          Territory travel intelligence
        </h1>
        <p className="lede">
          Representative origins turn individual journey friction into a territory-level operating signal.
        </p>
      </section>

      <TerritoryTravelIntelligence
        territories={territoryTravelSeeds}
        matchDate={matchDate}
        targetArrival={targetArrival}
      />

      <footer>
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">
          Prototype · representative origins · TfL public transport layer
        </div>
      </footer>
    </main>
  );
}
