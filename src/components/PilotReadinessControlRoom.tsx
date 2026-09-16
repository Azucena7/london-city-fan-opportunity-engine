"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import type { PartnerCommercialPackData, PilotReadinessData, PilotReadinessState } from "@/lib/models";

const readinessLabels: Record<PilotReadinessState, { en: string; es: string }> = {
  ready: { en: "Ready", es: "Listo" },
  waiting: { en: "Waiting", es: "Pendiente" },
  blocked: { en: "Blocked", es: "Bloqueado" }
};

const decisionLabels = {
  "recommended-for-review": { en: "Recommended for review", es: "Recomendado para revisión" },
  hold: { en: "Hold", es: "En espera" },
  "not-prioritised": { en: "Not prioritised", es: "No priorizado" }
};

export function PilotReadinessControlRoom({ readiness, packs }: { readiness: PilotReadinessData; packs: PartnerCommercialPackData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [selectedPackId, setSelectedPackId] = useState(readiness.recommendedPackId);
  const selected = readiness.candidates.find((item) => item.packId === selectedPackId) ?? readiness.candidates[0];
  const selectedPack = packs.packs.find((item) => item.id === selected.packId);
  const selectedFixture = packs.fixtures.find((item) => item.fixtureId === selected.fixtureId);
  const recommended = readiness.candidates.find((item) => item.packId === readiness.recommendedPackId) ?? readiness.candidates[0];
  const recommendedPack = packs.packs.find((item) => item.id === recommended.packId);
  const recommendedFixture = packs.fixtures.find((item) => item.fixtureId === recommended.fixtureId);
  const stateCounts = readiness.checklist.reduce((counts, item) => ({ ...counts, [item.state]: counts[item.state] + 1 }), { ready: 0, waiting: 0, blocked: 0 });

  function ownerName(ownerId: string) {
    return readiness.owners.find((owner) => owner.id === ownerId)?.label[lang] ?? ownerId;
  }

  return (
    <section className="pilotControlRoom" id="pilot-readiness">
      <div className="partnerSectionHead readinessSectionHead">
        <div><span>05</span><h2>Pilot Readiness Control Room</h2></div>
        <p>{readiness.principle[lang]}</p>
      </div>

      <div className="readinessHero">
        <div>
          <div className="eyebrow">{es ? "RECOMENDACIÓN PROVISIONAL" : "PROVISIONAL RECOMMENDATION"}</div>
          <h3>{readiness.headline[lang]}</h3>
          <p>{recommendedPack?.candidate} · {recommendedFixture?.label[lang]}</p>
        </div>
        <div className="readinessDecision">
          <span>{es ? "DECISIÓN ACTUAL" : "CURRENT DECISION"}</span>
          <strong>{readiness.decision.state.toUpperCase()}</strong>
          <small>{recommended.weightedScore.toFixed(1)} / 5 · {stateCounts.blocked} {es ? "bloqueos" : "blockers"}</small>
        </div>
      </div>

      <div className="readinessRanking" aria-label={es ? "Ranking provisional de pilotos" : "Provisional pilot ranking"}>
        {readiness.candidates.map((candidate) => {
          const pack = packs.packs.find((item) => item.id === candidate.packId);
          return <button type="button" key={candidate.packId} className={candidate.packId === selected.packId ? "selected" : ""} aria-pressed={candidate.packId === selected.packId} onClick={() => setSelectedPackId(candidate.packId)}><span>0{candidate.rank}</span><strong>{pack?.candidate}</strong><b>{candidate.weightedScore.toFixed(1)}</b><small>{decisionLabels[candidate.decision][lang]}</small></button>;
        })}
      </div>

      <div className="readinessScorecard">
        <div className="readinessMatrix">
          <div className="readinessMatrixHeader"><span>{es ? "Candidato" : "Candidate"}</span>{readiness.scoringModel.dimensions.map((dimension) => <span key={dimension.id}>{dimension.label[lang]}<small>{dimension.weight}%</small></span>)}<span>Total</span></div>
          {readiness.candidates.map((candidate) => {
            const pack = packs.packs.find((item) => item.id === candidate.packId);
            return <button type="button" key={candidate.packId} onClick={() => setSelectedPackId(candidate.packId)} className={candidate.packId === selected.packId ? "selected" : ""}><strong>{pack?.candidate}</strong>{readiness.scoringModel.dimensions.map((dimension) => <span key={dimension.id}>{candidate.scores[dimension.id]}</span>)}<b>{candidate.weightedScore.toFixed(1)}</b></button>;
          })}
        </div>
        <aside>
          <span>#{selected.rank} · {decisionLabels[selected.decision][lang]}</span>
          <h3>{selectedPack?.candidate}</h3>
          <strong>{selectedFixture?.label[lang]}</strong>
          <p>{selected.rationale[lang]}</p>
          <small>{es ? "Bloqueos declarados" : "Declared blockers"}</small>
          <div>{selected.blockers.map((blocker) => <code key={blocker}>{blocker}</code>)}</div>
        </aside>
      </div>

      <div className="readinessSubhead"><div><span>01</span><h3>{es ? "Checklist de decisión" : "Decision checklist"}</h3></div><p><b>{stateCounts.ready}</b> {es ? "listos" : "ready"} · <b>{stateCounts.waiting}</b> {es ? "pendientes" : "waiting"} · <b>{stateCounts.blocked}</b> {es ? "bloqueados" : "blocked"}</p></div>
      <div className="readinessChecklist">
        {readiness.checklist.map((item) => <article className={item.state} key={item.id}><div><span>{readinessLabels[item.state][lang]}</span><small>{item.category}</small></div><strong>{item.label[lang]}</strong><p>{ownerName(item.ownerId)}</p><code>{item.sourceRef}</code></article>)}
      </div>

      <div className="readinessSubhead"><div><span>02</span><h3>{es ? "Responsables antes del contacto" : "Owners before outreach"}</h3></div><p>{es ? "Los cargos son roles requeridos, no personas asignadas." : "These are required roles, not assigned people."}</p></div>
      <div className="readinessOwners">
        {readiness.owners.map((owner) => <article key={owner.id}><span>{owner.state.replaceAll("-", " ")}</span><strong>{owner.label[lang]}</strong><p>{owner.remit[lang]}</p></article>)}
      </div>

      <div className="readinessSubhead"><div><span>03</span><h3>{es ? "Ruta T−90 → T+7" : "T−90 → T+7 route"}</h3></div><p>{es ? "Ningún hito avanza automáticamente." : "No milestone advances automatically."}</p></div>
      <div className="readinessTimeline">
        {readiness.timeline.map((item) => <article className={item.state} key={item.id}><span>{item.offset}</span><strong>{item.label[lang]}</strong><p>{item.output[lang]}</p><small>{ownerName(item.ownerId)}</small></article>)}
      </div>

      <div className="readinessInputs">
        <section>
          <div className="eyebrow">{es ? "INPUTS PRESUPUESTARIOS" : "BUDGET INPUTS"}</div>
          <h3>{es ? "Cero cifras inventadas" : "No invented numbers"}</h3>
          <div>{readiness.budgetInputs.map((item) => <article key={item.id}><strong>{item.label[lang]}</strong><span>— {item.currency}</span><small>{item.state.replaceAll("-", " ")}</small></article>)}</div>
        </section>
        <section className="readinessOutreach">
          <div className="eyebrow">{es ? "BORRADOR INTERNO · NO ENVIADO" : "INTERNAL DRAFT · NOT SENT"}</div>
          <h3>{readiness.outreachDraft.subject[lang]}</h3>
          <p>{readiness.outreachDraft.opening[lang]}</p>
          <ol>{readiness.outreachDraft.agenda.map((item) => <li key={item.en}>{item[lang]}</li>)}</ol>
          <div><span>{readiness.outreachDraft.state.replaceAll("-", " ")}</span><strong>{es ? "Envío deshabilitado" : "Sending disabled"}</strong></div>
        </section>
      </div>

      <div className="readinessFinalDecision">
        <div><span>GO / HOLD / NO-GO</span><strong>{readiness.decision.state.toUpperCase()}</strong></div>
        <div><h3>{es ? "Siguiente revisión" : "Next review"}</h3><p>{readiness.decision.nextReview[lang]}</p></div>
        <div>{readiness.decision.blockingChecklistIds.map((id) => <code key={id}>{id}</code>)}</div>
      </div>

      <details className="readinessGuardrails"><summary>{es ? "Límites del Control Room" : "Control Room guardrails"}</summary>{readiness.guardrails.map((item) => <p key={item.id}>{item.text[lang]}</p>)}</details>
    </section>
  );
}
