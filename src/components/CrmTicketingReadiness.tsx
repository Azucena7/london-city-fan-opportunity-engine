"use client";

import { useLanguage } from "./LanguageProvider";
import type { CrmTicketingDemo, CrmTicketingReadiness as ReadinessData } from "@/lib/models";

const flow = ["fixture", "campaign", "content", "purchase", "scan", "repeat"];

export function CrmTicketingReadiness({ data, demo }: { data: ReadinessData; demo: CrmTicketingDemo }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const locale = es ? "es-ES" : "en-GB";
  const records = demo.records;
  const scans = records.filter((row) => row.scan_status === "scanned").length;
  const noShows = records.filter((row) => row.scan_status === "not_scanned").length;
  const buyers = new Set(records.map((row) => row.supporter_id_hash));
  const firstTimeBuyers = new Set(records.filter((row) => row.first_time_buyer).map((row) => row.supporter_id_hash));
  const attributed = records.filter((row) => row.campaign_id).length;
  const averagePrice = records.reduce((sum, row) => sum + row.realised_unit_price, 0) / records.length;
  const ready = data.coverage.filter((item) => item.state === "ready").length;
  const demoReady = data.coverage.filter((item) => item.state === "demo").length;
  const channelRows = [...new Set(records.map((row) => row.channel))].map((channel) => {
    const channelRecords = records.filter((row) => row.channel === channel);
    return {
      channel,
      tickets: channelRecords.length,
      scans: channelRecords.filter((row) => row.scan_status === "scanned").length
    };
  });

  return (
    <section className="crmReadiness" aria-labelledby="crm-readiness-title">
      <div className="crmReadinessTop">
        <div>
          <div className="eyebrow">CRM + TICKETING READINESS</div>
          <h2 id="crm-readiness-title">{data.headline[lang]}</h2>
          <p>{data.principle[lang]}</p>
        </div>
        <div className="syntheticNotice">
          <span>{es ? "MODO ACTUAL" : "CURRENT MODE"}</span>
          <strong>{es ? "Ensayo sintético" : "Synthetic rehearsal"}</strong>
          <p>{demo.disclaimer[lang]}</p>
        </div>
      </div>

      <div className="crmDemoKpis" aria-label={es ? "Indicadores sintéticos" : "Synthetic indicators"}>
        <div><strong>{records.length}</strong><span>{es ? "entradas demo" : "demo tickets"}</span></div>
        <div><strong>{scans}</strong><span>{es ? "scans demo" : "demo scans"}</span></div>
        <div><strong>{((noShows / records.length) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}%</strong><span>no-show demo</span></div>
        <div><strong>£{averagePrice.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>{es ? "precio medio demo" : "demo average price"}</span></div>
      </div>

      <details className="crmExplorer">
        <summary>{es ? "Explorar contrato, cálculos y preparación para datos reales" : "Explore contract, calculations and readiness for real data"}</summary>

        <div className="crmFlow" aria-label={es ? "Cadena de atribución" : "Attribution chain"}>
          {flow.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}
        </div>

        <div className="crmDemoRead">
          <div>
            <span>{es ? "COMPRADORES ÚNICOS" : "UNIQUE BUYERS"}</span>
            <strong>{buyers.size}</strong>
            <small>{firstTimeBuyers.size} {es ? "nuevos en la demo" : "first-time in the demo"}</small>
          </div>
          <div>
            <span>{es ? "ATRIBUCIÓN" : "ATTRIBUTION"}</span>
            <strong>{attributed}/{records.length}</strong>
            <small>{es ? "entradas con campaign_id" : "tickets with campaign_id"}</small>
          </div>
          <div>
            <span>{es ? "COBERTURA TÉCNICA" : "TECHNICAL COVERAGE"}</span>
            <strong>{ready + demoReady}/{data.coverage.length}</strong>
            <small>{es ? "listo o comprobado en demo" : "ready or proven in demo"}</small>
          </div>
        </div>

        <div className="crmReadinessGrid">
          {data.coverage.map((item) => (
            <article className={item.state} key={item.id}>
              <span>{item.state.replace("-", " ")}</span>
              <strong>{item.label[lang]}</strong>
              <p>{item.detail[lang]}</p>
            </article>
          ))}
        </div>

        <section className="crmChannelDemo">
          <div>
            <div className="eyebrow">{es ? "ENSAYO POR CANAL" : "CHANNEL REHEARSAL"}</div>
            <h3>{es ? "El cálculo funciona antes de conectar la fuente" : "Calculations work before the source is connected"}</h3>
          </div>
          <div className="crmChannelRows">
            {channelRows.map((row) => (
              <div key={row.channel}>
                <strong>{row.channel}</strong>
                <span>{row.tickets} {es ? "entradas" : "tickets"}</span>
                <span>{row.scans} scans</span>
              </div>
            ))}
          </div>
        </section>

        <div className="crmDownloads">
          <div><span>{es ? "CONTRATO" : "CONTRACT"}</span><strong>v{data.contractVersion} · {es ? "una fila por entrada" : "one row per ticket"}</strong></div>
          <a href={data.templateUrl} download>{es ? "Descargar plantilla Excel" : "Download Excel template"} ↓</a>
          <a href={data.schemaUrl} target="_blank" rel="noreferrer">{es ? "Ver esquema técnico" : "View technical schema"} ↗</a>
        </div>
        <p className="crmPrivacyNote">{es
          ? "La plantilla excluye nombres, emails, teléfonos, postcodes completos, fechas de nacimiento y datos de pago. El club debe revisar gobernanza, base jurídica y pseudonimización antes de cualquier importación real."
          : "The template excludes names, email addresses, phone numbers, full postcodes, dates of birth and payment data. The club must review governance, lawful basis and pseudonymisation before any real import."}</p>
      </details>
    </section>
  );
}
