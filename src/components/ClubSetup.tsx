"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ClubSetup.module.css";

type Club = { id: string; name: string; role: string };
type FixtureSource = "manual" | "calendar-feed" | "ticketing";

const channelOptions = ["CRM", "Email", "Instagram", "Facebook", "TikTok", "Push", "SMS", "Web"];
const objectiveOptions = ["Repeat attendance", "Ticket conversion", "Family acquisition", "Local growth", "Revenue per fan", "Retention"];

export function ClubSetup() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [fixtureSource, setFixtureSource] = useState<FixtureSource>("manual");
  const [channels, setChannels] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [tone, setTone] = useState("Credible, energetic and supporter-first.");
  const [mustAvoid, setMustAvoid] = useState("Unverified urgency, invented scarcity, unsupported ticket claims.");
  const [approvalOwner, setApprovalOwner] = useState("Marketing");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [status, setStatus] = useState("Loading setup…");
  const [saving, setSaving] = useState(false);

  async function loadSetup(clubId: string) {
    setStatus("Loading club setup…");
    try {
    const response = await fetch(`/api/club-setup?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as {
      setup?: {
        fixture_source?: FixtureSource;
        connected_channels?: string[];
        priority_objectives?: string[];
        brand_rules?: { tone?: string; mustAvoid?: string };
        approval_rules?: { owner?: string; required?: boolean };
      } | null;
    };

    if (response.ok && result.setup) {
      setFixtureSource(result.setup.fixture_source ?? "manual");
      setChannels(result.setup.connected_channels ?? []);
      setObjectives(result.setup.priority_objectives ?? []);
      setTone(result.setup.brand_rules?.tone ?? tone);
      setMustAvoid(result.setup.brand_rules?.mustAvoid ?? mustAvoid);
      setApprovalOwner(result.setup.approval_rules?.owner ?? "Marketing");
      setRequiresApproval(result.setup.approval_rules?.required ?? true);
      setStatus("Club setup loaded from the club workspace.");
    } else {
      setStatus("No saved setup yet. Configure the club once below.");
    }
    } catch {
      setStatus("Club setup service is unreachable. Existing club defaults were not changed.");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { configured?: boolean; authenticated?: boolean; clubs?: Club[] };
      setConfigured(Boolean(result.configured));
      const next = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(next);
      if (result.authenticated && next.length) {
        setActiveClubId(next[0].id);
        await loadSetup(next[0].id);
      } else {
        setStatus("Sign in from a campaign workspace to configure a club.");
      }
      } catch {
        setConfigured(true);
        setClubs([]);
        setStatus("Account state could not be loaded. Club setup remains unchanged.");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial account bootstrap only

  const role = clubs.find((club) => club.id === activeClubId)?.role ?? "";
  const canEdit = role === "admin";
  const completeness = useMemo(() => {
    const checks = [fixtureSource !== "manual", channels.length > 0, objectives.length > 0, tone.trim().length > 0, approvalOwner.trim().length > 0];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [approvalOwner, channels.length, fixtureSource, objectives.length, tone]);

  function toggle(value: string, current: string[], setter: (next: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function saveSetup() {
    if (!activeClubId || !canEdit || saving) return;
    setSaving(true);
    setStatus("Saving…");
    try {
      const response = await fetch("/api/club-setup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          fixtureSource,
          connectedChannels: channels,
          priorityObjectives: objectives,
          brandRules: { tone, mustAvoid },
          approvalRules: { owner: approvalOwner, required: requiresApproval }
        })
      });
      setStatus(response.ok ? "Club setup saved to the club workspace." : "Club setup could not be saved. Existing club defaults were not changed.");
    } catch {
      setStatus("The club workspace is unreachable. Existing club defaults were not changed.");
    } finally {
      setSaving(false);
    }
  }

  if (configured === null) {
    return (
      <section className={styles.loadingState} aria-live="polite">
        <span>Club setup</span>
        <strong>Loading club context…</strong>
        <p>Checking account access and saved operating defaults.</p>
      </section>
    );
  }

  if (configured === false) {
    return <section className={styles.empty}><span>Club setup</span><h1>Club onboarding is ready for Supabase configuration.</h1></section>;
  }

  if (!clubs.length) {
    return <section className={styles.empty}><span>Club setup</span><h1>Sign in to configure the club once.</h1><p>Fixtures, channels, objectives and approval rules are shared club context.</p></section>;
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Club setup</span>
          <h1>Configure once. Let every fixture start with context.</h1>
          <p>This is operating context for the engine, not a campaign brief. It should reduce repeated setup work across the season.</p>
        </div>
        <div className={styles.score}><span>Setup completeness</span><strong>{completeness}%</strong><small role="status" aria-live="polite">{status}</small></div>
      </header>

      <div className={styles.setupJourney} aria-label="Club setup progress">
        <div className={fixtureSource !== "manual" ? styles.journeyDone : ""}><span>01</span><strong>Fixtures</strong><small>{fixtureSource !== "manual" ? "Connected" : "Needs source"}</small></div>
        <div className={channels.length ? styles.journeyDone : ""}><span>02</span><strong>Channels</strong><small>{channels.length ? `${channels.length} active` : "Choose routes"}</small></div>
        <div className={objectives.length ? styles.journeyDone : ""}><span>03</span><strong>Objectives</strong><small>{objectives.length ? `${objectives.length} priorities` : "Choose goals"}</small></div>
        <div className={tone.trim() ? styles.journeyDone : ""}><span>04</span><strong>Brand</strong><small>{tone.trim() ? "Guardrails set" : "Needs rules"}</small></div>
        <div className={approvalOwner.trim() ? styles.journeyDone : ""}><span>05</span><strong>Approval</strong><small>{approvalOwner.trim() ? approvalOwner : "Needs owner"}</small></div>
      </div>

      <div className={styles.clubBar}>
        <label>Club<select value={activeClubId} onChange={(event) => { setActiveClubId(event.target.value); void loadSetup(event.target.value); }}>{clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label>
        <div><span>Role</span><strong>{role}</strong><small>{canEdit ? "Can edit setup" : "Read-only setup access"}</small></div>
      </div>

      <div className={styles.grid}>
        <article>
          <span>01 · Fixtures</span>
          <h2>How does the engine know what is next?</h2>
          <label>Fixture source<select disabled={!canEdit} value={fixtureSource} onChange={(event) => setFixtureSource(event.target.value as FixtureSource)}><option value="manual">Manual / demo</option><option value="calendar-feed">Calendar feed</option><option value="ticketing">Ticketing / fixture system</option></select></label>
          <p>Goal: fixture date and kickoff should start monitoring automatically.</p>
        </article>

        <article>
          <span>02 · Channels</span>
          <h2>Where can the club actually activate?</h2>
          <div className={styles.chips}>{channelOptions.map((channel) => <button disabled={!canEdit} className={channels.includes(channel) ? styles.selected : ""} key={channel} type="button" onClick={() => toggle(channel, channels, setChannels)}>{channel}</button>)}</div>
          <p>Selected channels constrain campaign recipes; unsupported channels remain handoffs.</p>
        </article>

        <article>
          <span>03 · Objectives</span>
          <h2>What should the engine optimise for first?</h2>
          <div className={styles.chips}>{objectiveOptions.map((objective) => <button disabled={!canEdit} className={objectives.includes(objective) ? styles.selected : ""} key={objective} type="button" onClick={() => toggle(objective, objectives, setObjectives)}>{objective}</button>)}</div>
          <p>Objectives guide prioritisation; they do not override evidence or approval gates.</p>
        </article>

        <article>
          <span>04 · Brand rules</span>
          <h2>What should generated content sound like?</h2>
          <label>Tone<textarea disabled={!canEdit} value={tone} onChange={(event) => setTone(event.target.value)} /></label>
          <label>Must avoid<textarea disabled={!canEdit} value={mustAvoid} onChange={(event) => setMustAvoid(event.target.value)} /></label>
        </article>

        <article>
          <span>05 · Approval</span>
          <h2>Who needs to approve before campaign scope is locked?</h2>
          <label>Default owner<input disabled={!canEdit} value={approvalOwner} onChange={(event) => setApprovalOwner(event.target.value)} /></label>
          <label className={styles.check}><input disabled={!canEdit} type="checkbox" checked={requiresApproval} onChange={(event) => setRequiresApproval(event.target.checked)} /> Require campaign approval before scope lock</label>
          <p>Existing campaign permissions and RLS still control who can view, edit and approve.</p>
        </article>

        <article className={styles.ready}>
          <span>Engine readiness</span>
          <h2>{completeness >= 80 ? "Ready to reduce manual setup." : "More context needed."}</h2>
          <p>The next home fixture can use these settings as club defaults. Fixture-specific signals and evidence still determine the actual recommendation.</p>
          <div className={styles.readyAction}>
            <span>{completeness >= 80 ? "Next fixture can use this context." : "Complete the missing context above."}</span>
            <button type="button" disabled={!canEdit || saving} onClick={() => void saveSetup()}>{!canEdit ? "Admin role required" : saving ? "Saving…" : "Save and use for next fixture"}</button>
          </div>
        </article>
      </div>
    </section>
  );
}
