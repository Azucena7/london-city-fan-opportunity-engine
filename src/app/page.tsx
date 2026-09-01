import { DecisionCard } from "@/components/DecisionCard";
import { Kpi } from "@/components/Kpi";
import { TerritoryList } from "@/components/TerritoryList";
import { fixtures, territories } from "@/lib/data";
import { decisionFromScore, planningScore } from "@/lib/scoring";

function normalizeFixture(f: any) {
  const territory = Number(
    f.territoryOpportunity ?? f.territory_opportunity ?? f.territoryScore ?? 0
  );
  const calendar = Number(
    f.calendarWhitespace ?? f.calendar_whitespace ?? f.calendarScore ?? 0
  );
  const attentionPressure = Number(
    f.attentionPressure ?? f.attention_pressure ?? 50
  );
  const attentionAvailability = Number(
    f.attentionAvailability ?? f.attention_availability ?? 100 - attentionPressure
  );
  const appeal = Number(f.fixtureAppeal ?? f.fixture_appeal ?? f.appeal ?? 65);

  const score =
    Number(f.planningScore ?? f.planning_score) ||
    planningScore({
      territory,
      calendar,
      attentionAvailability,
      fixtureAppeal: appeal
    });

  return {
    ...f,
    score,
    decision: f.decision ?? decisionFromScore(score),
    opponent: f.opponent ?? f.fixture ?? "TBC",
    territoryName:
      f.targetTerritory ?? f.target_territory ?? f.territory ?? "Priority territory",
    date: f.date ?? "TBC",
    product: f.product ?? f.recommendedProduct ?? "Hat-Trick / First Match Welcome",
    channel: f.channel ?? f.primaryChannel ?? "Grassroots + local digital",
    message:
      f.message ??
      f.campaignMessage ??
      "Elite women’s football is closer than you think."
  };
}

export default function Home() {
  const normalizedFixtures = fixtures.map(normalizeFixture);
  const rankedFixtures = [...normalizedFixtures].sort((a, b) => b.score - a.score);
  const top = rankedFixtures[0];

  return (
    <main>
      <section className="hero">
        <div className="nav">
          <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
          <div className="status"><span /> V1 PUBLIC PROTOTYPE</div>
        </div>

        <div className="heroGrid">
          <div>
            <div className="eyebrow">THE QUESTION</div>
            <h1>Where are the next 1,000 recurring fans?</h1>
            <p className="lede">
              A decision engine for turning geography, grassroots football,
              calendar whitespace and matchday signals into concrete acquisition plays.
            </p>
          </div>
          <div className="heroStatement">
            <span>Not another dashboard.</span>
            <strong>A weekly decision.</strong>
          </div>
        </div>
      </section>

      <section className="kpiGrid">
        <Kpi label="Territories modelled" value={String(territories.length)} detail="Seed dataset currently loaded" />
        <Kpi label="Fixtures scored" value={String(fixtures.length)} detail="Planning layer" />
        <Kpi label="Best current window" value={top?.opponent ?? "TBC"} detail={top?.decision ?? ""} />
        <Kpi label="Operating logic" value="WHERE × WHEN" detail="+ live matchday signals" />
      </section>

      {top ? (
        <DecisionCard
          opponent={top.opponent}
          date={top.date}
          territory={top.territoryName}
          score={top.score}
          decision={top.decision}
          product={top.product}
          channel={top.channel}
          message={top.message}
        />
      ) : null}

      <section className="split">
        <div className="panel">
          <div className="sectionHeader">
            <div>
              <div className="eyebrow">WHERE</div>
              <h3>Priority territories</h3>
            </div>
            <span className="muted">Opportunity score</span>
          </div>
          <TerritoryList items={territories} />
        </div>

        <div className="panel thesis">
          <div className="eyebrow">OPERATING THESIS</div>
          <h3>Don’t ask fans to change clubs.</h3>
          <p>
            Compete for the decision that actually matters:
            <strong> “What are you doing this Sunday?”</strong>
          </p>
          <div className="rule" />
          <p className="muted">
            Geography tells us where. Calendar tells us when.
            Weather and attendance tell us whether demand is responding.
          </p>
        </div>
      </section>

      <section className="method">
        <div className="eyebrow">PLANNING SCORE</div>
        <h3>35% Territory + 25% Calendar + 20% Attention + 20% Fixture Appeal</h3>
        <p className="muted">
          Weather and attendance momentum activate inside the live matchday window.
        </p>
      </section>

      <footer>
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">Prototype — research-led, not an official club product.</div>
      </footer>
    </main>
  );
}
