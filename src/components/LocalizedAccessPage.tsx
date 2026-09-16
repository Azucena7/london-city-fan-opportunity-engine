"use client";

import { useEffect, useState } from "react";
import { NavTabs } from "./NavTabs";
import { JourneyPlanner } from "./JourneyPlanner";
import { TerritoryTravelIntelligence } from "./TerritoryTravelIntelligence";
import { MobilityPartnershipLayer } from "./MobilityPartnershipLayer";
import { useLanguage } from "./LanguageProvider";
import type { TerritoryTravelSeed } from "@/lib/territoryTravel";
import type { MobilityPartnershipData } from "@/lib/models";

type View = "fan" | "territory" | "partner";

export function LocalizedAccessPage({
  territories,
  matchDate,
  matchKickoff,
  targetArrival,
  mobility
}: {
  territories: TerritoryTravelSeed[];
  matchDate?: string;
  matchKickoff?: string;
  targetArrival?: string;
  mobility: MobilityPartnershipData;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [view, setView] = useState<View>("fan");

  useEffect(() => {
    if (window.location.hash === "#territory") setView("territory");
    if (window.location.hash === "#fan") setView("fan");
    if (window.location.hash === "#partner") setView("partner");
  }, []);

  function select(next: View) {
    setView(next);
    window.history.replaceState(null, "", `/access#${next}`);
  }

  return (
    <main>
      <NavTabs />
      <section className="compactIntro">
        <div className="eyebrow">{es ? "ACCESO" : "ACCESS"}</div>
        <h1>{es ? "¿Puede esa audiencia llegar realmente a Hayes Lane?" : "Can that audience actually get to Hayes Lane?"}</h1>
        <p className="lede">
          {es
            ? "El mismo problema a tres escalas: ayudar a una persona, orientar una decisión territorial y comprobar si un servicio agregado merece un partner."
            : "The same problem at three scales: help one fan, guide a territory decision and test whether an aggregated service merits a partner."}
        </p>
      </section>

      <div className="viewTabs" role="tablist">
        <button className={view === "fan" ? "active" : ""} onClick={() => select("fan")}>{es ? "Trayecto individual" : "Fan journey"}</button>
        <button className={view === "territory" ? "active" : ""} onClick={() => select("territory")}>{es ? "Acceso territorial" : "Territory access"}</button>
        <button className={view === "partner" ? "active" : ""} onClick={() => select("partner")}>{es ? "Partnership de movilidad" : "Mobility partnership"}</button>
      </div>

      <section className="accessThesis">
        <strong>{es ? "Un trayecto no es demanda." : "One journey isn't demand."}</strong>
        <span>{es ? "La experiencia individual informa; la evidencia agregada orienta territorios y partnerships." : "Individual experience informs; aggregated evidence guides territory and partnership decisions."}</span>
      </section>

      {view === "fan" ? <JourneyPlanner matchDate={matchDate} matchKickoff={matchKickoff} /> : null}
      {view === "territory" ? <TerritoryTravelIntelligence territories={territories} matchDate={matchDate} targetArrival={targetArrival} /> : null}
      {view === "partner" ? <MobilityPartnershipLayer data={mobility} /> : null}
    </main>
  );
}
