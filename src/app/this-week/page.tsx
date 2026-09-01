import { NavTabs } from "@/components/NavTabs";
import { ThisWeekHero } from "@/components/ThisWeekHero";
import { LiveSignalGrid } from "@/components/LiveSignalGrid";
import { EvidenceList } from "@/components/EvidenceList";
import { WeatherLiveCard } from "@/components/WeatherLiveCard";
import { NextFixtureContext } from "@/components/NextFixtureContext";
import { fixtures } from "@/lib/data";
import {
  fixtureDate,
  fixtureOpponent,
  isoDateForWeather,
  nextHomeFixture
} from "@/lib/fixtures";

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
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">OPERATING VIEW</div>
        <h1 className="pageTitle">What should the club do this week?</h1>
        <p className="lede">
          The next home fixture is now selected automatically from the fixture dataset.
        </p>
      </section>

      <NextFixtureContext
        opponent={fixtureOpponent(nextFixture)}
        date={displayDate}
        venue={nextFixture?.venue ?? nextFixture?.stadium ?? "Hayes Lane"}
      />

      <ThisWeekHero />

      <WeatherLiveCard targetDate={targetDate} />

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">SIGNAL STATE</div>
            <h3>Live decision readiness</h3>
          </div>
          <span className="muted">
            Fixture selection is automatic · weather activates inside forecast window
          </span>
        </div>
        <LiveSignalGrid />
      </section>

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">EVIDENCE</div>
            <h3>Why does the engine believe this?</h3>
          </div>
        </div>
        <EvidenceList />
      </section>

      <section className="method">
        <div className="eyebrow">OPERATING RULE</div>
        <h3>Resolve the fixture first. Activate live signals second.</h3>
        <p className="muted">
          Weather is never attached to an arbitrary date. Attendance momentum remains
          inactive until a reliable source exists.
        </p>
      </section>
    </main>
  );
}
