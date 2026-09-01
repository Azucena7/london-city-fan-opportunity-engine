import { SignalBadge } from "./SignalBadge";

export function ThisWeekHero() {
  return (
    <section className="thisWeekHero">
      <div>
        <div className="eyebrow">THIS WEEK / DECISION LAYER</div>
        <h1 className="thisWeekTitle">No live decision yet.</h1>
        <p className="lede">
          The engine only upgrades from planning to live when weather and attendance
          momentum are genuinely available.
        </p>
      </div>

      <div className="thisWeekState">
        <div className="stateNumber">2 / 6</div>
        <div className="stateLabel">live inputs available</div>
        <div className="stateBadges">
          <SignalBadge type="STRUCTURAL" />
          <SignalBadge type="MEASURED" />
          <SignalBadge type="INFERRED" />
          <SignalBadge type="WAITING" />
        </div>
      </div>
    </section>
  );
}
