"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ExternalExecutionSync.module.css";

type Club={id:string;name:string;role:string};
type PackageRow={
  id:string;
  connection_id:string;
  title:string;
  external_package_url?:string|null;
  sync_state:"proposed"|"created"|"syncing"|"synced"|"partial"|"error"|"archived";
  item_count:number;
  completed_count:number;
  blocked_count:number;
  estimated_minutes:number;
  last_sync_at?:string|null;
  sync_error?:string|null;
};
type ItemRow={
  id:string;
  package_id:string;
  package_item_key:string;
  external_url?:string|null;
  state:"created"|"in-progress"|"blocked"|"done";
  assignee_label?:string|null;
  due_at?:string|null;
  blocker_label?:string|null;
  last_sync_at:string;
};
type ConnectionRow={
  id:string;
  system:"asana"|"monday"|"jira"|"notion"|"other";
  label:string;
  state:"connected"|"paused"|"disconnected";
  last_sync_at?:string|null;
};

function safeExternalUrl(value?:string|null){
  return value && /^https:\/\//i.test(value) ? value : null;
}

export function ExternalExecutionSync({decisionId}:{decisionId:string}){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [packages,setPackages]=useState<PackageRow[]>([]);
  const [items,setItems]=useState<ItemRow[]>([]);
  const [connections,setConnections]=useState<ConnectionRow[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [message,setMessage]=useState("");

  async function load(id:string){
    try{
      const response=await fetch("/api/work-system/status?clubId="+encodeURIComponent(id)+"&decisionId="+encodeURIComponent(decisionId),{cache:"no-store"});
      const result=await response.json() as {
        enabled?:boolean;
        packages?:PackageRow[];
        items?:ItemRow[];
        connections?:ConnectionRow[];
        message?:string;
      };
      setEnabled(Boolean(result.enabled));
      setPackages(response.ok&&Array.isArray(result.packages)?result.packages:[]);
      setItems(response.ok&&Array.isArray(result.items)?result.items:[]);
      setConnections(response.ok&&Array.isArray(result.connections)?result.connections:[]);
      setMessage(response.ok?(result.message??""):result.message??"External execution state could not be loaded.");
    }catch{
      setEnabled(false);
      setPackages([]);
      setItems([]);
      setConnections([]);
      setMessage("External execution service is unreachable. No sync state was changed.");
    }
  }

  useEffect(()=>{void(async()=>{
    try{
      const response=await fetch("/api/auth/session",{cache:"no-store"});
      const result=await response.json() as {authenticated?:boolean;clubs?:Club[]};
      const next=Array.isArray(result.clubs)?result.clubs:[];
      setClubs(next);
      if(result.authenticated&&next.length){setClubId(next[0].id);await load(next[0].id);}
    }catch{
      setClubs([]);
      setEnabled(false);
      setMessage("Account state could not be loaded. External sync state remains unchanged.");
    }
  })();},[decisionId]); // eslint-disable-line react-hooks/exhaustive-deps -- reload is intentionally keyed by decision

  useEffect(()=>{
    const refresh=(event:Event)=>{
      const detail=(event as CustomEvent<{decisionId?:string}>).detail;
      if(detail?.decisionId===decisionId&&clubId) void load(clubId);
    };
    window.addEventListener("avela:execution-handoff-proposed",refresh);
    return()=>window.removeEventListener("avela:execution-handoff-proposed",refresh);
  },[clubId,decisionId]); // eslint-disable-line react-hooks/exhaustive-deps -- refresh current projection only

  const total=useMemo(()=>packages.reduce((sum,item)=>sum+item.item_count,0),[packages]);
  const done=useMemo(()=>packages.reduce((sum,item)=>sum+item.completed_count,0),[packages]);
  const blocked=useMemo(()=>packages.reduce((sum,item)=>sum+item.blocked_count,0),[packages]);
  const pct=total?Math.round((done/total)*100):null;

  if(!clubs.length)return null;

  if(enabled===false){
    return <section className={styles.unavailable}>
      <span>Execution sync</span>
      <strong>External work sync is not connected.</strong>
      <p>{message||"AVELA can derive the work package now; task creation and progress sync will appear here after a work-system adapter is connected."}</p>
    </section>;
  }

  if(!packages.length){
    return <section className={styles.unavailable}>
      <span>Execution sync</span>
      <strong>No external work package exists for this decision.</strong>
      <p>The local AVELA work-package preview remains advisory until the club explicitly hands work off to its connected system.</p>
    </section>;
  }

  return <section className={styles.wrap} aria-label="External execution sync">
    <div className={styles.head}>
      <div>
        <span>Execution sync</span>
        <h2>How is the work progressing outside AVELA?</h2>
        <p>Only operational state required for decision intelligence is synced back: progress, assignee, due date and blockers.</p>
      </div>
      {clubs.length>1?<label>Club<select value={clubId} onChange={e=>{setClubId(e.target.value);void load(e.target.value);}}>{clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>:null}
    </div>

    <div className={styles.summary}>
      <article><span>Progress</span><strong>{pct===null?"—":pct+"%"}</strong><small>{done}/{total} complete</small></article>
      <article><span>Blocked</span><strong>{blocked}</strong><small>synced work item{blocked===1?"":"s"}</small></article>
      <article><span>Packages</span><strong>{packages.length}</strong><small>external execution package{packages.length===1?"":"s"}</small></article>
      <article><span>Connections</span><strong>{connections.filter(c=>c.state==="connected").length}</strong><small>active work-system adapter{connections.filter(c=>c.state==="connected").length===1?"":"s"}</small></article>
    </div>

    <div className={styles.packages}>
      {packages.map(pkg=>{
        const connection=connections.find(c=>c.id===pkg.connection_id);
        const packageItems=items.filter(item=>item.package_id===pkg.id);
        const packageUrl=safeExternalUrl(pkg.external_package_url);
        return <article key={pkg.id}>
          <header>
            <div><span>{connection?.system??"external"} · {pkg.sync_state}</span><h3>{pkg.title}</h3><p>{connection?.label??"Connection unavailable"}</p></div>
            {packageUrl?<a href={packageUrl} target="_blank" rel="noreferrer">Open external package ↗</a>:null}
          </header>
          <div className={styles.itemList}>
            {packageItems.map(item=>{
              const itemUrl=safeExternalUrl(item.external_url);
              return <div key={item.id} data-state={item.state}>
                <span>{item.state.replaceAll("-"," ")}</span>
                <strong>{item.package_item_key}</strong>
                <small>{item.assignee_label??"Assignee unknown"}{item.due_at?" · due "+new Date(item.due_at).toLocaleString("en-GB"):""}{item.blocker_label?" · blocker: "+item.blocker_label:""}</small>
                {itemUrl?<a href={itemUrl} target="_blank" rel="noreferrer">Open ↗</a>:null}
              </div>;
            })}
          </div>
          {pkg.sync_error?<p className={styles.error}>Sync issue: {pkg.sync_error}</p>:null}
          <small className={styles.lastSync}>{pkg.last_sync_at?"Last sync "+new Date(pkg.last_sync_at).toLocaleString("en-GB"):"Not synced yet"}</small>
        </article>;
      })}
    </div>

    <div className={styles.rule}><strong>External system owns task execution.</strong><p>AVELA uses the synced projection to recalculate feasibility and risk; it does not duplicate comments, attachments or full task history.</p></div>
  </section>;
}
