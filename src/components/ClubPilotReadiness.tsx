"use client";

import { useEffect, useMemo, useState } from "react";
import sourceHealth from "../../data/live/source-health.json";
import styles from "./ClubPilotReadiness.module.css";

type Club = { id: string; name: string; role: string; permissions?: string[] };
type Setup = {
  fixture_source?: "manual" | "calendar-feed" | "ticketing";
  connected_channels?: string[];
  priority_objectives?: string[];
  approval_rules?: { owner?: string; required?: boolean };
  brand_rules?: { tone?: string; mustAvoid?: string };
};

type CheckState = "ready" | "limited" | "blocked";

export function ClubPilotReadiness() {
  const [club, setClub] = useState<Club | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [campaignPersistence, setCampaignPersistence] = useState<"ready" | "unavailable" | "checking">("checking");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated?: boolean; clubs?: Club[] };
        const firstClub = session.clubs?.[0] ?? null;
        setClub(firstClub);
        if (!session.authenticated || !firstClub) {
          setMessage("Sign in with an active club membership to assess pilot readiness.");
          setCampaignPersistence("unavailable");
          return;
        }

        const [setupResponse, campaignResponse] = await Promise.all([
          fetch(`/api/club-setup?clubId=${encodeURIComponent(firstClub.id)}`, { cache: "no-store" }),
          fetch(`/api/campaign-record?clubId=${encodeURIComponent(firstClub.id)}`, { cache: "no-store" })
        ]);
        const setupResult = await setupResponse.json() as { setup?: Setup | null };
        setSetup(setupResponse.ok ? setupResult.setup ?? null : null);
        setCampaignPersistence(campaignResponse.ok ? "ready" : "unavailable");
        if (!setupResponse.ok || !campaignResponse.ok) {
          setMessage("Some shared pilot prerequisites could not be verified.");
        }
      } catch {
        setClub(null);
        setSetup(null);
        setCampaignPersistence("unavailable");
        setMessage("Pilot readiness could not be verified. No club configuration was changed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const measurementSource = sourceHealth.sources.find((source) => source.id === "crm-ticketing") ?? null;
  const blinkfireSource = sourceHealth.sources.find((source) => source.id === "blinkfire") ?? null;

  const checks = useMemo(() => {
    const rows: Array<{ id: string; label: string; state: CheckState; detail: string }> = [];
    rows.push({
      id: "membership",
      label: "Identity & club membership",
      state: club ? "ready" : "blocked",
      detail: club ? `${club.name} · ${club.role}` : "An authenticated club membership is required."
    });

    const hasSetup = Boolean(setup);
    rows.push({
      id: "setup",
      label: "Shared club setup",
      state: hasSetup ? "ready" : "blocked",
      detail: hasSetup ? "Club defaults are stored in the shared workspace." : "Save fixtures, channels, objectives and approval defaults."
    });

    const fixtureSource = setup?.fixture_source ?? "manual";
    rows.push({
      id: "fixtures",
      label: "Fixture source",
      state: !hasSetup ? "blocked" : fixtureSource === "manual" ? "limited" : "ready",
      detail: !hasSetup ? "Club setup is missing." : fixtureSource === "manual" ? "Manual fixtures can run a pilot, but monitoring will not start automatically." : `Connected via ${fixtureSource}.`
    });

    const channels = setup?.connected_channels ?? [];
    rows.push({
      id: "channels",
      label: "Execution channels",
      state: channels.length ? "ready" : "blocked",
      detail: channels.length ? `${channels.length} channel${channels.length === 1 ? "" : "s"} declared: ${channels.join(" · ")}` : "Declare at least one route the club can actually activate."
    });

    const owner = setup?.approval_rules?.owner?.trim() ?? "";
    rows.push({
      id: "approval",
      label: "Human approval owner",
      state: owner ? "ready" : "blocked",
      detail: owner ? `Default owner · ${owner}` : "Name the default human approval owner."
    });

    rows.push({
      id: "campaigns",
      label: "Shared campaign persistence",
      state: campaignPersistence === "ready" ? "ready" : campaignPersistence === "checking" ? "limited" : "blocked",
      detail: campaignPersistence === "ready" ? "Fixture and commercial campaigns can share one club record." : campaignPersistence === "checking" ? "Checking shared campaign records…" : "Shared campaign records are unavailable."
    });

    const measurementReady = measurementSource?.state === "operational";
    rows.push({
      id: "measurement",
      label: "Outcome measurement",
      state: measurementReady ? "ready" : "limited",
      detail: measurementReady
        ? "CRM/ticketing outcome evidence is operational."
        : "Decision cycles can start, but attendance/conversion learning remains limited until authorised CRM/ticketing data is connected."
    });

    rows.push({
      id: "blinkfire",
      label: "Media & sponsorship measurement",
      state: blinkfireSource?.state === "operational" ? "ready" : "limited",
      detail: blinkfireSource?.state === "operational"
        ? "Private media/sponsorship measurement is connected."
        : "Optional for launch. Public Blinkfire evidence remains context-only until the club authorises private access."
    });
    return rows;
  }, [blinkfireSource?.state, campaignPersistence, club, measurementSource?.state, setup]);

  const planningChecks = checks.filter((item) => ["membership","setup","fixtures","channels","approval","campaigns"].includes(item.id));
  const planningBlocked = planningChecks.some((item) => item.state === "blocked");
  const planningLimited = planningChecks.some((item) => item.state === "limited");
  const measurementReady = checks.find((item) => item.id === "measurement")?.state === "ready";

  return (
    <section className={styles.wrap} aria-label="Club pilot readiness">
      <div className={styles.head}>
        <div>
          <span>Pilot readiness</span>
          <h2>Can this club run a real AVELA decision cycle?</h2>
          <p>Planning readiness and outcome measurement are assessed separately. Missing measurement never becomes fake evidence.</p>
        </div>
        <div className={styles.summary} data-state={planningBlocked ? "blocked" : planningLimited ? "limited" : "ready"}>
          <span>Planning</span>
          <strong>{loading ? "Checking…" : planningBlocked ? "Not ready" : planningLimited ? "Ready with limits" : "Ready"}</strong>
          <small>{measurementReady ? "Outcome measurement ready" : planningBlocked ? "Resolve the blocked setup checks below" : "Planning can proceed; outcome measurement is still limited"}</small>
        </div>
      </div>

      <div className={styles.grid}>
        {checks.map((check) => (
          <article key={check.id} data-state={check.state}>
            <span>{check.state}</span>
            <strong>{check.label}</strong>
            <p>{check.detail}</p>
          </article>
        ))}
      </div>

      <div className={styles.rule}>
        <strong>Go rule</strong>
        <p>
          AVELA can start a planning pilot when identity, shared setup, executable channels, approval ownership and campaign persistence are available.
          Outcome claims remain restricted until the required measurement source is operational.
        </p>
      </div>

      {message ? <p className={styles.message} role="status" aria-live="polite">{message} {planningBlocked ? "Resolve the blocked prerequisites before treating the club as pilot-ready." : "You can continue planning with the limits shown above."}</p> : null}
    </section>
  );
}
