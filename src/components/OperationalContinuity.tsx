"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./OperationalContinuity.module.css";

type Club={id:string;name:string;role:string};
type ContinuityCase={
  id:string;
  case_key:string;
  departing_role:string;
  effective_at?:string|null;
  continuity_owner_role:string;
  successor_status:"unknown"|"nominated"|"confirmed";
  state:"planned"|"handover"|"ready-to-transition"|"closed";
  note?:string|null;
  created_at:string;
  updated_at:string;
  closed_at?:string|null;
};
type ContinuityItem={
  id:string;
  case_id:string;
  category:"decisions"|"requests"|"work-packages"|"contracts"|"calendar"|"sources"|"access"|"knowledge";
  title:string;
  state:"pending"|"transferred"|"verified"|"not-applicable";
  owner_role?:string|null;
  verified_at?:string|null;
};

const categories:Record<ContinuityItem["category"],string>={
  decisions:"Decisions",
  requests:"Requests",
  "work-packages":"Work packages",
  contracts:"Contracts",
  calendar:"Calendar",
  sources:"Sources",
  access:"Access",
  knowledge:"Knowledge"
};

export function OperationalContinuity(){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [cases,setCases]=useState<ContinuityCase[]>([]);
  const [items,setItems]=useState<ContinuityItem[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [message,setMessage]=useState("");
  const [departingRole,setDepartingRole]=useState("");
  const [ownerRole,setOwnerRole]=useState("");
  const [effectiveAt,setEffectiveAt]=useState("");
  const [note,setNote]=useState("");
  const [busy,setBusy]=useState("");

  async function load(id:string){
    const response=await fetch("/api/operational-continuity?clubId="+encodeURIComponent(id),{cache:"no-store"});
    const result=await response.json() as {enabled?:boolean;cases?:ContinuityCase[];items?:ContinuityItem[];message?:string};
    setEnabled(Boolean(result.enabled));
    setCases(response.ok&&Array.isArray(result.cases)?result.cases:[]);
    setItems(response.ok&&Array.isArray(result.items)?result.items:[]);
    setMessage(result.message??"");
  }

  useEffect(()=>{void(async()=>{
    const response=await fetch("/api/auth/session",{cache:"no-store"});
    const result=await response.json() as {authenticated?:boolean;clubs?:Club[]};
    const next=Array.isArray(result.clubs)?result.clubs:[];
    setClubs(next);
    if(result.authenticated&&next.length){setClubId(next[0].id);await load(next[0].id);}
  })();},[]);

  async function createCase(){
    if(!clubId||!departingRole.trim()||!ownerRole.trim())return;
    setBusy("create");
    setMessage("");
    const response=await fetch("/api/operational-continuity",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({clubId,departingRole,continuityOwnerRole:ownerRole,effectiveAt:effectiveAt||null,note})
    });
    const result=await response.json() as {error?:string;warning?:string};
    setMessage(response.ok?(result.warning??"Continuity case created."):result.error??"Continuity case could not be created.");
    if(response.ok){setDepartingRole("");setOwnerRole("");setEffectiveAt("");setNote("");await load(clubId);}
    setBusy("");
  }

  async function updateItem(id:string,state:ContinuityItem["state"]){
    setBusy(id+state);
    const response=await fetch("/api/operational-continuity",{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({clubId,target:"item",id,state})
    });
    const result=await response.json() as {error?:string};
    setMessage(response.ok?"Handover item updated.":result.error??"Handover item could not be updated.");
    if(response.ok)await load(clubId);
    setBusy("");
  }

  async function updateCase(id:string,patch:Record<string,string>){
    setBusy(id+JSON.stringify(patch));
    const response=await fetch("/api/operational-continuity",{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({clubId,target:"case",id,...patch})
    });
    const result=await response.json() as {error?:string};
    setMessage(response.ok?"Continuity case updated.":result.error??"Continuity case could not be updated.");
    if(response.ok)await load(clubId);
    setBusy("");
  }

  const openCases=cases.filter(item=>item.state!=="closed");
  const readiness=useMemo(()=>openCases.map(item=>{
    const handover=items.filter(entry=>entry.case_id===item.id);
    const complete=handover.filter(entry=>entry.state==="verified"||entry.state==="not-applicable").length;
    return {id:item.id,total:handover.length,complete,pct:handover.length?Math.round((complete/handover.length)*100):0};
  }),[openCases,items]);

  if(!clubs.length)return null;

  if(enabled===false){
    return <section className={styles.unavailable}>
      <span>Operational continuity</span>
      <strong>Continuity persistence is prepared but not enabled here yet.</strong>
      <p>{message||"Once enabled, AVELA will keep staff changes from breaking decision ownership, execution, contract obligations or institutional memory."}</p>
    </section>;
  }

  return <section className={styles.wrap} aria-label="Operational continuity protocol">
    <div className={styles.head}>
      <div>
        <span>Operational continuity</span>
        <h2>Staff can change. The operating memory should not.</h2>
        <p>AVELA treats a departure or role change as a governed handover: open decisions, requests, work packages, contracts, calendars, sources, access and tacit operating knowledge all need explicit coverage.</p>
      </div>
      <aside>
        <span>Open transitions</span>
        <strong>{openCases.length}</strong>
        <small>{openCases.some(item=>item.successor_status!=="confirmed")?"Coverage still needs confirmation.":"Successor coverage confirmed for open cases."}</small>
      </aside>
    </div>

    <div className={styles.protocol}>
      <article><span>01</span><strong>Detect change</strong><p>Record the role transition and effective date early.</p></article>
      <article><span>02</span><strong>Map exposure</strong><p>Find live decisions, requests, contracts, calendars and work packages.</p></article>
      <article><span>03</span><strong>Transfer ownership</strong><p>Assign interim or successor coverage without rewriting history.</p></article>
      <article><span>04</span><strong>Verify handover</strong><p>Close each operational dependency explicitly.</p></article>
      <article><span>05</span><strong>Deactivate last</strong><p>Remove access only after coverage and knowledge transfer are confirmed.</p></article>
    </div>

    <div className={styles.create}>
      <div>
        <span>Start a continuity case</span>
        <strong>Use roles, not personal memory, as the operating anchor.</strong>
      </div>
      {clubs.length>1?<label>Club<select value={clubId} onChange={e=>{setClubId(e.target.value);void load(e.target.value);}}>{clubs.map(club=><option key={club.id} value={club.id}>{club.name}</option>)}</select></label>:null}
      <label>Role changing<input value={departingRole} onChange={e=>setDepartingRole(e.target.value)} placeholder="e.g. Activation Manager"/></label>
      <label>Continuity owner<input value={ownerRole} onChange={e=>setOwnerRole(e.target.value)} placeholder="e.g. Head of Marketing"/></label>
      <label>Effective date<input type="datetime-local" value={effectiveAt} onChange={e=>setEffectiveAt(e.target.value)}/></label>
      <label>Context<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Reason, timing or known constraints"/></label>
      <button type="button" disabled={Boolean(busy)||!departingRole.trim()||!ownerRole.trim()} onClick={()=>void createCase()}>{busy==="create"?"Creating…":"Start handover"}</button>
    </div>

    <div className={styles.cases}>
      {openCases.map(item=>{
        const handover=items.filter(entry=>entry.case_id===item.id);
        const progress=readiness.find(entry=>entry.id===item.id);
        const ready=(progress?.pct??0)===100&&item.successor_status==="confirmed";
        return <article key={item.id} className={styles.caseCard} data-state={item.state}>
          <header>
            <div><span>{item.state.replaceAll("-"," ")}</span><h3>{item.departing_role}</h3><p>Continuity owner · {item.continuity_owner_role}{item.effective_at?" · effective "+new Date(item.effective_at).toLocaleString("en-GB"):""}</p></div>
            <div className={styles.score}><strong>{progress?.pct??0}%</strong><small>{progress?.complete??0}/{progress?.total??0} verified</small></div>
          </header>

          <div className={styles.coverage}>
            <span>Successor coverage</span>
            <div>
              {(["unknown","nominated","confirmed"] as const).map(state=><button key={state} type="button" data-active={item.successor_status===state} disabled={Boolean(busy)} onClick={()=>void updateCase(item.id,{successorStatus:state})}>{state}</button>)}
            </div>
          </div>

          <div className={styles.items}>
            {handover.map(entry=><div key={entry.id} data-state={entry.state}>
              <div><span>{categories[entry.category]}</span><strong>{entry.title}</strong></div>
              <div className={styles.itemActions}>
                <button type="button" disabled={Boolean(busy)||entry.state==="verified"} onClick={()=>void updateItem(entry.id,"transferred")}>Transferred</button>
                <button type="button" disabled={Boolean(busy)||entry.state==="verified"} onClick={()=>void updateItem(entry.id,"verified")}>Verify</button>
                <button type="button" disabled={Boolean(busy)||entry.state==="verified"} onClick={()=>void updateItem(entry.id,"not-applicable")}>N/A</button>
              </div>
            </div>)}
          </div>

          <footer>
            <div><span>Transition rule</span><strong>{ready?"Ready to close":"Do not deactivate the departing owner yet"}</strong></div>
            <div>
              {item.state==="planned"?<button type="button" disabled={Boolean(busy)} onClick={()=>void updateCase(item.id,{state:"handover"})}>Begin handover</button>:null}
              {item.state==="handover"&&ready?<button type="button" disabled={Boolean(busy)} onClick={()=>void updateCase(item.id,{state:"ready-to-transition"})}>Mark ready</button>:null}
              {item.state==="ready-to-transition"&&ready?<button type="button" disabled={Boolean(busy)} onClick={()=>void updateCase(item.id,{state:"closed"})}>Close transition</button>:null}
            </div>
          </footer>
        </article>;
      })}
      {!openCases.length?<div className={styles.empty}><strong>No active continuity case.</strong><p>That is different from “no continuity risk”: start a case as soon as a departure, leave, transfer or role change becomes known.</p></div>:null}
    </div>

    <div className={styles.guardrail}>
      <strong>History is preserved.</strong>
      <p>AVELA reassigns future operational ownership without rewriting who made past decisions, who approved work or what was actually executed. Access removal is the final step, not the first.</p>
    </div>
    {message?<p className={styles.message}>{message}</p>:null}
  </section>;
}
