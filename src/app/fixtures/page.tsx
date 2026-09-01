import { fixtures } from "@/lib/data";
import { FixtureTable } from "@/components/FixtureTable";
import { NavTabs } from "@/components/NavTabs";

export default function FixturesPage() {
  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">WHEN</div>
        <h1 className="pageTitle">Which fixtures deserve acquisition spend?</h1>
        <p className="lede">
          Each match is treated as a different commercial environment, not as another date on the calendar.
        </p>
      </section>

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">2026/27</div>
            <h3>Matchday decision calendar</h3>
          </div>
          <span className="muted">Planning layer</span>
        </div>
        <FixtureTable items={fixtures} />
      </section>

      <section className="method">
        <div className="eyebrow">WHY THIS MATTERS</div>
        <h3>A premium opponent can still be a poor acquisition window.</h3>
        <p className="muted">
          The engine separates fixture appeal from calendar whitespace and external attention pressure.
        </p>
      </section>
    </main>
  );
}
