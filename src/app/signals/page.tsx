import { SignalCards } from "@/components/SignalCards";
import { NavTabs } from "@/components/NavTabs";

export default function SignalsPage() {
  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">LIVE LAYER</div>
        <h1 className="pageTitle">What changes the decision this week?</h1>
        <p className="lede">
          Structural opportunity tells us where to play. Live signals tell us how aggressively to act now.
        </p>
      </section>

      <SignalCards />

      <section className="decisionCard">
        <div className="eyebrow">OPERATING LOOP</div>
        <h2>6 weeks → 7 days → 72h → 24h → learn</h2>
        <div className="decisionGrid fiveCols">
          <div><span>6 weeks</span><strong>TV, events, cup clashes</strong></div>
          <div><span>7 days</span><strong>Weather + momentum</strong></div>
          <div><span>72h</span><strong>Shift spend</strong></div>
          <div><span>24h</span><strong>Lock message</strong></div>
          <div><span>Post-match</span><strong>Update learning</strong></div>
        </div>
      </section>
    </main>
  );
}
