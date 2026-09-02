"use client";

import { useEffect, useState } from "react";
import { NavTabs } from "./NavTabs";
import { JourneyPlanner } from "./JourneyPlanner";
import { TerritoryTravelIntelligence } from "./TerritoryTravelIntelligence";
import { useLanguage } from "./LanguageProvider";
import type { TerritoryTravelSeed } from "@/lib/territoryTravel";

type View = "fan" | "territory";

export function LocalizedAccessPage({
  territories,
  matchDate,
  matchKickoff,
  targetArrival
}: {
  territories: TerritoryTravelSeed[];
  matchDate?: string;
  matchKickoff?: string;
  targetArrival?: string;
}) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [view, setView] = useState<View>("fan");

  useEffect(() => {
    if (window.location.hash === "#territory") setView("territory");
    if (window.location.hash === "#fan") setView("fan");
  }, []);

  function select(next: View) {
    setView(next);
    window.history.replaceState(null, "", `/access#${next}`);
  }

  return <main>
    <NavTabs/>
    <section className="compactIntro">
      <div className="eyebrow">{es ? "ACCESO" : "ACCESS"}</div>
      <h1>{es ? "¿Puede esa audiencia llegar realmente a Hayes Lane?" : "Can that audience actually get to Hayes Lane?"}</h1>
      <p className="lede">{es ? "El mismo problema a dos escalas: un journey ayuda a una persona; varios journeys ayudan al club a tomar una decisión territorial." : "The same problem at two scales: one journey helps a fan; multiple journeys help the club make a territory decision."}</p>
    </section>

    <div className="viewTabs" role="tablist">
      <button className={view === "fan" ? "active" : ""} onClick={() => select("fan")}>{es ? "Journey individual" : "Fan journey"}</button>
      <button className={view === "territory" ? "active" : ""} onClick={() => select("territory")}>{es ? "Acceso territorial" : "Territory access"}</button>
    </div>

    <section className="accessThesis">
      <strong>{es ? "Un journey no es un territorio." : "One journey isn't a territory."}</strong>
      <span>{es ? "La experiencia individual informa; la evidencia agregada decide." : "Individual experience informs; aggregated evidence decides."}</span>
    </section>

    {view === "fan" ? <JourneyPlanner matchDate={matchDate} matchKickoff={matchKickoff}/> : <TerritoryTravelIntelligence territories={territories} matchDate={matchDate} targetArrival={targetArrival}/>} 
  </main>;
}
