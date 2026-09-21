"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { NavTabs } from "./NavTabs";
import { useLanguage } from "./LanguageProvider";
import { emitMeasurementEvent, type MeasurementDeliveryState } from "@/lib/measurement";
import type { ExperienceDemandData, ExperimentMeasurementData } from "@/lib/models";

type ValidationPayload = {
  schema_version: "1.0";
  event_name: string;
  concept_id: string;
  fixture_id: string;
  origin_market: string;
  origin_id: string;
  party_size: string;
  price_band: string;
  hotel_interest: boolean;
  transport_interest: boolean;
  spanish_host_interest: boolean;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
};

function statusLabel(state: string, es: boolean) {
  if (state === "ready") return es ? "listo" : "ready";
  if (state === "requires-instrumentation") return es ? "requiere medición" : "requires instrumentation";
  return es ? "bloqueado" : "blocked";
}

export function ExperienceDemandValidation({ data, measurement }: { data: ExperienceDemandData; measurement: ExperimentMeasurementData }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const [conceptId, setConceptId] = useState("");
  const [fixtureId, setFixtureId] = useState("");
  const [originId, setOriginId] = useState("");
  const [partySize, setPartySize] = useState("");
  const [priceBand, setPriceBand] = useState("");
  const [hotelInterest, setHotelInterest] = useState(false);
  const [transportInterest, setTransportInterest] = useState(false);
  const [spanishHostInterest, setSpanishHostInterest] = useState(false);
  const [completed, setCompleted] = useState<ValidationPayload | null>(null);
  const [deliveryState, setDeliveryState] = useState<MeasurementDeliveryState | null>(null);

  const concept = useMemo(() => data.concepts.find((item) => item.id === conceptId), [conceptId, data.concepts]);
  const origin = useMemo(() => data.origins.find((item) => item.id === originId), [originId, data.origins]);
  const configurationReady = Boolean(concept && fixtureId && origin && partySize && priceBand);

  function chooseConcept(id: string) {
    setConceptId(id);
    setPriceBand("");
    setCompleted(null);
    setDeliveryState(null);
    void emitMeasurementEvent({
      eventName: "experience_concept_selected",
      properties: { concept_id: id },
      locale: lang
    });
  }

  async function submitValidation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!concept || !origin || !configurationReady) return;
    const params = new URLSearchParams(window.location.search);
    const payload: ValidationPayload = {
      schema_version: "1.0",
      event_name: data.analytics.eventName,
      concept_id: concept.id,
      fixture_id: fixtureId,
      origin_market: origin.market,
      origin_id: origin.id,
      party_size: partySize,
      price_band: priceBand,
      hotel_interest: hotelInterest,
      transport_interest: transportInterest,
      spanish_host_interest: spanishHostInterest,
      utm_source: params.get("utm_source") ?? "direct",
      utm_medium: params.get("utm_medium") ?? "prototype",
      utm_campaign: params.get("utm_campaign") ?? "experience-demand-validation",
      utm_content: params.get("utm_content") ?? concept.id
    };
    setCompleted(payload);
    const experiment = measurement.experiments.find((item) => item.fixtureId === fixtureId);
    const result = await emitMeasurementEvent({
      eventName: "experience_validation_complete",
      fixtureId,
      experimentId: experiment?.id,
      locale: lang,
      properties: {
        concept_id: concept.id,
        origin_market: origin.market,
        origin_id: origin.id,
        party_size: partySize,
        price_band: priceBand,
        hotel_interest: hotelInterest,
        transport_interest: transportInterest,
        spanish_host_interest: spanishHostInterest
      }
    });
    setDeliveryState(result.state);
  }

  return (
    <main className="experiencePage">
      <NavTabs />

      <section className="experienceHero">
        <div>
          <div className="eyebrow">EXPERIENCE DEMAND VALIDATION · V1</div>
          <h1>{data.headline[lang]}</h1>
          <p>{data.principle[lang]}</p>
          <div className="experienceSafety"><span>{es ? "VALIDACIÓN, NO VENTA" : "VALIDATION, NOT SALE"}</span><strong>{es ? "Sin reserva, sin pago y sin datos personales" : "No reservation, no payment and no personal data"}</strong></div>
        </div>
        <div className="experienceHeroMetric">
          <span>{es ? "CONCEPTOS A CONTRASTAR" : "CONCEPTS TO TEST"}</span>
          <strong>{data.concepts.length}</strong>
          <small>{es ? "local · VIP · internacional" : "local · VIP · international"}</small>
        </div>
      </section>

      <section className="experienceConcepts" aria-labelledby="experience-concepts-title">
        <div className="experienceSectionHead">
          <div><span>01</span><h2 id="experience-concepts-title">{es ? "Elige la propuesta que considerarías" : "Choose the proposition you would consider"}</h2></div>
          <p>{es ? "Los precios son rangos de investigación, no tarifas publicadas." : "Prices are research bands, not published offers."}</p>
        </div>
        <div className="experienceConceptGrid">
          {data.concepts.map((item, index) => (
            <article key={item.id} className={conceptId === item.id ? "selected" : ""}>
              <div className="conceptTop"><span>0{index + 1}</span><b>{item.state.replaceAll("-", " ")}</b></div>
              <h3>{item.title[lang]}</h3>
              <p className="conceptStrapline">{item.strapline[lang]}</p>
              <small>{item.audience[lang]}</small>
              <div className="conceptScope">
                <strong>{es ? "CONCEPTO INCLUYE" : "CONCEPT INCLUDES"}</strong>
                {item.includes.map((entry) => <p key={entry.en}>✓ {entry[lang]}</p>)}
              </div>
              <details><summary>{es ? "Límites del concepto" : "Concept limits"}</summary>{item.excludes.map((entry) => <p key={entry.en}>{entry[lang]}</p>)}</details>
              <button type="button" aria-pressed={conceptId === item.id} onClick={() => chooseConcept(item.id)}>{conceptId === item.id ? (es ? "Seleccionado" : "Selected") : (es ? "Consideraría esta opción" : "I would consider this")}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="experienceBuilder" aria-labelledby="experience-builder-title">
        <div className="experienceSectionHead">
          <div><span>02</span><h2 id="experience-builder-title">{es ? "Configura la señal de demanda" : "Configure the demand signal"}</h2></div>
          <p>{es ? "Solo se genera un evento anónimo si completas todos los campos obligatorios." : "An anonymous event is generated only after every required field is complete."}</p>
        </div>

        <form onSubmit={submitValidation}>
          <div className="experienceFields">
            <label><span>{es ? "Partido" : "Fixture"}</span><select value={fixtureId} onChange={(event) => { setFixtureId(event.target.value); setCompleted(null); }} required><option value="">{es ? "Selecciona" : "Select"}</option>{data.fixtures.map((item) => <option value={item.id} key={item.id}>{item.label[lang]}</option>)}</select></label>
            <label><span>{es ? "Origen" : "Origin"}</span><select value={originId} onChange={(event) => { setOriginId(event.target.value); setCompleted(null); }} required><option value="">{es ? "Selecciona" : "Select"}</option>{data.origins.map((item) => <option value={item.id} key={item.id}>{item.label[lang]}</option>)}</select></label>
            <label><span>{es ? "Tamaño del grupo" : "Party size"}</span><select value={partySize} onChange={(event) => { setPartySize(event.target.value); setCompleted(null); }} required><option value="">{es ? "Selecciona" : "Select"}</option>{data.partySizes.map((item) => <option value={item.id} key={item.id}>{item.label[lang]}</option>)}</select></label>
            <label><span>{es ? "Precio que considerarías" : "Price you would consider"}</span><select value={priceBand} onChange={(event) => { setPriceBand(event.target.value); setCompleted(null); }} required disabled={!concept}><option value="">{concept ? (es ? "Selecciona" : "Select") : (es ? "Elige primero un concepto" : "Choose a concept first")}</option>{concept?.priceBands.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
          </div>

          <fieldset className="experiencePreferences">
            <legend>{es ? "¿Qué necesitarías?" : "What would you need?"}</legend>
            <label><input type="checkbox" checked={hotelInterest} onChange={(event) => { setHotelInterest(event.target.checked); setCompleted(null); }} /><span>{es ? "Hotel" : "Hotel"}</span></label>
            <label><input type="checkbox" checked={transportInterest} onChange={(event) => { setTransportInterest(event.target.checked); setCompleted(null); }} /><span>{es ? "Transporte terrestre" : "Ground transport"}</span></label>
            <label><input type="checkbox" checked={spanishHostInterest} onChange={(event) => { setSpanishHostInterest(event.target.checked); setCompleted(null); }} /><span>{es ? "Anfitrión en español" : "Spanish-speaking host"}</span></label>
          </fieldset>

          <div className="experienceSubmit">
            <div><span>{es ? "EVENTO PREPARADO" : "PREPARED EVENT"}</span><strong>{data.analytics.eventName}</strong><small>{es ? "No contiene nombre, email, teléfono, dirección ni pago." : "Contains no name, email, phone, address or payment."}</small></div>
            <button type="submit" disabled={!configurationReady}>{es ? "Confirmar configuración de prueba" : "Confirm test configuration"}</button>
          </div>
        </form>

        {completed ? (
          <div className="experienceCompletion" role="status">
            <span>{es ? "CONFIGURACIÓN COMPLETADA" : "CONFIGURATION COMPLETE"}</span>
            <strong>{concept?.title[lang]} · {data.fixtures.find((item) => item.id === completed.fixture_id)?.label[lang]}</strong>
            <p>{deliveryState === "delivered"
              ? (es ? "El proveedor configurado ha aceptado el evento anónimo. La cohorte solo será visible después de validación y agregación." : "The configured provider accepted the anonymous event. The cohort will only appear after validation and aggregation.")
              : (es ? "El evento se ha validado localmente, pero no se ha almacenado porque no existe un proveedor configurado o la entrega no se completó." : "The event was validated locally but was not stored because no provider is configured or delivery did not complete.")}</p>
            <small>{deliveryState ?? (es ? "comprobando entrega" : "checking delivery")}</small>
          </div>
        ) : null}
      </section>

      <section className="experienceFunnel">
        <div className="experienceSectionHead"><div><span>03</span><h2>{es ? "Qué está listo y qué sigue bloqueado" : "What is ready and what remains blocked"}</h2></div></div>
        <div className="experienceFunnelGrid">
          {data.funnel.map((item, index) => <article className={item.state} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><b>{statusLabel(item.state, es)}</b><strong>{item.label[lang]}</strong><p>{item.measure[lang]}</p></article>)}
        </div>
      </section>

      <section className="experienceReadiness">
        <div><div className="eyebrow">{es ? "GATES DE LANZAMIENTO" : "LAUNCH GATES"}</div><h2>{es ? "La demanda puede medirse antes de vender" : "Demand can be measured before selling"}</h2><p>{es ? "Registro, depósitos y venta solo se habilitarán cuando cada responsable apruebe su parte." : "Registration, deposits and sales will only unlock when each owner approves their part."}</p></div>
        <div>{data.launchGates.map((gate) => <article key={gate.id}><span>{gate.state}</span><strong>{gate.label[lang]}</strong><small>{gate.owner[lang]}</small></article>)}</div>
      </section>

      <section className="experienceMobilityBridge">
        <div><div className="eyebrow">EXPERIENCE → MOBILITY</div><h2>{es ? "¿Puede el interés agregado sostener un shuttle?" : "Can aggregated interest support a shuttle?"}</h2><p>{es ? "La nueva capa convierte el interés por transporte en escenarios de corredor, capacidad y punto de equilibrio, sin reservar ningún servicio." : "The new layer turns transport interest into corridor, capacity and break-even scenarios without booking any service."}</p></div>
        <div><Link href="/access#partner">{es ? "Abrir acceso al partido" : "Open Matchday Access"} →</Link><Link href="/measurement">{es ? "Ver medición" : "View measurement"} →</Link></div>
      </section>

      <details className="experienceGuardrails"><summary>{es ? "Guardrails de la validación" : "Validation guardrails"}</summary>{data.guardrails.map((item) => <p key={item.id}>{item.text[lang]}</p>)}</details>
    </main>
  );
}
