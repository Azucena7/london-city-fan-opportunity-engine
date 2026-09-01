import { NavTabs } from "@/components/NavTabs";
import { ThisWeekHero } from "@/components/ThisWeekHero";
import { LiveSignalGrid } from "@/components/LiveSignalGrid";
import { EvidenceList } from "@/components/EvidenceList";
import { WeatherLiveCard } from "@/components/WeatherLiveCard";

export default function ThisWeekPage() {
  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">OPERATING VIEW</div>
        <h1 className="pageTitle">What should the club do this week?</h1>
        <p className="lede">
          This view separates what the engine knows from what it is still waiting to know.
        </p>
      </section>

      <ThisWeekHero />

      <WeatherLiveCard targetDate="2026-09-04" />

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">SIGNAL STATE</div>
            <h3>Live decision readiness</h3>
          </div>
          <span className="muted">Weather now refreshes automatically</span>
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
        <div className="eyebrow">RULE</div>
        <h3>Unknown is not zero.</h3>
        <p className="muted">
          Weather is now live. Attendance momentum remains inactive until a reliable
          sales / scans / attendance source is available.
        </p>
      </section>
    </main>
  );
}
