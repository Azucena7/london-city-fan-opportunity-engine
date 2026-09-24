"use client";

import { useMemo, useState } from "react";
import styles from "./ImpactScenario.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
}

type ImpactScenarioProps = {
  fixtureLabel: string;
  liveAudience: number | null;
  liveAudienceState: "measured" | "requires-club-data";
  observedConversionRate: number | null;
  observedConversionLabel: string;
  observedTicketValue: number | null;
  observedTicketValueLabel: string;
};

export function ImpactScenario({
  fixtureLabel,
  liveAudience,
  liveAudienceState,
  observedConversionRate,
  observedConversionLabel,
  observedTicketValue,
  observedTicketValueLabel
}: ImpactScenarioProps) {
  const seededAudience = liveAudience ?? 1420;
  const seededConversion = observedConversionRate === null ? 22 : Math.round(observedConversionRate * 1000) / 10;
  const seededTicketValue = observedTicketValue ?? 15;
  const [audience, setAudience] = useState(seededAudience);
  const [conversion, setConversion] = useState(seededConversion);
  const [ticketValue, setTicketValue] = useState(seededTicketValue);
  const [campaignCost, setCampaignCost] = useState(750);

  const model = useMemo(() => {
    const tickets = Math.round(audience * (conversion / 100));
    const grossRevenue = tickets * ticketValue;
    const netContribution = grossRevenue - campaignCost;
    const returnMultiple = campaignCost > 0 ? grossRevenue / campaignCost : 0;
    return { tickets, grossRevenue, netContribution, returnMultiple };
  }, [audience, conversion, ticketValue, campaignCost]);

  const audienceIsLive = liveAudienceState === "measured" && liveAudience !== null;
  const conversionIsMeasured = observedConversionRate !== null;
  const ticketValueIsMeasured = observedTicketValue !== null;

  return (
    <section className={styles.model} aria-label="Commercial impact scenario">
      <div className={styles.context}>
        <div>
          <span>Linked opportunity</span>
          <strong>{fixtureLabel}</strong>
        </div>
        <div>
          <span>Audience input</span>
          <strong>{audienceIsLive ? "Live measured cohort" : "Illustrative seed — club cohort missing"}</strong>
        </div>
        <div>
          <span>Conversion baseline</span>
          <strong>{conversionIsMeasured ? observedConversionLabel : "Illustrative seed — no measured repeat baseline"}</strong>
        </div>
        <div>
          <span>Ticket value baseline</span>
          <strong>{ticketValueIsMeasured ? observedTicketValueLabel : "Illustrative seed — no measured ticket value"}</strong>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="audience">Addressable audience</label>
          <input id="audience" type="number" min={0} value={audience} onChange={(e) => setAudience(Number(e.target.value))} />
          <span>{audienceIsLive ? "Live engine input" : "Editable scenario input"}</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="conversion">Scenario conversion</label>
          <input id="conversion" type="number" min={0} max={100} step={1} value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
          <span>{conversionIsMeasured ? "Measured historical seed · editable" : "Illustrative assumption · %"}</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="ticketValue">Average ticket value</label>
          <input id="ticketValue" type="number" min={0} step={1} value={ticketValue} onChange={(e) => setTicketValue(Number(e.target.value))} />
          <span>{ticketValueIsMeasured ? "Measured historical seed · editable" : "Illustrative assumption · GBP"}</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="campaignCost">Activation cost</label>
          <input id="campaignCost" type="number" min={0} step={50} value={campaignCost} onChange={(e) => setCampaignCost(Number(e.target.value))} />
          <span>Assumption · GBP</span>
        </div>
      </div>

      <div className={styles.waterfall} aria-label="Scenario calculation flow">
        <div>
          <span>Audience</span>
          <strong>{audience.toLocaleString("en-GB")}</strong>
        </div>
        <b>×</b>
        <div>
          <span>Conversion</span>
          <strong>{conversion}%</strong>
        </div>
        <b>=</b>
        <div className={styles.emphasis}>
          <span>Tickets</span>
          <strong>{model.tickets.toLocaleString("en-GB")}</strong>
        </div>
        <b>×</b>
        <div>
          <span>Ticket value</span>
          <strong>{currency(ticketValue)}</strong>
        </div>
        <b>=</b>
        <div className={styles.emphasis}>
          <span>Gross revenue</span>
          <strong>{currency(model.grossRevenue)}</strong>
        </div>
        <b>−</b>
        <div>
          <span>Activation cost</span>
          <strong>{currency(campaignCost)}</strong>
        </div>
        <b>=</b>
        <div className={styles.result}>
          <span>Net contribution</span>
          <strong>{currency(model.netContribution)}</strong>
        </div>
      </div>

      <div className={styles.outputs}>
        <article>
          <span>Scenario tickets</span>
          <strong>{model.tickets.toLocaleString("en-GB")}</strong>
        </article>
        <article>
          <span>Gross ticket revenue</span>
          <strong>{currency(model.grossRevenue)}</strong>
        </article>
        <article>
          <span>Net contribution</span>
          <strong>{currency(model.netContribution)}</strong>
        </article>
        <article>
          <span>Gross revenue / cost</span>
          <strong>{model.returnMultiple.toFixed(1)}x</strong>
        </article>
      </div>

      <p className={styles.note}>
        Scenario, not forecast. Measured audience, repeat-conversion or ticket-value history can seed the model when authorised aggregate club evidence exists.
        Every input remains editable, and activation cost stays an explicit assumption until the club supplies a measured cost.
      </p>
    </section>
  );
}
