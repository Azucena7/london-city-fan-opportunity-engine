import { NavTabs } from "@/components/NavTabs";
import { JourneyPlanner } from "@/components/JourneyPlanner";
import { fixtures } from "@/lib/data";
import { isoDateForWeather, nextHomeFixture } from "@/lib/fixtures";

export default function TravelPage() {
  const nextFixture = nextHomeFixture(fixtures);
  const matchDate = isoDateForWeather(nextFixture);

  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">FAN EXPERIENCE × ACQUISITION SIGNAL</div>
        <h1 className="pageTitle">Can I actually get to the match?</h1>
        <p className="lede">
          A fan-facing journey tool that also gives the growth engine a better
          measure of matchday friction.
        </p>
      </section>

      <JourneyPlanner matchDate={matchDate} />

      <section className="method">
        <div className="eyebrow">WHY THIS MATTERS</div>
        <h3>Twenty kilometres is not a customer insight. Twenty-seven minutes with no changes is.</h3>
        <p className="muted">
          Accessibility should respond to the actual journey: duration, changes,
          walking burden and disruption.
        </p>
      </section>

      <footer>
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">
          Prototype · TfL-powered journey layer · not an official club product.
        </div>
      </footer>
    </main>
  );
}
