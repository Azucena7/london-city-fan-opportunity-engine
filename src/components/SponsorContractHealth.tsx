"use client";

import { useEffect, useState } from "react";
import styles from "./SponsorContractHealth.module.css";

type Club={id:string;name:string;role:string};
type SponsorContract={
  id:string;
  sponsor:string;
  title:string;
  effectiveStart?:string|null;
  effectiveEnd?:string|null;
  version?:string|null;
  sourceSystem?:string|null;
  sourceRef?:string|null;
  verifiedClauseCount:number;
  rightsCount:number;
  obligationCount:number;
  deadlineCount:number;
  linkedDecisionCount:number;
  fulfilmentState:"evidence-linked"|"not-measured";
  obligations:Array<{id:string;type:string;label:string;material:boolean;validTo?:string|null;section?:string|null}>;
};

export function SponsorContractHealth(){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [items,setItems]=useState<SponsorContract[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [measurementState,setMeasurementState]=useState("not-connected");
  const [message,setMessage]=useState("");

  async function load(id:string){
    const response=await fetch("/api/sponsors/contract-health?clubId="+encodeURIComponent(id),{cache:"no-store"});
    const result=await response.json() as {enabled?:boolean;sponsors?:SponsorContract[];measurementState?:string;message?:string};
    setEnabled(Boolean(result.enabled));
    setItems(response.ok&&Array.isArray(result.sponsors)?result.sponsors:[]);
    setMeasurementState(result.measurementState??"not-connected");
    setMessage(result.message??"");
  }

  useEffect(()=>{void(async()=>{
    const response=await fetch("/api/auth/session",{cache:"no-store"});
    const result=await response.json() as {authenticated?:boolean;clubs?:Club[]};
    const next=Array.isArray(result.clubs)?result.clubs:[];
    setClubs(next);
    if(result.authenticated&&next.length){setClubId(next[0].id);await load(next[0].id);}
  })();},[]);

  if(!clubs.length)return null;

  if(enabled===false){
    return <section className={styles.unavailable}>
      <span>Contract health</span>
      <strong>Verified sponsor obligations are not connected yet.</strong>
      <p>{message||"Prospecting remains available, but AVELA will not infer contract fulfilment from partner-development data."}</p>
    </section>;
  }

  return <section className={styles.wrap} aria-label="Verified sponsor contract health">
    <div className={styles.head}>
      <div>
        <span>Verified contract health</span>
        <h2>What has the club actually committed to?</h2>
        <p>This section uses active sponsor contracts and verified clauses only. It is deliberately separate from prospecting readiness.</p>
      </div>
      <aside>
        {clubs.length > 1 ? (
          <label>
            Club
            <select value={clubId} onChange={(event) => { setClubId(event.target.value); void load(event.target.value); }}>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>
        ) : null}
        <span>Fulfilment evidence</span>
        <strong>{measurementState.replaceAll("-"," ")}</strong>
        <small>{measurementState==="not-measured"?"No execution linkage yet — do not show 0%.":"Some verified obligations are linked to operational decisions."}</small>
      </aside>
    </div>

    <div className={styles.grid}>
      {items.map(item=><article key={item.id}>
        <div className={styles.top}><span>Active contract · {item.version??"version unlabelled"}</span><small>{item.effectiveStart??"?"} → {item.effectiveEnd??"?"}</small></div>
        <h3>{item.sponsor}</h3>
        <p className={styles.title}>{item.title}</p>

        <div className={styles.metrics}>
          <div><span>Verified clauses</span><strong>{item.verifiedClauseCount}</strong></div>
          <div><span>Rights</span><strong>{item.rightsCount}</strong></div>
          <div><span>Obligations</span><strong>{item.obligationCount}</strong></div>
          <div><span>Deadlines</span><strong>{item.deadlineCount}</strong></div>
        </div>

        <div className={styles.fulfilment} data-state={item.fulfilmentState}>
          <span>Fulfilment</span>
          <strong>{item.fulfilmentState==="evidence-linked"?"Evidence linked":"Not measured"}</strong>
          <small>{item.linkedDecisionCount} linked decision{item.linkedDecisionCount===1?"":"s"}</small>
        </div>

        <details>
          <summary>Verified obligations</summary>
          <div className={styles.obligations}>
            {item.obligations.map(obligation=><div key={obligation.id}>
              <span>{obligation.type}{obligation.material?" · material":""}</span>
              <strong>{obligation.label}</strong>
              <small>{obligation.validTo?"Valid to "+obligation.validTo:"No clause deadline recorded"}{obligation.section?" · "+obligation.section:""}</small>
            </div>)}
            {!item.obligations.length?<p>No verified obligation clause is recorded for this contract.</p>:null}
          </div>
        </details>

        <small className={styles.source}>{item.sourceSystem??"Source system unknown"}{item.sourceRef?" · "+item.sourceRef:""}</small>
      </article>)}

      {!items.length?<div className={styles.empty}>
        <strong>No active verified sponsor contract is available.</strong>
        <p>AVELA can still rank partner opportunities, but Sponsor Contract Health stays empty until a reviewed contract version becomes active.</p>
      </div>:null}
    </div>

    <div className={styles.rule}><strong>Contract delivery ≠ performance.</strong><p>Rights delivered, campaign performance and rights utilisation remain separate dimensions. Blinkfire can contribute performance evidence; it does not define contractual truth.</p></div>
  </section>;
}
