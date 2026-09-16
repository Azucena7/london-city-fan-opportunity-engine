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

export function PartnerCommercialPack({ data, readiness }: { data: PartnerCommercialPackData; readiness: PilotReadinessData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [packId, setPackId] = useState(data.packs[0]?.id ?? "");
  const pack = data.packs.find((item) => item.id === packId) ?? data.packs[0];
  const [fixtureId, setFixtureId] = useState(pack.recommendedFixtureIds[0] ?? "");
  const fixture = data.fixtures.find((item) => item.fixtureId === fixtureId) ?? data.fixtures[0];

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
          <div className="eyebrow">PARTNER COMMERCIAL PACK · V1.9</div>
          <h1>{data.headline[lang]}</h1>
          <p>{data.principle[lang]}</p>
          <div className="partnerDraftState"><span>{es ? "BORRADOR DE PROSPECCIÓN" : "PROSPECTING DRAFT"}</span><strong>{es ? "Ningún candidato contactado · ninguna oferta emitida" : "No candidate contacted · no offer issued"}</strong></div>
        </div>
        <div className="partnerHeroActions"><button type="button" onClick={() => window.print()}>{es ? "Imprimir / guardar PDF" : "Print / save PDF"}</button><Link href="/measurement">{es ? "Comprobar evidencia" : "Check evidence"} →</Link></div>
      </section>

      <section className="partnerSelector">
        <div className="partnerSectionHead"><div><span>01</span><h2>{es ? "Selecciona el modelo de partnership" : "Select the partnership model"}</h2></div><p>{es ? "Los nombres son candidatos de investigación, no relaciones existentes." : "Names are research candidates, not existing relationships."}</p></div>
        <div className="partnerSelectorGrid">{data.packs.map((item, index) => <button type="button" aria-pressed={item.id === pack.id} className={item.id === pack.id ? "selected" : ""} key={item.id} onClick={() => selectPack(item.id)}><span>0{index + 1} · {categoryLabels[item.category][lang]}</span><strong>{item.candidate}</strong><small>{item.relationshipState.replaceAll("-", " ")}</small></button>)}</div>
      </section>

      <article className="partnerDossier">
        <header className="partnerDossierHeader">
          <div><span>{categoryLabels[pack.category][lang]} · {pack.relationshipState.replaceAll("-", " ")}</span><h2>{pack.title[lang]}</h2><p>{pack.proposition[lang]}</p></div>
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
          <div className="partnerSectionHead"><div><span>02</span><h3>{es ? "Ledger de evidencia" : "Evidence ledger"}</h3></div><p>{es ? "Lo que sabemos nunca se mezcla con lo que falta." : "What is known never collapses into what is missing."}</p></div>
          <div className="partnerEvidenceGrid">{pack.evidence.map((item) => <article className={item.state} key={item.id}><span>{evidenceLabels[item.state][lang]}</span><strong>{item.label[lang]}</strong><p>{item.detail[lang]}</p></article>)}</div>
        </section>

        <section className="partnerActivation">
          <div><div className="eyebrow">{es ? "ACTIVACIÓN PROPUESTA" : "PROPOSED ACTIVATION"}</div><h3>{es ? "Un piloto acotado, no un acuerdo cerrado" : "A bounded pilot—not a closed deal"}</h3><div>{pack.activationAssets.map((item, index) => <article key={item.en}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item[lang]}</strong></article>)}</div></div>
          <aside><span>{es ? "ASK EXPLORATORIO" : "EXPLORATORY ASK"}</span><strong>{pack.commercialAsk[lang]}</strong><small>{es ? "No vinculante · sujeto a revisión y aprobación" : "Non-binding · subject to review and approval"}</small></aside>
        </section>

        <section className="partnerKpis">
          <div className="partnerSectionHead"><div><span>03</span><h3>{es ? "Cómo se mediría" : "How it would be measured"}</h3></div></div>
          <div>{pack.kpis.map((item) => <article key={item.id}><span>{item.state.replaceAll("-", " ")}</span><strong>{item.label[lang]}</strong></article>)}</div>
        </section>
      </article>

      <section className="partnerComparison">
        <div className="partnerSectionHead"><div><span>04</span><h2>{es ? "Cuatro modelos, distintas dependencias" : "Four models, different dependencies"}</h2></div></div>
        <div className="partnerComparisonTable"><div className="header"><span>{es ? "Modelo" : "Model"}</span><span>{es ? "Candidato" : "Candidate"}</span><span>{es ? "Partido" : "Fixture"}</span><span>{es ? "Siguiente prueba" : "Next proof"}</span></div>{data.packs.map((item) => <div key={item.id}><strong>{categoryLabels[item.category][lang]}</strong><span>{item.candidate}</span><span>{item.recommendedFixtureIds.map((id) => data.fixtures.find((fixtureItem) => fixtureItem.fixtureId === id)?.label[lang]).join(" · ")}</span><span>{item.evidence.find((evidence) => evidence.state === "requires-measurement")?.label[lang]}</span></div>)}</div>
      </section>

      <PilotReadinessControlRoom readiness={readiness} packs={data} />

      <section className="partnerPhases">
        <div className="partnerSectionHead"><div><span>06</span><h2>{es ? "Ruta hacia un piloto autorizado" : "Route to an authorised pilot"}</h2></div><p>{es ? "Ninguna fase avanza automáticamente." : "No phase advances automatically."}</p></div>
        <div>{data.pilotPhases.map((phase, index) => <article key={phase.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{phase.label[lang]}</strong><p>{phase.output[lang]}</p><small>{phase.state}</small></article>)}</div>
      </section>

      <section className="partnerGates">
        <div><div className="eyebrow">APPROVAL GATES</div><h2>{es ? "Cinco responsables antes de activar" : "Five owners before activation"}</h2><p>{es ? "Medición, condiciones comerciales, operaciones, derechos y privacidad permanecen pendientes." : "Measurement, commercial terms, operations, rights and privacy remain pending."}</p></div>
        <div>{data.approvalGates.map((gate) => <article key={gate.id}><span>{gate.state}</span><strong>{gate.label[lang]}</strong><small>{gate.owner[lang]}</small></article>)}</div>
      </section>

      <details className="partnerGuardrails"><summary>{es ? "Límites del dossier" : "Pack guardrails"}</summary>{data.guardrails.map((item) => <p key={item.id}>{item.text[lang]}</p>)}</details>
      <footer className="partnerPrintFooter"><span>London City Fan Opportunity Lab · Partner Commercial Pack</span><strong>{pack.candidate}</strong><span>{es ? "Borrador independiente · no vinculante" : "Independent draft · non-binding"}</span></footer>
    </main>
  );
}
