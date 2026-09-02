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
 const {lang}=useLanguage();
 const es=lang==='es';
 return <LiveMatchProvider fixture={fixture}><main>
  <NavTabs/>
  <section className="compactIntro">
    <div className="eyebrow">{es ? "ESTA SEMANA" : "THIS WEEK"}</div>
    <h1>{es ? "¿Qué debería hacer el club ahora?" : "What should the club do now?"}</h1>
    <p className="lede">{es ? "Una recomendación operativa para el próximo partido en casa: acción, territorio, producto y señales que pueden cambiarla." : "One operating recommendation for the next home fixture: action, territory, product and the signals that can still change it."}</p>
  </section>

  <ThisWeekHero/>

  <section className="panel widePanel decisionInputsPanel">
    <div className="sectionHeader"><div><div className="eyebrow">{es ? "INPUTS DE DECISIÓN" : "DECISION INPUTS"}</div><h3>{es ? "Qué sostiene la recomendación" : "What is holding up the recommendation"}</h3></div></div>
    <LiveSignalGrid/>
  </section>

  <details className="evidenceDisclosure">
    <summary>{es ? "Ver evidencia y fuentes" : "View evidence and sources"}</summary>
    <div className="evidenceDisclosureBody"><EvidenceList/></div>
  </details>

  <div className="methodJump">
    <span>{es ? "¿Quieres ver pesos, reglas y estados de evidencia?" : "Want the weights, rules and evidence states?"}</span>
    <Link href="/method">{es ? "Abrir método →" : "Open method →"}</Link>
  </div>
 </main></LiveMatchProvider>;
}
