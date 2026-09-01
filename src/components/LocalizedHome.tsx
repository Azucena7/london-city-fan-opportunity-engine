"use client";

import { Kpi } from "@/components/Kpi";
import { TerritoryList } from "@/components/TerritoryList";
import { NavTabs } from "@/components/NavTabs";
import { OpportunityCalendar } from "@/components/OpportunityCalendar";
import { WeeklyDecisionHero } from "@/components/WeeklyDecisionHero";
import { AiTransparency } from "@/components/AiTransparency";
import { BrandStripe } from "@/components/BrandStripe";
import { useLanguage } from "@/components/LanguageProvider";
import { decisionFromScore, planningScore } from "@/lib/scoring";

export function LocalizedHome({
  fixtures,
  territories
}: {
  fixtures: any[];
  territories: any[];
}) {
  const { t } = useLanguage();

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

  const normalizedFixtures = fixtures.map(normalizeFixture);
  const rankedFixtures = [...normalizedFixtures].sort((a, b) => b.score - a.score);
  const top = rankedFixtures[0];

  return (
    <main>
      <section className="hero">
        <div className="nav">
          <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
          <div className="status"><span /> {t.common.prototype}</div>
        </div>
        <NavTabs />

        <div className="heroGrid">
          <div>
            <div className="eyebrow">{t.overview.question}</div>
            <h1>{t.overview.title}</h1>
            <p className="lede">{t.overview.lede}</p>
            <BrandStripe />
          </div>
          <div className="heroStatement">
            <span>{t.overview.aiLine1}</span>
            <strong>{t.overview.aiLine2}</strong>
          </div>
        </div>
      </section>

      <section className="kpiGrid">
        <Kpi label={t.overview.territories} value={String(territories.length)} detail="Seed dataset" />
        <Kpi label={t.overview.fixtures} value={String(fixtures.length)} detail="Planning layer" />
        <Kpi label={t.overview.bestWindow} value={top?.opponent ?? "TBC"} detail={top?.decision ?? ""} />
        <Kpi label={t.overview.logic} value="WHERE × WHEN" detail="+ live signals" />
      </section>

      {top ? (
        <WeeklyDecisionHero
          opponent={top.opponent}
          date={top.date}
          score={top.score}
          decision={top.decision}
          territory={top.territoryName}
          product={top.product}
          channel={top.channel}
          message={top.message}
        />
      ) : null}

      <section className="split">
        <div className="panel">
          <div className="sectionHeader">
            <div>
              <div className="eyebrow">{t.overview.where}</div>
              <h3>{t.overview.priorityTerritories}</h3>
            </div>
            <a className="textLink" href="/territories">{t.overview.explore}</a>
          </div>
          <TerritoryList items={territories} />
        </div>

        <div className="panel thesis">
          <div className="eyebrow">{t.overview.thesis}</div>
          <h3>{t.overview.thesisTitle}</h3>
          <p><strong>{t.overview.thesisText}</strong></p>
          <div className="rule" />
          <p className="muted">
            Geography tells us where. Calendar tells us when.
            Weather and attendance tell us whether demand is responding.
          </p>
        </div>
      </section>

      <section className="panel widePanel">
        <div className="sectionHeader">
          <div>
            <div className="eyebrow">{t.overview.when}</div>
            <h3>{t.overview.opportunityCalendar}</h3>
          </div>
          <a className="textLink" href="/fixtures">{t.overview.fullCalendar}</a>
        </div>
        <OpportunityCalendar items={fixtures} />
      </section>

      <AiTransparency />

      <section className="method">
        <div className="eyebrow">{t.overview.planningScore}</div>
        <h3>{t.overview.planningFormula}</h3>
        <p className="muted">{t.overview.planningNote}</p>
      </section>
    </main>
  );
}
