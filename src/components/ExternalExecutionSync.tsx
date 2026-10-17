"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./ExternalExecutionSync.module.css";

type Club={id:string;name:string;role:string};
type PackageRow={
  id:string;
  connection_id:string;
  package_key:string;
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

type WorkItem={key:string;title:string;category:"approval"|"activation"|"schedule"};

const AT_RISK_MS=48*3_600_000;

function safeExternalUrl(value?:string|null){
  return value && /^https:\/\//i.test(value) ? value : null;
}

/** Not done and due within 48 hours, or already past its due date. */
function atRisk(item:ItemRow,now:number){
  return item.state!=="done"&&Boolean(item.due_at)&&new Date(item.due_at as string).getTime()-now<AT_RISK_MS;
}

export function ExternalExecutionSync({decisionId,workItems=[]}:{decisionId:string;workItems?:WorkItem[]}){
  const [clubs,setClubs]=useState<Club[]>([]);
  const [clubId,setClubId]=useState("");
  const [packages,setPackages]=useState<PackageRow[]>([]);
  const [items,setItems]=useState<ItemRow[]>([]);
  const [connections,setConnections]=useState<ConnectionRow[]>([]);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const [message,setMessage]=useState("");
  const [confirming,setConfirming]=useState<string|null>(null);
  const [sending,setSending]=useState(false);
  const [sendMessage,setSendMessage]=useState("");

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
      const response=await fetchClubSession();
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

  const sent=useMemo(()=>packages.filter(pkg=>pkg.sync_state!=="proposed"&&pkg.sync_state!=="error"),[packages]);
  const total=useMemo(()=>sent.reduce((sum,item)=>sum+item.item_count,0),[sent]);
  const done=useMemo(()=>sent.reduce((sum,item)=>sum+item.completed_count,0),[sent]);
  const blocked=useMemo(()=>sent.reduce((sum,item)=>sum+item.blocked_count,0),[sent]);
  const inProgress=items.filter(item=>item.state==="in-progress").length;
  const now=Date.now();
  const risky=items.filter(item=>atRisk(item,now)).length;
  const nextDue=items.filter(item=>item.state!=="done"&&item.due_at).sort((a,b)=>(a.due_at as string).localeCompare(b.due_at as string))[0]??null;
  const titleFor=(key:string)=>workItems.find(item=>item.key===key)?.title??key;
  const fixtureId=decisionId.startsWith("fixture:")?decisionId.slice(8):null;

  async function send(pkg:PackageRow){
    setSending(true);
    setSendMessage("Sending to the work tool…");
    try{
      const response=await fetch("/api/work-system/dispatch",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({clubId,decisionId,packageKey:pkg.package_key,confirm:true,items:workItems.map(({key,category,title})=>({key,category,title}))})
      });
      const result=await response.json().catch(()=>null) as {message?:string;error?:string}|null;
      setSendMessage(response.ok?(result?.message??"Sent."):(result?.error??"The package was not sent."));
      await load(clubId);
    }catch{
      setSendMessage("The work tool could not be reached. Nothing was sent.");
    }finally{
      setSending(false);
      setConfirming(null);
    }
  }

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

    <div className={styles.summary} aria-label="Execution monitor">
      <article><span>Delivered</span><strong>{total?done+" of "+total:"—"}</strong><small>{total?"tasks done, as the tool reports":"nothing sent yet"}</small></article>
      <article><span>In progress</span><strong>{inProgress}</strong><small>reported by the tool</small></article>
      <article><span>Blocked</span><strong>{blocked}</strong><small>{blocked?"needs someone to unblock":"no blocker reported"}</small></article>
      <article><span>At risk</span><strong>{risky}</strong><small>{nextDue?"next due "+new Date(nextDue.due_at as string).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"no due date reported"}</small></article>
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
          {pkg.sync_state==="proposed"||pkg.sync_state==="error"?(
            <div className={styles.send}>
              {confirming===pkg.id?(
                <>
                  <p>Send {pkg.item_count} task{pkg.item_count===1?"":"s"} to {connection?.label??"the club's work tool"}? The tool creates and runs them; AVELA only reads their status back.</p>
                  <button type="button" onClick={()=>void send(pkg)} disabled={sending}>{sending?"Sending…":"Confirm and send"}</button>
                  <button type="button" className={styles.secondary} onClick={()=>setConfirming(null)} disabled={sending}>Cancel</button>
                </>
              ):(
                <button type="button" onClick={()=>{setConfirming(pkg.id);setSendMessage("");}}>{pkg.sync_state==="error"?"Send again →":"Send to "+(connection?.label??"work tool")+" →"}</button>
              )}
            </div>
          ):null}
          <div className={styles.itemList}>
            {packageItems.map(item=>{
              const itemUrl=safeExternalUrl(item.external_url);
              return <div key={item.id} data-state={item.state} data-risk={atRisk(item,now)?"true":undefined}>
                <span>{item.state.replaceAll("-"," ")}</span>
                <strong>{titleFor(item.package_item_key)}</strong>
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

    {sendMessage?<p className={styles.sendMessage} role="status">{sendMessage}</p>:null}

    <div className={styles.rule}><strong>Delivered is not Worked.</strong><p>The external system owns task execution and reports whether the work was delivered; AVELA does not duplicate comments, attachments or full task history. Whether it worked (tickets, attendance, reach) is measured separately, against an agreed baseline.{fixtureId?<> <Link href={"/app/learning?fixture="+encodeURIComponent(fixtureId)}>See what happened →</Link></>:null}</p></div>
  </section>;
}
