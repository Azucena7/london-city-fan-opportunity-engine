import { NavTabs } from "@/components/NavTabs";
import { TerritoryTravelIntelligence } from "@/components/TerritoryTravelIntelligence";
import { territoryTravelSeeds } from "@/lib/territoryTravel";
import { fixtures } from "@/lib/data";
import {
  fixtureKickoff,
  isoDateForWeather,
  nextHomeFixture
} from "@/lib/fixtures";

function arrivalTarget(kickoff?: string) {
  if (!kickoff) return undefined;

  const [h, m] = kickoff.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined;

  const total = h * 60 + m - 45;
  const safe = (total + 1440) % 1440;

  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

export default function TerritoryTravelPage() {
  const fixture = nextHomeFixture(fixtures);
  const matchDate = isoDateForWeather(fixture);
  const kickoff = fixtureKickoff(fixture);
  const targetArrival = arrivalTarget(kickoff);

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
