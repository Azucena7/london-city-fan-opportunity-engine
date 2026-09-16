"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { emitMeasurementEvent, type MeasurementDeliveryState } from "@/lib/measurement";
import type { ExperimentMeasurementData, MobilityPartnershipData } from "@/lib/models";

function money(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
}

function band(value: number, cuts: number[]) {
  const first = cuts.find((cut) => value < cut);
  if (first === undefined) return `${cuts.at(-1)}+`;
  const index = cuts.indexOf(first);
  return index === 0 ? `<${first}` : `${cuts[index - 1]}-${first - 1}`;
}

export function MobilityPartnershipLayer({ data, measurement }: { data: MobilityPartnershipData; measurement: ExperimentMeasurementData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [fixtureId, setFixtureId] = useState(data.pilots[0]?.fixtureId ?? "");
  const [corridorId, setCorridorId] = useState(data.corridors[1]?.id ?? data.corridors[0]?.id ?? "");
  const [seats, setSeats] = useState(data.simulator.capacities[1]?.seats ?? data.simulator.capacities[0]?.seats ?? 16);
  const [riders, setRiders] = useState(data.simulator.minimumAggregateCohort);
  const [fare, setFare] = useState(data.simulator.defaultFarePerRider);
  const [deliveryState, setDeliveryState] = useState<MeasurementDeliveryState | null>(null);

  const fixture = data.pilots.find((item) => item.fixtureId === fixtureId) ?? data.pilots[0];
  const corridor = data.corridors.find((item) => item.id === corridorId) ?? data.corridors[0];
  const vehicle = data.simulator.capacities.find((item) => item.seats === seats) ?? data.simulator.capacities[0];
  const opportunityScore = useMemo(() => {
    const weights = data.scoring.weights;
    return Math.round(
      corridor.territoryOpportunity * weights.territoryOpportunity +
      corridor.travelFriction * weights.travelFriction +
      corridor.groupSuitability * weights.groupSuitability +
      fixture.appealScore * weights.fixtureAppeal
    );
  }, [corridor, fixture, data.scoring.weights]);
  const cappedRiders = Math.min(riders, seats);
  const revenue = cappedRiders * fare;
  const balance = revenue - vehicle.scenarioCost;
  const breakEven = Math.ceil(vehicle.scenarioCost / fare);
  const occupancy = Math.round((cappedRiders / seats) * 100);
  const thresholdMet = riders >= data.simulator.minimumAggregateCohort;
  const commercialModelWorks = breakEven <= seats;

  async function measureScenario() {
    setDeliveryState(null);
    const experiment = measurement.experiments.find((item) => item.fixtureId === fixture.fixtureId);
    const result = await emitMeasurementEvent({
      eventName: "mobility_scenario_evaluated",
      fixtureId: fixture.fixtureId,
      experimentId: experiment?.id,
      locale: lang,
      properties: {
        corridor_id: corridor.id,
        vehicle_seats: seats,
        rider_band: band(riders, [10, 20, 33, 49]),
        fare_band: band(fare, [10, 20, 30, 40]),
        occupancy_band: band(occupancy, [25, 50, 75, 100]),
        threshold_met: thresholdMet,
        opportunity_score_band: band(opportunityScore, [50, 65, 80, 90])
      }
    });
    setDeliveryState(result.state);
  }

  return (
    <div className="mobilityLayer">
      <section className="mobilityHero">
        <div>
          <div className="eyebrow">MOBILITY PARTNERSHIP LAYER · V1.7</div>
          <h2>{data.headline[lang]}</h2>
          <p>{data.principle[lang]}</p>
          <div className="mobilityState"><span>{es ? "ESCENARIO, NO SERVICIO" : "SCENARIO, NOT A SERVICE"}</span><strong>{es ? "Demanda aún no medida · ningún partner contactado" : "Demand not yet measured · no partner contacted"}</strong></div>
        </div>
        <div className="mobilityHeroMetric"><span>{es ? "PILOTOS PROPUESTOS" : "PROPOSED PILOTS"}</span><strong>{data.pilots.length}</strong><small>Arsenal · Chelsea · Liverpool</small></div>
      </section>

      <section className="mobilitySection">
        <div className="mobilitySectionHead"><div><span>01</span><h3>{es ? "Tres partidos para aprender, no para prometer" : "Three fixtures to learn—not promise"}</h3></div><p>{es ? "Cada piloto responde una pregunta operativa diferente." : "Each pilot answers a different operating question."}</p></div>
        <div className="mobilityPilotGrid">
          {data.pilots.map((item) => <button type="button" key={item.fixtureId} aria-pressed={item.fixtureId === fixtureId} className={item.fixtureId === fixtureId ? "selected" : ""} onClick={() => setFixtureId(item.fixtureId)}><span>{item.fixtureId === fixtureId ? (es ? "SELECCIONADO" : "SELECTED") : (es ? "ESCENARIO" : "SCENARIO")}</span><strong>{item.label[lang]}</strong><p>{item.purpose[lang]}</p><small>{es ? "Atractivo modelado" : "Modelled appeal"} · {item.appealScore}/100</small></button>)}
        </div>
      </section>

      <section className="mobilitySection">
        <div className="mobilitySectionHead"><div><span>02</span><h3>{es ? "Dónde podría tener sentido un servicio agregado" : "Where an aggregated service could make sense"}</h3></div><p>{data.scoring.explanation[lang]}</p></div>
        <div className="mobilityCorridorGrid">
          {data.corridors.map((item) => {
            const score = Math.round(item.territoryOpportunity * data.scoring.weights.territoryOpportunity + item.travelFriction * data.scoring.weights.travelFriction + item.groupSuitability * data.scoring.weights.groupSuitability + fixture.appealScore * data.scoring.weights.fixtureAppeal);
            return <button type="button" key={item.id} aria-pressed={item.id === corridorId} className={item.id === corridorId ? "selected" : ""} onClick={() => setCorridorId(item.id)}><div><span>{item.evidenceState.replaceAll("-", " ")}</span><b>{score}</b></div><strong>{item.label[lang]}</strong><small>{item.representativeOrigins.join(" · ")}</small><p>{item.note[lang]}</p><div className="mobilityFactors" aria-label={es ? "Oportunidad, fricción y aptitud para grupos" : "Opportunity, friction and group suitability"}><i style={{ width: `${item.territoryOpportunity}%` }} /><i style={{ width: `${item.travelFriction}%` }} /><i style={{ width: `${item.groupSuitability}%` }} /></div></button>;
          })}
        </div>
      </section>

      <section className="mobilitySimulator">
        <div className="mobilitySectionHead"><div><span>03</span><h3>{es ? "Simulador de shuttle / coach" : "Shuttle / coach simulator"}</h3></div><p>{data.simulator.warning[lang]}</p></div>
        <div className="mobilitySimulatorBody">
          <div className="mobilityControls">
            <label><span>{es ? "Corredor" : "Corridor"}</span><select value={corridorId} onChange={(event) => setCorridorId(event.target.value)}>{data.corridors.map((item) => <option key={item.id} value={item.id}>{item.label[lang]}</option>)}</select></label>
            <label><span>{es ? "Capacidad de escenario" : "Scenario capacity"}</span><select value={seats} onChange={(event) => setSeats(Number(event.target.value))}>{data.simulator.capacities.map((item) => <option key={item.seats} value={item.seats}>{item.seats} {es ? "plazas" : "seats"} · {money(item.scenarioCost)}</option>)}</select></label>
            <label><span>{es ? "Viajeros del escenario" : "Scenario riders"}<b>{riders}</b></span><input type="range" min="1" max="60" value={riders} onChange={(event) => setRiders(Number(event.target.value))} /></label>
            <label><span>{es ? "Aportación por viajero" : "Contribution per rider"}<b>{money(fare)}</b></span><input type="range" min="5" max="40" value={fare} onChange={(event) => setFare(Number(event.target.value))} /></label>
          </div>
          <div className="mobilityResults">
            <div className="mobilityScore"><span>{es ? "OPPORTUNITY SCORE" : "OPPORTUNITY SCORE"}</span><strong>{opportunityScore}</strong><small>/100 · {es ? "modelado" : "modelled"}</small></div>
            <div className="mobilityResultGrid">
              <article><span>{es ? "Ocupación" : "Occupancy"}</span><strong>{occupancy}%</strong><small>{cappedRiders}/{seats}</small></article>
              <article><span>{es ? "Punto de equilibrio" : "Break-even"}</span><strong>{breakEven}</strong><small>{es ? "viajeros" : "riders"}</small></article>
              <article><span>{es ? "Ingresos escenario" : "Scenario revenue"}</span><strong>{money(revenue)}</strong><small>{es ? "no precio publicado" : "not a published price"}</small></article>
              <article className={balance >= 0 ? "positive" : "negative"}><span>{es ? "Balance escenario" : "Scenario balance"}</span><strong>{balance >= 0 ? "+" : ""}{money(balance)}</strong><small>{es ? "antes de costes no modelados" : "before unmodelled costs"}</small></article>
            </div>
            <div className={`mobilityThreshold ${thresholdMet ? "met" : "below"}`}><span>{thresholdMet ? "✓" : "!"}</span><div><strong>{thresholdMet ? (es ? "El escenario supera el umbral agregado" : "Scenario clears the aggregate threshold") : (es ? "Por debajo del umbral agregado" : "Below the aggregate threshold")}</strong><p>{es ? `Aun así, se necesitan ${data.simulator.minimumAggregateCohort}+ señales reales instrumentadas; el control actual solo mueve una hipótesis.` : `Even so, ${data.simulator.minimumAggregateCohort}+ real instrumented signals are required; this control only changes a hypothesis.`}</p></div></div>
            <div className="mobilityMeasure"><button type="button" onClick={measureScenario}>{es ? "Registrar escenario de prueba" : "Record test scenario"}</button><div><span>{deliveryState ?? (es ? "AÚN NO EMITIDO" : "NOT EMITTED")}</span><small>{es ? "Solo propiedades agregables; sin origen individual." : "Aggregate-safe properties only; no individual origin."}</small></div></div>
          </div>
        </div>
      </section>

      <section className="mobilityBrief">
        <div><div className="eyebrow">PARTNER BRIEF · DRAFT</div><h3>{fixture.label[lang]} × {corridor.label[lang]}</h3><p>{es ? "Un brief preparado para conversación, no una propuesta enviada." : "A brief prepared for discussion—not a sent proposal."}</p></div>
        <div className="mobilityBriefFacts"><article><span>{es ? "CASO MODELADO" : "MODELLED CASE"}</span><strong>{opportunityScore}/100 · {seats} {es ? "plazas" : "seats"}</strong></article><article><span>{es ? "UMBRAL" : "THRESHOLD"}</span><strong>{data.simulator.minimumAggregateCohort}+ {es ? "intereses medidos" : "measured interests"}</strong></article><article><span>{es ? "ECONOMÍA" : "ECONOMICS"}</span><strong>{commercialModelWorks ? (es ? "Equilibrio posible en capacidad" : "Break-even within capacity") : (es ? "No viable con este supuesto" : "Not viable under this assumption")}</strong></article><article><span>{es ? "SIGUIENTE PRUEBA" : "NEXT PROOF"}</span><strong>{es ? "Instrumentar transport_interest" : "Instrument transport_interest"}</strong></article></div>
        <div className="mobilityPartners">{data.partnerModels.map((item) => <article key={item.id}><span>{item.state.replaceAll("-", " ")}</span><strong>{item.candidate}</strong><p>{item.role[lang]}</p></article>)}</div>
      </section>

      <details className="mobilityGuardrails"><summary>{es ? "Privacidad, evidencia y límites" : "Privacy, evidence and limits"}</summary>{data.guardrails.map((item) => <p key={item.id}>{item.text[lang]}</p>)}</details>
      <div className="mobilityMeasurementLink"><div><span>EXPERIMENT MEASUREMENT</span><strong>{es ? "Comprobar entrega, cohortes y umbrales" : "Check delivery, cohorts and thresholds"}</strong></div><Link href="/measurement">{es ? "Abrir medición" : "Open measurement"} →</Link></div>
    </div>
  );
}
