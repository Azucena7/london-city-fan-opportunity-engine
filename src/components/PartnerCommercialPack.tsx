"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import { PilotReadinessControlRoom } from "./PilotReadinessControlRoom";
import type { PartnerCommercialPackData, PartnerEvidenceState, PilotReadinessData } from "@/lib/models";

const evidenceLabels: Record<PartnerEvidenceState, { en: string; es: string }> = {
  "public-verified": { en: "Verified", es: "Verificado" },
  "modelled-scenario": { en: "Modelled", es: "Modelado" },
  "requires-measurement": { en: "Requires measurement", es: "Requiere medición" },
  "requires-partner": { en: "Requires partner", es: "Requiere partner" }
};

const categoryLabels: Record<string, { en: string; es: string }> = {
  "journey-technology": { en: "Journey technology", es: "Tecnología de viaje" },
  rail: { en: "Rail", es: "Ferrocarril" },
  "vehicle-operator": { en: "Vehicle operator", es: "Operador de vehículos" },
  "travel-hospitality": { en: "Travel & hospitality", es: "Travel y hospitality" }
};

const commercialDecisionLabels = {
  "recommended-for-review": { en: "Advance to internal review", es: "Avanzar a revisión interna" },
  hold: { en: "Hold until evidence improves", es: "Esperar hasta mejorar la evidencia" },
  "not-prioritised": { en: "Park until the trigger changes", es: "Aparcar hasta que cambie el trigger" }
};

export function PartnerCommercialPack({ data, readiness }: { data: PartnerCommercialPackData; readiness: PilotReadinessData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [packId, setPackId] = useState(data.packs[0]?.id ?? "");
  const pack = data.packs.find((item) => item.id === packId) ?? data.packs[0];
  const [fixtureId, setFixtureId] = useState(pack.recommendedFixtureIds[0] ?? "");
  const fixture = data.fixtures.find((item) => item.fixtureId === fixtureId) ?? data.fixtures[0];
  const selectedCandidate = readiness.candidates.find((item) => item.packId === pack.id) ?? readiness.candidates[0];
  const recommendedCandidate = readiness.candidates.find((item) => item.packId === readiness.recommendedPackId) ?? readiness.candidates[0];
  const recommendedPack = data.packs.find((item) => item.id === recommendedCandidate.packId);
  const blockedGates = readiness.checklist.filter((item) => item.state === "blocked").length;
  const decisionCounts = readiness.candidates.reduce((counts, item) => {
    counts[item.decision] += 1;
    return counts;
  }, { "recommended-for-review": 0, hold: 0, "not-prioritised": 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPack = data.packs.find((item) => item.id === params.get("pack"));
    if (!requestedPack) return;

    const requestedFixtureId = params.get("fixture");
    const requestedFixture = requestedPack.recommendedFixtureIds.find((id) => id === requestedFixtureId);
    setPackId(requestedPack.id);
    setFixtureId(requestedFixture ?? requestedPack.recommendedFixtureIds[0]);
  }, [data.packs]);

  function updateSelectionUrl(nextPackId: string, nextFixtureId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("pack", nextPackId);
    url.searchParams.set("fixture", nextFixtureId);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function selectPack(id: string) {
    const next = data.packs.find((item) => item.id === id);
    if (!next) return;
    const nextFixtureId = next.recommendedFixtureIds[0];
    setPackId(id);
    setFixtureId(nextFixtureId);
    updateSelectionUrl(id, nextFixtureId);
  }

  function selectFixture(id: string) {
    setFixtureId(id);
    updateSelectionUrl(pack.id, id);
  }

  return (
    <main className="partnerPage">
      <div className="partnerScreenNav"><NavTabs /></div>

      <section className="partnerHero">
        <div>
          <div className="eyebrow">PARTNERSHIP DECISION WORKSPACE · V2.0</div>
          <h1>{data.headline[lang]}</h1>
          <p>{data.principle[lang]}</p>
          <div className="partnerDraftState"><span>{es ? "DECISIÓN INTERNA" : "INTERNAL DECISION"}</span><strong>{es ? "Primero evidencia y bloqueos · después contacto" : "Evidence and blockers first · outreach second"}</strong></div>
        </div>
        <div className="partnerHeroActions"><Link href="/measurement">{es ? "Comprobar evidencia" : "Check evidence"} →</Link><button type="button" onClick={() => window.print()}>{es ? "Exportar dossier" : "Export dossier"}</button></div>
      </section>

      <section className="partnerDecisionStrip" aria-label={es ? "Estado comercial" : "Commercial decision status"}>
        <article className="advance"><span>{es ? "AVANZAR A REVISIÓN" : "ADVANCE TO REVIEW"}</span><strong>{decisionCounts["recommended-for-review"]}</strong><small>{recommendedPack?.candidate}</small></article>
        <article><span>{es ? "MANTENER EN ESPERA" : "HOLD"}</span><strong>{decisionCounts.hold}</strong><small>{es ? "dependencias sin resolver" : "unresolved dependencies"}</small></article>
        <article><span>{es ? "APARCADAS" : "PARKED"}</span><strong>{decisionCounts["not-prioritised"]}</strong><small>{es ? "esperar cambio de trigger" : "wait for trigger change"}</small></article>
        <article className={blockedGates ? "blocked" : "ready"}><span>{es ? "GATES BLOQUEADOS" : "BLOCKED GATES"}</span><strong>{blockedGates}</strong><small>{es ? "ningún score los puede saltar" : "no score can override them"}</small></article>
      </section>

      <section className="partnerDecisionQueue">
        <div className="partnerSectionHead"><div><span>01</span><h2>{es ? "Cola de decisiones comerciales" : "Commercial decision queue"}</h2></div><p>{es ? "Decide dónde dedicar la siguiente hora de trabajo antes de abrir un dossier." : "Decide where the next hour of work should go before opening a dossier."}</p></div>
        <div className="partnerDecisionGrid">
          {readiness.candidates.map((candidate) => {
            const candidatePack = data.packs.find((item) => item.id === candidate.packId);
            const candidateFixture = data.fixtures.find((item) => item.fixtureId === candidate.fixtureId);
            const evidenceReady = candidatePack?.evidence.filter((item) => item.state === "public-verified" || item.state === "modelled-scenario").length ?? 0;
            const evidenceMissing = candidatePack?.evidence.filter((item) => item.state === "requires-measurement" || item.state === "requires-partner").length ?? 0;
            return <article key={candidate.packId} className={candidate.decision}>
              <div><span>#{candidate.rank} · {candidatePack ? categoryLabels[candidatePack.category][lang] : ""}</span><b>{candidate.weightedScore.toFixed(1)} / 5</b></div>
              <h3>{candidatePack?.candidate}</h3>
              <strong>{commercialDecisionLabels[candidate.decision][lang]}</strong>
              <p>{candidate.rationale[lang]}</p>
              <dl>
                <div><dt>{es ? "Evidencia utilizable" : "Usable evidence"}</dt><dd>{evidenceReady}</dd></div>
                <div><dt>{es ? "Pruebas pendientes" : "Proof gaps"}</dt><dd>{evidenceMissing}</dd></div>
                <div><dt>{es ? "Partido" : "Fixture"}</dt><dd>{candidateFixture?.label[lang]}</dd></div>
              </dl>
              <small>{es ? "Primer bloqueo:" : "First blocker:"} {candidate.blockers[0]}</small>
              <button type="button" onClick={() => selectPack(candidate.packId)}>{es ? "Abrir oportunidad" : "Open opportunity"} →</button>
            </article>;
          })}
        </div>
      </section>

      <section className="partnerSelector">
        <div className="partnerSectionHead"><div><span>02</span><h2>{es ? "Abrir dossier de oportunidad" : "Open opportunity dossier"}</h2></div><p>{es ? "Los nombres son candidatos de investigación, no relaciones existentes." : "Names are research candidates, not existing relationships."}</p></div>
        <div className="partnerSelectorGrid">{data.packs.map((item, index) => <button type="button" aria-pressed={item.id === pack.id} className={item.id === pack.id ? "selected" : ""} key={item.id} onClick={() => selectPack(item.id)}><span>0{index + 1} · {categoryLabels[item.category][lang]}</span><strong>{item.candidate}</strong><small>{readiness.candidates.find((candidate) => candidate.packId === item.id) ? commercialDecisionLabels[readiness.candidates.find((candidate) => candidate.packId === item.id)!.decision][lang] : item.relationshipState.replaceAll("-", " ")}</small></button>)}</div>
      </section>

      <article className="partnerDossier">
        <header className="partnerDossierHeader">
          <div><span>{categoryLabels[pack.category][lang]} · {pack.relationshipState.replaceAll("-", " ")}</span><h2>{pack.title[lang]}</h2><p>{pack.proposition[lang]}</p><div className={`partnerDossierDecision ${selectedCandidate.decision}`}><span>{es ? "DECISIÓN ACTUAL" : "CURRENT DECISION"}</span><strong>{commercialDecisionLabels[selectedCandidate.decision][lang]}</strong><small>{selectedCandidate.rationale[lang]}</small></div></div>
          <div><span>{es ? "CANDIDATO" : "CANDIDATE"}</span><strong>{pack.candidate}</strong><small>{es ? "Sin contacto ni aprobación" : "No contact or approval"}</small></div>
        </header>

        <section className="partnerPilotChoice">
          <div><span>{es ? "PARTIDO PILOTO" : "PILOT FIXTURE"}</span><strong>{fixture.label[lang]}</strong><p>{pack.whyFit[lang]}</p></div>
          <div>{pack.recommendedFixtureIds.map((id) => { const item = data.fixtures.find((candidate) => candidate.fixtureId === id); return <button type="button" aria-pressed={fixtureId === id} className={fixtureId === id ? "active" : ""} key={id} onClick={() => selectFixture(id)}>{item?.label[lang]}</button>; })}</div>
        </section>

        <section className="partnerValueExchange">
          <div><div className="eyebrow">{es ? "LONDON CITY APORTA" : "LONDON CITY BRINGS"}</div>{pack.clubOffers.map((item) => <p key={item.en}><span>+</span>{item[lang]}</p>)}</div>
          <div><div className="eyebrow">{es ? "EL PARTNER APORTARÍA" : "PARTNER WOULD BRING"}</div>{pack.partnerContributes.map((item) => <p key={item.en}><span>+</span>{item[lang]}</p>)}</div>
        </section>

        <section className="partnerEvidence">
          <div className="partnerSectionHead"><div><span>03</span><h3>{es ? "Ledger de evidencia" : "Evidence ledger"}</h3></div><p>{es ? "Lo que sabemos nunca se mezcla con lo que falta." : "What is known never collapses into what is missing."}</p></div>
          <div className="partnerEvidenceGrid">{pack.evidence.map((item) => <article className={item.state} key={item.id}><span>{evidenceLabels[item.state][lang]}</span><strong>{item.label[lang]}</strong><p>{item.detail[lang]}</p></article>)}</div>
        </section>

        <section className="partnerActivation">
          <div><div className="eyebrow">{es ? "04 · ACTIVACIÓN PROPUESTA" : "04 · PROPOSED ACTIVATION"}</div><h3>{es ? "Un piloto acotado, no un acuerdo cerrado" : "A bounded pilot—not a closed deal"}</h3><div>{pack.activationAssets.map((item, index) => <article key={item.en}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item[lang]}</strong></article>)}</div></div>
          <aside><span>{es ? "ASK EXPLORATORIO" : "EXPLORATORY ASK"}</span><strong>{pack.commercialAsk[lang]}</strong><small>{es ? "No vinculante · sujeto a revisión y aprobación" : "Non-binding · subject to review and approval"}</small></aside>
        </section>

        <section className="partnerKpis">
          <div className="partnerSectionHead"><div><span>05</span><h3>{es ? "Cómo se mediría" : "How it would be measured"}</h3></div></div>
          <div>{pack.kpis.map((item) => <article key={item.id}><span>{item.state.replaceAll("-", " ")}</span><strong>{item.label[lang]}</strong></article>)}</div>
        </section>
      </article>

      <section className="partnerComparison">
        <div className="partnerSectionHead"><div><span>06</span><h2>{es ? "Comparar sin confundir potencial con preparación" : "Compare without confusing potential with readiness"}</h2></div></div>
        <div className="partnerComparisonTable"><div className="header"><span>{es ? "Modelo" : "Model"}</span><span>{es ? "Candidato" : "Candidate"}</span><span>{es ? "Partido" : "Fixture"}</span><span>{es ? "Siguiente prueba" : "Next proof"}</span></div>{data.packs.map((item) => <div key={item.id}><strong>{categoryLabels[item.category][lang]}</strong><span>{item.candidate}</span><span>{item.recommendedFixtureIds.map((id) => data.fixtures.find((fixtureItem) => fixtureItem.fixtureId === id)?.label[lang]).join(" · ")}</span><span>{item.evidence.find((evidence) => evidence.state === "requires-measurement")?.label[lang]}</span></div>)}</div>
      </section>

      <PilotReadinessControlRoom readiness={readiness} packs={data} />

      <section className="partnerPhases">
        <div className="partnerSectionHead"><div><span>08</span><h2>{es ? "Ruta hacia un piloto autorizado" : "Route to an authorised pilot"}</h2></div><p>{es ? "Ninguna fase avanza automáticamente." : "No phase advances automatically."}</p></div>
        <div>{data.pilotPhases.map((phase, index) => <article key={phase.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{phase.label[lang]}</strong><p>{phase.output[lang]}</p><small>{phase.state}</small></article>)}</div>
      </section>

      <section className="partnerGates">
        <div><div className="eyebrow">APPROVAL GATES</div><h2>{es ? "Cinco responsables antes de activar" : "Five owners before activation"}</h2><p>{es ? "Medición, condiciones comerciales, operaciones, derechos y privacidad permanecen pendientes." : "Measurement, commercial terms, operations, rights and privacy remain pending."}</p></div>
        <div>{data.approvalGates.map((gate) => <article key={gate.id}><span>{gate.state}</span><strong>{gate.label[lang]}</strong><small>{gate.owner[lang]}</small></article>)}</div>
      </section>

      <details className="partnerGuardrails"><summary>{es ? "Límites del dossier" : "Pack guardrails"}</summary>{data.guardrails.map((item) => <p key={item.id}>{item.text[lang]}</p>)}</details>
      <footer className="partnerPrintFooter"><span>London City Fan Opportunity Engine · Partner Commercial Pack</span><strong>{pack.candidate}</strong><span>{es ? "Borrador independiente · no vinculante" : "Independent draft · non-binding"}</span></footer>
    </main>
  );
}
