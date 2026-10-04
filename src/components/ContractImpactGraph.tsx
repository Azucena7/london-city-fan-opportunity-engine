"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./ContractImpactGraph.module.css";

type Club={id:string;name:string;role:string};
type Impact={
  id:string;
  entity_type:"sponsor"|"player"|"campaign"|"fixture"|"season"|"decision";
  entity_id:string;
  relationship_type:"applies-to"|"blocks"|"requires"|"supersedes";
  review_state:"pending"|"acknowledged"|"resolved";
  reason:string;
  created_at:string;
  updated_at:string;
};

function hrefFor(impact:Impact){
  if(impact.entity_type==="fixture")return "/app/matches/"+encodeURIComponent(impact.entity_id);
  if(impact.entity_type==="player")return "/app/players";
  if(impact.entity_type==="sponsor")return "/app/sponsors";
  if(impact.entity_type==="campaign")return "/app/campaigns";
  if(impact.entity_type==="season")return "/app/season";
  return "/app";
}

export function ContractImpactGraph(){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [impacts,setImpacts]=useState<Impact[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [message,setMessage]=useState("");

  async function load(id:string){
    const response=await fetch("/api/contracts/impacts?clubId="+encodeURIComponent(id),{cache:"no-store"});
    const result=await response.json() as {enabled?:boolean;impacts?:Impact[];message?:string};
    setEnabled(Boolean(result.enabled));
    setImpacts(response.ok&&Array.isArray(result.impacts)?result.impacts:[]);
    setMessage(result.message??"");
  }

  useEffect(()=>{void(async()=>{
    const response=await fetch("/api/auth/session",{cache:"no-store"});
    const result=await response.json() as {authenticated?:boolean;clubs?:Club[]};
    const next=Array.isArray(result.clubs)?result.clubs:[];
    setClubs(next);
    if(result.authenticated&&next.length){setClubId(next[0].id);await load(next[0].id);}
  })();},[]);

  const counts=useMemo(()=>({
    pending:impacts.filter(item=>item.review_state==="pending").length,
    acknowledged:impacts.filter(item=>item.review_state==="acknowledged").length,
    resolved:impacts.filter(item=>item.review_state==="resolved").length
  }),[impacts]);

  if(!clubs.length)return null;

  if(enabled===false){
    return <section className={styles.unavailable}>
      <span>Contract Impact Graph</span>
      <strong>No contract-impact queue is available yet.</strong>
      <p>{message||"Verified material clauses will create review requirements here once the governed persistence layer is enabled."}</p>
    </section>;
  }

  return <section className={styles.wrap} aria-label="Contract Impact Graph">
    <div className={styles.head}>
      <div>
        <span>Contract Impact Graph</span>
        <h2>Which decisions must be reviewed because verified contract truth changed?</h2>
        <p>This is a sanitised operational view. It shows the affected entity and relationship, not the underlying legal clause text.</p>
      </div>
      {clubs.length>1?<label>Club<select value={clubId} onChange={e=>{setClubId(e.target.value);void load(e.target.value);}}>{clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>:null}
    </div>

    <div className={styles.counts}>
      <article><span>Review required</span><strong>{counts.pending}</strong></article>
      <article><span>Acknowledged</span><strong>{counts.acknowledged}</strong></article>
      <article><span>Resolved</span><strong>{counts.resolved}</strong></article>
    </div>

    <div className={styles.list}>
      {impacts.filter(item=>item.review_state!=="resolved").map(item=><article key={item.id} data-state={item.review_state}>
        <div className={styles.state}><span>{item.review_state.replaceAll("-"," ")}</span><small>{new Date(item.created_at).toLocaleString("en-GB")}</small></div>
        <div>
          <span>{item.entity_type} · {item.relationship_type.replaceAll("-"," ")}</span>
          <strong>{item.entity_id}</strong>
          <p>{item.reason}</p>
        </div>
        <Link href={hrefFor(item)}>Open affected workspace →</Link>
      </article>)}
      {!impacts.some(item=>item.review_state!=="resolved")?<div className={styles.empty}><strong>No unresolved contract impact review.</strong><p>A verified material clause only appears here when it is explicitly linked to an affected entity.</p></div>:null}
    </div>

    <div className={styles.rule}>
      <strong>Verified clause → explicit entity link → review required.</strong>
      <p>No link means AVELA does not guess the impact. Raw clause text remains restricted to Contract Intelligence.</p>
    </div>
  </section>;
}
