"use client";

import { useEffect, useState } from "react";
import styles from "./PlayerContractHealth.module.css";

type Club={id:string;name:string;role:string};
type PlayerContract={
  id:string;
  player:string;
  title:string;
  effectiveStart?:string|null;
  effectiveEnd?:string|null;
  version?:string|null;
  sourceSystem?:string|null;
  sourceRef?:string|null;
  verifiedClauseCount:number;
  rightsCount:number;
  restrictionCount:number;
  financialCount:number;
  obligationCount:number;
  linkedDecisionCount:number;
  usageMeasurementState:"evidence-linked"|"not-measured";
  keyClauses:Array<{id:string;type:string;label:string;material:boolean;validTo?:string|null;section?:string|null}>;
};

export function PlayerContractHealth(){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [items,setItems]=useState<PlayerContract[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [measurementState,setMeasurementState]=useState("not-connected");
  const [message,setMessage]=useState("");

  async function load(id:string){
    const response=await fetch("/api/players/contract-health?clubId="+encodeURIComponent(id),{cache:"no-store"});
    const result=await response.json() as {enabled?:boolean;players?:PlayerContract[];measurementState?:string;message?:string};
    setEnabled(Boolean(result.enabled));
    setItems(response.ok&&Array.isArray(result.players)?result.players:[]);
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
      <span>Player Contract Health</span>
      <strong>Verified player agreements are not connected yet.</strong>
      <p>{message||"The player planner can continue as a planning surface, but AVELA will not treat demo quotas, fees or restrictions as legal contract truth."}</p>
    </section>;
  }

  return <section className={styles.wrap} aria-label="Verified player contract health">
    <div className={styles.head}>
      <div>
        <span>Verified player contract health</span>
        <h2>What rights, restrictions and obligations are actually available?</h2>
        <p>This layer uses active player agreements and verified clauses only. Sporting availability, momentum and contract truth remain separate signals.</p>
      </div>
      <aside>
        {clubs.length>1?<label>Club<select value={clubId} onChange={e=>{setClubId(e.target.value);void load(e.target.value);}}>{clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>:null}
        <span>Usage evidence</span>
        <strong>{measurementState.replaceAll("-"," ")}</strong>
        <small>{measurementState==="not-measured"?"No linked execution evidence yet — do not show 0 uses.":"Some verified contract terms are linked to operational decisions."}</small>
      </aside>
    </div>

    <div className={styles.grid}>
      {items.map(item=><article key={item.id}>
        <div className={styles.top}><span>Active agreement · {item.version??"version unlabelled"}</span><small>{item.effectiveStart??"?"} → {item.effectiveEnd??"?"}</small></div>
        <h3>{item.player}</h3>
        <p className={styles.title}>{item.title}</p>

        <div className={styles.metrics}>
          <div><span>Verified clauses</span><strong>{item.verifiedClauseCount}</strong></div>
          <div><span>Rights</span><strong>{item.rightsCount}</strong></div>
          <div><span>Restrictions</span><strong>{item.restrictionCount}</strong></div>
          <div><span>Fees / bonuses</span><strong>{item.financialCount}</strong></div>
          <div><span>Obligations</span><strong>{item.obligationCount}</strong></div>
        </div>

        <div className={styles.usage} data-state={item.usageMeasurementState}>
          <span>Commercial usage</span>
          <strong>{item.usageMeasurementState==="evidence-linked"?"Evidence linked":"Not measured"}</strong>
          <small>{item.linkedDecisionCount} linked decision{item.linkedDecisionCount===1?"":"s"}</small>
        </div>

        <details>
          <summary>Verified contract terms</summary>
          <div className={styles.clauses}>
            {item.keyClauses.map(clause=><div key={clause.id}>
              <span>{clause.type}{clause.material?" · material":""}</span>
              <strong>{clause.label}</strong>
              <small>{clause.validTo?"Valid to "+clause.validTo:"No clause deadline recorded"}{clause.section?" · "+clause.section:""}</small>
            </div>)}
            {!item.keyClauses.length?<p>No verified right, restriction, fee or obligation clause is recorded.</p>:null}
          </div>
        </details>

        <small className={styles.source}>{item.sourceSystem??"Source system unknown"}{item.sourceRef?" · "+item.sourceRef:""}</small>
      </article>)}

      {!items.length?<div className={styles.empty}>
        <strong>No active verified player agreement is available.</strong>
        <p>The planning optimiser can still run as a scenario tool, but its demo agreement data must not be presented as club contract truth.</p>
      </div>:null}
    </div>

    <div className={styles.rule}>
      <strong>Contract rights + availability + cost + usage + opportunity cost are different dimensions.</strong>
      <p>AVELA should combine them for recommendations only after the underlying contract rights are verified and operational usage is actually measured.</p>
    </div>
  </section>;
}
