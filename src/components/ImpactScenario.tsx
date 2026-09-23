"use client";

import { useMemo, useState } from "react";
import styles from "./ImpactScenario.module.css";

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
}

export function ImpactScenario() {
  const [audience, setAudience] = useState(1420);
  const [conversion, setConversion] = useState(22);
  const [ticketValue, setTicketValue] = useState(15);
  const [campaignCost, setCampaignCost] = useState(750);

  const model = useMemo(() => {
    const tickets = Math.round(audience * (conversion / 100));
    const grossRevenue = tickets * ticketValue;
    const netContribution = grossRevenue - campaignCost;
    const returnMultiple = campaignCost > 0 ? grossRevenue / campaignCost : 0;
    return { tickets, grossRevenue, netContribution, returnMultiple };
  }, [audience, conversion, ticketValue, campaignCost]);

  return (
    <section className={styles.model} aria-label="Illustrative impact scenario">
      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="audience">Addressable audience</label>
          <input id="audience" type="number" min={0} value={audience} onChange={(e) => setAudience(Number(e.target.value))} />
          <span>fans</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="conversion">Scenario conversion</label>
          <input id="conversion" type="number" min={0} max={100} step={1} value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
          <span>%</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="ticketValue">Average ticket value</label>
          <input id="ticketValue" type="number" min={0} step={1} value={ticketValue} onChange={(e) => setTicketValue(Number(e.target.value))} />
          <span>GBP</span>
        </div>
        <div className={styles.control}>
          <label htmlFor="campaignCost">Activation cost</label>
          <input id="campaignCost" type="number" min={0} step={50} value={campaignCost} onChange={(e) => setCampaignCost(Number(e.target.value))} />
          <span>GBP</span>
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

      <div className={styles.formula}>
        <span>Transparent planning logic</span>
        <code>audience × scenario conversion × ticket value − activation cost</code>
      </div>
      <p className={styles.note}>
        This is a scenario tool, not a forecast. In a club deployment, default inputs should be replaced by measured cohort size,
        observed conversion ranges, ticket economics and actual campaign cost.
      </p>
    </section>
  );
}
