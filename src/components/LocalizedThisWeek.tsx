"use client";

import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { ThisWeekHero } from "./ThisWeekHero";
import { LiveSignalGrid } from "./LiveSignalGrid";
import { EvidenceList } from "./EvidenceList";
import { useLanguage } from "./LanguageProvider";
import { LiveMatchProvider } from "./LiveMatchProvider";
import type { Fixture } from "@/lib/models";

export function LocalizedThisWeek({ fixture }: { fixture: Fixture }) {
  const { lang } = useLanguage();
  const es = lang === "es";

  return (
    <LiveMatchProvider fixture={fixture}>
      <main>
        <NavTabs />

        <ThisWeekHero />

        <section className="panel widePanel decisionInputsPanel block15DecisionPanel">
          <div className="sectionHeader">
            <div>
              <div className="eyebrow">{es ? "POR QUÉ ESTA ACCIÓN" : "WHY THIS ACTION"}</div>
              <h3>{es ? "Qué impulsa la recomendación" : "What drives the recommendation"}</h3>
            </div>
            <span className="muted">
              {es ? "WHERE → WHEN → MATCHWEEK" : "WHERE → WHEN → MATCHWEEK"}
            </span>
          </div>
          <LiveSignalGrid />
        </section>

        <details className="evidenceDisclosure">
          <summary>{es ? "Ver evidencia y fuentes" : "View evidence and sources"}</summary>
          <div className="evidenceDisclosureBody">
            <EvidenceList />
          </div>
        </details>

        <div className="methodJump">
          <span>
            {es
              ? "Pesos, reglas, estados de evidencia y límites del modelo."
              : "Weights, rules, evidence states and model limitations."}
          </span>
          <Link href="/method">{es ? "Abrir método →" : "Open method →"}</Link>
        </div>
      </main>
    </LiveMatchProvider>
  );
}
