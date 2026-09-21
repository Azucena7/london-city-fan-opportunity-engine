"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { JourneyPlanner } from "./JourneyPlanner";
import { TerritoryTravelIntelligence } from "./TerritoryTravelIntelligence";
import { MobilityPartnershipLayer } from "./MobilityPartnershipLayer";
import { useLanguage } from "./LanguageProvider";
import type { TerritoryTravelSeed } from "@/lib/territoryTravel";
import type { ExperimentMeasurementData, MobilityPartnershipData } from "@/lib/models";

type View = "fan" | "territory" | "partner";

export function LocalizedAccessPage({
  territories,
  matchDate,
  matchKickoff,
  targetArrival,
  fixtureOpponent,
  fixtureScore,
  fixtureDecision,
  mobility,
  measurement
}: {
  territories: TerritoryTravelSeed[];
  matchDate?: string;
  matchKickoff?: string;
  targetArrival?: string;
  fixtureOpponent?: string;
  fixtureScore?: number;
  fixtureDecision?: string;
  mobility: MobilityPartnershipData;
  measurement: ExperimentMeasurementData;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [view, setView] = useState<View>("territory");
  const [initialTerritory, setInitialTerritory] = useState<string>();

  useEffect(() => {
    const requestedTerritory = new URLSearchParams(window.location.search).get("territory");
    if (requestedTerritory) setInitialTerritory(requestedTerritory);
    if (window.location.hash === "#fan") setView("fan");
    if (window.location.hash === "#partner") setView("partner");
    if (window.location.hash === "#territory") setView("territory");
  }, []);

  function select(next: View) {
    setView(next);
    window.history.replaceState(null, "", `/access#${next}`);
  }

  return (
    <main>
      <NavTabs />
      <section className="compactIntro accessFlowIntro">
        <div>
          <div className="eyebrow">{es ? "ACCESO AL PARTIDO" : "MATCHDAY ACCESS"}</div>
          <h1>{es ? "Valida si la oportunidad territorial puede convertirse en asistencia" : "Validate whether territory opportunity can become attendance"}</h1>
          <p className="lede">{es ? "El acceso no reemplaza la demanda: comprueba si el día de partido añade suficiente fricción como para cambiar captación, comunicación o servicio." : "Access does not replace demand: it tests whether matchday adds enough friction to change acquisition, messaging or service."}</p>
        </div>
        <div className="accessFixtureContext">
          <span>{es ? "PRÓXIMO PARTIDO EN CASA" : "NEXT HOME FIXTURE"}</span>
          <strong>{fixtureOpponent ?? "—"}</strong>
          <small>{matchDate ?? "—"} · {matchKickoff ?? "—"} · {es ? "llegada" : "arrival"} {targetArrival ?? "—"}</small>
          {fixtureScore ? <b>{fixtureScore}/100 · {fixtureDecision}</b> : null}
        </div>
      </section>

      <nav className="accessDecisionFlow" aria-label={es ? "Flujo de decisión territorial" : "Territory decision flow"}>
        <Link href="/territories"><span>01</span><strong>{es ? "Priorizar territorio" : "Prioritise territory"}</strong></Link>
        <div className="active"><span>02</span><strong>{es ? "Validar acceso" : "Validate access"}</strong></div>
        <div><span>03</span><strong>{es ? "Elegir respuesta" : "Choose response"}</strong></div>
      </nav>

      <div className="viewTabs accessViewTabs" role="tablist" aria-label={es ? "Escala de análisis" : "Analysis scale"}>
        <button role="tab" aria-selected={view === "territory"} className={view === "territory" ? "active" : ""} onClick={() => select("territory")}><span>{es ? "DECISIÓN INTERNA" : "INTERNAL DECISION"}</span>{es ? "Acceso territorial" : "Territory access"}</button>
        <button role="tab" aria-selected={view === "fan"} className={view === "fan" ? "active" : ""} onClick={() => select("fan")}><span>{es ? "PREVIEW AFICIONADO" : "FAN PREVIEW"}</span>{es ? "Trayecto individual" : "Individual journey"}</button>
        <button role="tab" aria-selected={view === "partner"} className={view === "partner" ? "active" : ""} onClick={() => select("partner")}><span>{es ? "ESCALADO" : "ESCALATION"}</span>{es ? "Partnership de movilidad" : "Mobility partnership"}</button>
      </div>

      <section className="accessThesis">
        <strong>{view === "territory" ? (es ? "La decisión empieza agregada." : "The decision starts aggregated.") : view === "fan" ? (es ? "Un trayecto no es demanda." : "One journey isn't demand.") : (es ? "Un partner requiere evidencia." : "A partner requires evidence.")}</strong>
        <span>{view === "territory" ? (es ? "Compara varios orígenes antes de mantener, adaptar o proteger captación." : "Compare multiple origins before maintaining, adapting or protecting acquisition.") : view === "fan" ? (es ? "Esta vista demuestra la experiencia que recibiría una persona; no decide por todo un territorio." : "This view demonstrates the experience one person would receive; it does not decide for a whole territory.") : (es ? "Solo escala una solución cuando la fricción agregada, el volumen y la medición justifican la intervención." : "Scale a solution only when aggregated friction, volume and measurement justify intervention.")}</span>
      </section>

      {view === "fan" ? <JourneyPlanner matchDate={matchDate} matchKickoff={matchKickoff} /> : null}
      {view === "territory" ? <TerritoryTravelIntelligence territories={territories} matchDate={matchDate} targetArrival={targetArrival} initialTerritoryId={initialTerritory} /> : null}
      {view === "partner" ? <MobilityPartnershipLayer data={mobility} measurement={measurement} /> : null}
    </main>
  );
}
