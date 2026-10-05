"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CampaignDeliveryPlanner.module.css";

type EffortCategory = "creation" | "adaptation" | "automation" | "deployment";
type GeneratableItem = "crm-email" | "vertical-video";
type GeneratedDraft = Record<string, string | string[]>;
type ClubWorkspaceClub = { id: string; name: string; role: string };
type ClubSetupContext = {
  connectedChannels: string[];
  priorityObjectives: string[];
  tone?: string;
  mustAvoid?: string;
  approvalOwner?: string;
  approvalRequired?: boolean;
};
type CampaignActivityEvent = {
  id: string;
  event_type: "review" | "draft-generated" | "reserve" | "release" | "launch-handoff";
  label: string;
  detail?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

type CampaignItem = {
  id: string;
  label: string;
  category: EffortCategory;
  detail: string;
  baseEffort: number;
  recommended: boolean;
  supportsVariants?: boolean;
  channels: string[];
  impact: string;
};

const catalogue: CampaignItem[] = [
  { id: "crm-email", label: "CRM email", category: "creation", detail: "Subject line, body copy, CTA and one approval-ready version.", baseEffort: 5, recommended: true, supportsVariants: true, channels: ["CRM"], impact: "Removes the direct reactivation route to known supporters." },
  { id: "vertical-video", label: "Vertical video", category: "creation", detail: "Concept, script, shot list and short-form edit direction.", baseEffort: 10, recommended: true, supportsVariants: true, channels: ["Instagram", "TikTok"], impact: "Reduces short-form reach and makes the social campaign less distinctive." },
  { id: "social-carousel", label: "Social carousel", category: "creation", detail: "Six-frame carousel with copy and visual direction.", baseEffort: 6, recommended: true, supportsVariants: true, channels: ["Instagram", "Facebook"], impact: "Removes a low-friction explainer format for the campaign proposition." },
  { id: "story-set", label: "Story set", category: "adaptation", detail: "Adapt the core campaign into a three-story sequence.", baseEffort: 4, recommended: false, supportsVariants: true, channels: ["Instagram"], impact: "Reduces repeat social exposure close to matchday." },
  { id: "landing-copy", label: "Landing page copy", category: "creation", detail: "Campaign page structure, copy and conversion CTA.", baseEffort: 7, recommended: false, channels: ["Web"], impact: "Removes a dedicated conversion destination for the campaign." },
  { id: "channel-adaptation", label: "Channel adaptation pack", category: "adaptation", detail: "Resize/rewrite the core idea for one additional social channel.", baseEffort: 3, recommended: true, supportsVariants: true, channels: ["Social"], impact: "Narrows the number of channels carrying the core idea." },
  { id: "crm-flow", label: "CRM follow-up flow", category: "automation", detail: "Initial message, reminder logic, suppression and exclusion rules.", baseEffort: 9, recommended: true, channels: ["CRM"], impact: "Removes automated follow-up and leaves the campaign as a one-shot send." },
  { id: "organic-scheduling", label: "Organic scheduling", category: "deployment", detail: "Prepare and schedule approved organic assets for one channel.", baseEffort: 3, recommended: true, channels: ["Instagram", "Facebook"], impact: "Assets remain prepared but are not scheduled for organic publishing." },
  { id: "paid-social", label: "Paid social launch pack", category: "deployment", detail: "Audience, placements, creative variants and launch configuration.", baseEffort: 8, recommended: true, supportsVariants: true, channels: ["Instagram", "Facebook"], impact: "Removes paid distribution and limits the campaign to owned reach." },
  { id: "sms-push", label: "SMS / push deployment", category: "deployment", detail: "Short-form message, timing and approved send configuration.", baseEffort: 4, recommended: false, channels: ["SMS", "Push"], impact: "Removes the highest-urgency reminder channel close to kickoff." }
];

const categoryLabels: Record<EffortCategory, string> = {
  creation: "Creation",
  adaptation: "Adaptation",
  automation: "Automation",
  deployment: "Deployment"
};

export function CampaignDeliveryPlanner({
  objective,
  audience,
  proposition,
  unresolvedGates,
  fixtureId
}: {
  objective: string;
  audience: string;
  proposition: string;
  unresolvedGates: number;
  fixtureId: string;
}) {
  const [selected, setSelected] = useState(() => new Set(catalogue.filter((item) => item.recommended).map((item) => item.id)));
  const [variants, setVariants] = useState<Record<string, number>>(() => Object.fromEntries(catalogue.map((item) => [item.id, 1])));
  const [drafts, setDrafts] = useState<Partial<Record<GeneratableItem, GeneratedDraft>>>({});
  const [generating, setGenerating] = useState<GeneratableItem | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<"draft" | "review-ready">("draft");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [remoteConfigured, setRemoteConfigured] = useState<boolean | null>(null);
  const [clubs, setClubs] = useState<ClubWorkspaceClub[]>([]);
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [remoteSaving, setRemoteSaving] = useState(false);
  const [remoteSaveError, setRemoteSaveError] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [lockedCampaignEffort, setLockedCampaignEffort] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationBusy, setReservationBusy] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [launchHandoffReady, setLaunchHandoffReady] = useState(false);
  const [activity, setActivity] = useState<CampaignActivityEvent[]>([]);
  const [clubSetup, setClubSetup] = useState<ClubSetupContext | null>(null);

  const storageKey = `avela:campaign-workspace:${fixtureId}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const workspace = JSON.parse(stored) as {
          selected?: string[];
          variants?: Record<string, number>;
          drafts?: Partial<Record<GeneratableItem, GeneratedDraft>>;
          workspaceStatus?: "draft" | "review-ready";
          lockedCampaignEffort?: number;
          reservedCampaignCredits?: number;
          reservationId?: string | null;
          launchHandoffReady?: boolean;
        };

        if (Array.isArray(workspace.selected)) setSelected(new Set(workspace.selected));
        if (workspace.variants) setVariants(workspace.variants);
        if (workspace.drafts) setDrafts(workspace.drafts);
        if (workspace.workspaceStatus === "review-ready") setWorkspaceStatus("review-ready");
        if (typeof workspace.lockedCampaignEffort === "number") setLockedCampaignEffort(workspace.lockedCampaignEffort);
        else if (typeof workspace.reservedCampaignCredits === "number") setLockedCampaignEffort(workspace.reservedCampaignCredits);
        if (typeof workspace.reservationId === "string" && workspace.reservationId) setReservationId(workspace.reservationId);
        if (typeof workspace.launchHandoffReady === "boolean") setLaunchHandoffReady(workspace.launchHandoffReady);
      }
    } catch {
      // A corrupt browser workspace should never block the campaign builder.
    } finally {
      setWorkspaceLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!workspaceLoaded) return;

    window.localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      fixtureId,
      selected: Array.from(selected),
      variants,
      drafts,
      workspaceStatus,
      lockedCampaignEffort,
      reservationId,
      launchHandoffReady,
      savedAt: new Date().toISOString()
    }));
  }, [drafts, fixtureId, launchHandoffReady, reservationId, lockedCampaignEffort, selected, storageKey, variants, workspaceLoaded, workspaceStatus]);

  function applyWorkspaceState(state: Record<string, unknown>, status?: string) {
    const workspace = state as {
      selected?: string[];
      variants?: Record<string, number>;
      drafts?: Partial<Record<GeneratableItem, GeneratedDraft>>;
      workspaceStatus?: "draft" | "review-ready";
      lockedCampaignEffort?: number;
      reservedCampaignCredits?: number;
      reservationId?: string | null;
      launchHandoffReady?: boolean;
    };

    if (Array.isArray(workspace.selected)) setSelected(new Set(workspace.selected));
    if (workspace.variants) setVariants(workspace.variants);
    if (workspace.drafts) setDrafts(workspace.drafts);
    if (typeof workspace.lockedCampaignEffort === "number") setLockedCampaignEffort(workspace.lockedCampaignEffort);
    else if (typeof workspace.reservedCampaignCredits === "number") setLockedCampaignEffort(workspace.reservedCampaignCredits);
    if (typeof workspace.reservationId === "string" && workspace.reservationId) setReservationId(workspace.reservationId);
    else setReservationId(null);
    if (typeof workspace.launchHandoffReady === "boolean") setLaunchHandoffReady(workspace.launchHandoffReady);
    if (status === "review-ready" || workspace.workspaceStatus === "review-ready") {
      setWorkspaceStatus("review-ready");
    } else {
      setWorkspaceStatus("draft");
    }
  }

  async function loadCampaignActivity(clubId: string) {
    const response = await fetch(`/api/campaign-history/${encodeURIComponent(fixtureId)}?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as { events?: CampaignActivityEvent[] };
    setActivity(response.ok && Array.isArray(result.events) ? result.events : []);
  }

  async function recordActivity(
    eventType: CampaignActivityEvent["event_type"],
    eventKey: string,
    label: string,
    detail: string,
    metadata: Record<string, unknown> = {}
  ) {
    if (!activeClubId) return;
    const response = await fetch(`/api/campaign-history/${encodeURIComponent(fixtureId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId: activeClubId, eventType, eventKey, label, detail, metadata })
    });
    if (response.ok) await loadCampaignActivity(activeClubId);
  }

  async function loadClubSetup(clubId: string) {
    const response = await fetch(`/api/club-setup?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as {
      setup?: {
        connected_channels?: string[];
        priority_objectives?: string[];
        brand_rules?: { tone?: string; mustAvoid?: string };
        approval_rules?: { owner?: string; required?: boolean };
      } | null;
    };

    if (response.ok && result.setup) {
      setClubSetup({
        connectedChannels: result.setup.connected_channels ?? [],
        priorityObjectives: result.setup.priority_objectives ?? [],
        tone: result.setup.brand_rules?.tone,
        mustAvoid: result.setup.brand_rules?.mustAvoid,
        approvalOwner: result.setup.approval_rules?.owner,
        approvalRequired: result.setup.approval_rules?.required
      });
    } else {
      setClubSetup(null);
    }
  }

  async function loadClubWorkspace(clubId: string) {
    setRemoteReady(false);
    const response = await fetch(`/api/campaign-workspace/${encodeURIComponent(fixtureId)}?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const result = await response.json() as {
      workspace?: { state?: Record<string, unknown>; status?: string } | null;
      error?: string;
    };

    if (response.ok && result.workspace?.state) {
      applyWorkspaceState(result.workspace.state, result.workspace.status);
    }

    if (response.ok) {
      await Promise.all([loadCampaignActivity(clubId), loadClubSetup(clubId)]);
    }
    setRemoteReady(response.ok);
  }

  async function loadAccountSession() {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as {
        authenticated?: boolean;
        configured?: boolean;
        clubs?: ClubWorkspaceClub[];
      };

      setRemoteConfigured(Boolean(result.configured));
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);

      if (result.authenticated && nextClubs.length) {
        const preferred = nextClubs.some((club) => club.id === activeClubId) ? activeClubId : nextClubs[0].id;
        setActiveClubId(preferred);
        if (preferred) await loadClubWorkspace(preferred);
      } else {
        setActiveClubId(null);
        setRemoteReady(false);
      }
    } catch {
      setRemoteConfigured(false);
      setActiveClubId(null);
      setRemoteReady(false);
    }
  }

  useEffect(() => {
    void loadAccountSession();
  }, [fixtureId]); // eslint-disable-line react-hooks/exhaustive-deps -- re-check account when the active fixture changes

  useEffect(() => {
    if (!workspaceLoaded || !remoteReady || !activeClubId) return;

    const timer = window.setTimeout(async () => {
      setRemoteSaving(true);
      setRemoteSaveError(null);
      try {
        const response = await fetch(`/api/campaign-workspace/${encodeURIComponent(fixtureId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId: activeClubId,
            status: workspaceStatus,
            state: {
              version: 1,
              fixtureId,
              selected: Array.from(selected),
              variants,
              drafts,
              workspaceStatus,
              lockedCampaignEffort,
              reservationId,
              launchHandoffReady
            }
          })
        });
        if (!response.ok) setRemoteSaveError("Club sync failed. Changes remain saved on this device.");
      } catch {
        setRemoteSaveError("Club sync unavailable. Changes remain saved on this device.");
      } finally {
        setRemoteSaving(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [activeClubId, drafts, fixtureId, launchHandoffReady, remoteReady, reservationId, lockedCampaignEffort, selected, variants, workspaceLoaded, workspaceStatus]);

  async function signInToClubWorkspace() {
    setAccountError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: accountEmail, password: accountPassword })
    });
    const result = await response.json() as { error?: string };

    if (!response.ok) {
      setAccountError(result.error || "Sign-in failed.");
      return;
    }

    setAccountPassword("");
    await loadAccountSession();
  }

  async function signOutOfClubWorkspace() {
    await fetch("/api/auth/logout", { method: "POST" });
    setClubs([]);
    setActiveClubId(null);
    setRemoteReady(false);
    setClubSetup(null);
    setAccountError(null);
  }

  async function switchClub(clubId: string) {
    setActiveClubId(clubId);
    await loadClubWorkspace(clubId);
  }

  function channelIsConnected(channel: string) {
    const connected = clubSetup?.connectedChannels ?? [];
    if (!connected.length) return true;
    if (connected.includes(channel)) return true;
    if (channel === "CRM" && connected.includes("Email")) return true;
    if (channel === "Social" && connected.some((item) => ["Instagram", "Facebook", "TikTok"].includes(item))) return true;
    return false;
  }

  function itemUsesConnectedStack(item: CampaignItem) {
    return item.channels.some(channelIsConnected);
  }

  const pricedItems = useMemo(
    () => catalogue.filter((item) => selected.has(item.id)).map((item) => {
      const count = item.supportsVariants ? Math.max(1, Math.min(4, variants[item.id] ?? 1)) : 1;
      const variantEffort = item.supportsVariants ? Math.max(0, count - 1) * Math.ceil(item.baseEffort * 0.45) : 0;
      return { ...item, count, totalEffort: item.baseEffort + variantEffort };
    }),
    [selected, variants]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<EffortCategory, number> = { creation: 0, adaptation: 0, automation: 0, deployment: 0 };
    pricedItems.forEach((item) => { totals[item.category] += item.totalEffort; });
    return totals;
  }, [pricedItems]);

  const total = pricedItems.reduce((sum, item) => sum + item.totalEffort, 0);
  const selectedCount = pricedItems.length;
  const activeCategories = (["creation", "adaptation", "automation", "deployment"] as EffortCategory[]).filter((category) => categoryTotals[category] > 0);
  const campaignCoverage = Math.round((activeCategories.length / 4) * 100);
  const allRecommended = catalogue.filter((item) => item.recommended);
  const missingRecommended = allRecommended.filter((item) => !selected.has(item.id));
  const activeChannels = Array.from(new Set(pricedItems.flatMap((item) => item.channels)));
  const recommendedChannels = Array.from(new Set(allRecommended.flatMap((item) => item.channels)));
  const channelCoverage = recommendedChannels.length ? Math.round((activeChannels.filter((channel) => recommendedChannels.includes(channel)).length / recommendedChannels.length) * 100) : 0;
  const launchQuality = missingRecommended.length === 0 ? "Full recommended scope" : missingRecommended.length <= 2 ? "Reduced scope" : "Thin campaign";
  const generatedItems = Object.keys(drafts) as GeneratableItem[];
  const generatedEffort = generatedItems.reduce((sum, id) => sum + (catalogue.find((item) => item.id === id)?.baseEffort ?? 0), 0);
  const effortToLock = Math.max(0, total - generatedEffort);
  const hasReservation = Boolean(reservationId);
  const canReserve = unresolvedGates === 0 && workspaceStatus === "review-ready" && !hasReservation;
  const canPrepareLaunch = hasReservation && unresolvedGates === 0;
  const nextMove = launchHandoffReady
    ? "Hand off to the connected or manual execution route."
    : hasReservation
      ? "Prepare the external launch handoff."
      : unresolvedGates > 0
        ? `Resolve ${unresolvedGates} approval gate${unresolvedGates === 1 ? "" : "s"}.`
        : workspaceStatus === "review-ready"
          ? "Lock the reviewed scope for handoff."
          : "Finish the campaign scope and mark it ready for review.";

  const builderStage = launchHandoffReady
    ? 5
    : hasReservation
      ? 4
      : workspaceStatus === "review-ready"
        ? 3
        : selectedCount > 0
          ? 2
          : 1;

  const journeySteps = [
    { id: 1, label: "Opportunity", detail: "Why act now", state: "complete" },
    { id: 2, label: "Recipe", detail: "Channels + assets", state: builderStage > 2 ? "complete" : builderStage === 2 ? "active" : "upcoming" },
    { id: 3, label: "Review", detail: unresolvedGates ? `${unresolvedGates} gate${unresolvedGates === 1 ? "" : "s"} open` : "Human approval", state: builderStage > 3 ? "complete" : builderStage === 3 ? "active" : "upcoming" },
    { id: 4, label: "Lock", detail: hasReservation ? "Scope locked" : "Lock scope", state: builderStage > 4 ? "complete" : builderStage === 4 ? "active" : "upcoming" },
    { id: 5, label: "Handoff", detail: launchHandoffReady ? "Ready" : "No auto-publish", state: builderStage === 5 ? "active" : "upcoming" }
  ] as const;

  function toggle(id: string) {
    if (hasReservation) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeVariants(id: string, value: number) {
    if (hasReservation) return;
    const safe = Math.max(1, Math.min(4, Number.isFinite(value) ? value : 1));
    setVariants((current) => ({ ...current, [id]: safe }));
  }

  async function reserveCampaign() {
    if (!canReserve || reservationBusy) return;
    setReservationBusy(true);
    setReservationError(null);

    try {
      const cycleId = crypto.randomUUID();
      if (activeClubId && effortToLock > 0) {
        const response = await fetch("/api/delivery-effort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId: activeClubId,
            fixtureId,
            itemId: "campaign-reservation",
            eventKey: `${fixtureId}:campaign:reserve:${cycleId}`,
            eventType: "commit",
            units: effortToLock,
            note: "Scope locked after campaign review. Existing generated-draft effort is excluded."
          })
        });
        if (!response.ok) throw new Error("Campaign scope could not be locked.");
      }

      setLockedCampaignEffort(effortToLock);
      setReservationId(cycleId);
      setLaunchHandoffReady(false);
      await recordActivity(
        "reserve",
        `${fixtureId}:campaign:reserve-history:${cycleId}`,
        "Campaign scope locked",
        `${effortToLock} effort units locked after review.`,
        { effortUnits: effortToLock, totalPlanned: total, existingGeneratedEffort: generatedEffort, reservationId: cycleId }
      );
    } catch (error) {
      setReservationError(error instanceof Error ? error.message : "Campaign reservation failed.");
    } finally {
      setReservationBusy(false);
    }
  }

  async function reopenCampaign() {
    if (!hasReservation || !reservationId || reservationBusy) return;
    setReservationBusy(true);
    setReservationError(null);

    try {
      if (activeClubId && lockedCampaignEffort > 0) {
        const response = await fetch("/api/delivery-effort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId: activeClubId,
            fixtureId,
            itemId: "campaign-reservation",
            eventKey: `${fixtureId}:campaign:release:${reservationId}`,
            eventType: "release",
            units: lockedCampaignEffort,
            note: "Campaign reservation released when the club reopened the campaign."
          })
        });
        if (!response.ok) throw new Error("Locked scope could not be reopened.");
      }

      await recordActivity(
        "release",
        `${fixtureId}:campaign:release-history:${reservationId}`,
        "Campaign reopened",
        `${lockedCampaignEffort} locked effort units released and scope reopened for editing.`,
        { effortUnits: lockedCampaignEffort, reservationId }
      );
      setLockedCampaignEffort(0);
      setReservationId(null);
      setWorkspaceStatus("draft");
      setLaunchHandoffReady(false);
    } catch (error) {
      setReservationError(error instanceof Error ? error.message : "Campaign could not be reopened.");
    } finally {
      setReservationBusy(false);
    }
  }

  async function prepareLaunchHandoff() {
    if (!canPrepareLaunch) return;
    setLaunchHandoffReady(true);
    await recordActivity(
      "launch-handoff",
      `${fixtureId}:campaign:launch-handoff`,
      "Launch handoff prepared",
      "Campaign is ready for an external connector or manual execution handoff. No publishing or spend occurred.",
      { channels: activeChannels, plannedEffort: total }
    );
  }

  async function generateDraft(type: GeneratableItem) {
    if (drafts[type] || generating) return;
    setGenerating(type);
    setGenerationError(null);

    try {
      const response = await fetch("/api/campaign-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, objective, audience, proposition, clubId: activeClubId })
      });
      const result = await response.json() as { draft?: GeneratedDraft; error?: string };

      if (!response.ok || !result.draft) {
        throw new Error(result.error || "Draft generation failed.");
      }

      setDrafts((current) => ({ ...current, [type]: result.draft }));
      await recordActivity(
        "draft-generated",
        `${fixtureId}:${type}:draft-generated`,
        `${catalogue.find((item) => item.id === type)?.label ?? type} generated`,
        "Approval-ready content draft generated from the campaign strategy.",
        { itemId: type }
      );

      if (activeClubId) {
        const effortResponse = await fetch("/api/delivery-effort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubId: activeClubId,
            fixtureId,
            itemId: type,
            eventKey: `${fixtureId}:${type}:commit`,
            eventType: "commit",
            units: catalogue.find((item) => item.id === type)?.baseEffort ?? 0,
            note: "Effort recorded when the first approval-ready draft was generated."
          })
        });

        if (!effortResponse.ok) {
          setGenerationError("Draft generated, but the club delivery-effort history could not be updated.");
        }
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Draft generation failed.");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <section className={styles.shell} aria-label="Campaign proposal and delivery planner">
      <div className={styles.head}>
        <div>
          <span>Campaign proposal</span>
          <h2>Turn the match plan into an approval-ready campaign.</h2>
          <p>The engine proposes the campaign recipe first. The club then decides what to produce, adapt and hand off before any external execution occurs.</p>
        </div>
      </div>

      <div className={styles.brief}>
        <article><span>Objective</span><strong>{objective}</strong></article>
        <article><span>Audience</span><strong>{audience}</strong></article>
        <article><span>Proposition</span><strong>{proposition}</strong></article>
      </div>

      <div className={styles.guidedBuilder} aria-label="Campaign build progress">
        <div className={styles.guidedIntro}>
          <span>Campaign path</span>
          <strong>Follow the recommendation. Change only what the club needs to change.</strong>
          <small>The current stage is highlighted; later stages stay visible so the user always knows what comes next.</small>
        </div>
        <div className={styles.guidedSteps}>
          {journeySteps.map((step) => (
            <div
              key={step.id}
              className={[
                styles.guidedStep,
                step.state === "active" ? styles.guidedStepActive : "",
                step.state === "complete" ? styles.guidedStepComplete : ""
              ].join(" ")}
            >
              <span>{step.state === "complete" ? "✓" : String(step.id).padStart(2, "0")}</span>
              <div>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <>

          <div className={styles.campaignCanvas}>
            <div>
              <span>Proposed campaign</span>
              <h3>{objective}</h3>
              <p>{proposition}</p>
            </div>
            <div className={styles.campaignStats}>
              <article><span>Audience</span><strong>{audience}</strong></article>
              <article><span>Selected items</span><strong>{selectedCount}</strong></article>
              <article><span>Workflow coverage</span><strong>{campaignCoverage}%</strong></article>
              <article><span>Delivery effort</span><strong>{total} units</strong></article>
            </div>
            <div className={styles.campaignHealth}>
              <article><span>Channel coverage</span><strong>{channelCoverage}%</strong><small>{activeChannels.length ? activeChannels.join(" · ") : "No channels selected"}</small></article>
              <article><span>Campaign quality</span><strong>{launchQuality}</strong><small>{missingRecommended.length ? missingRecommended.length + " recommended item" + (missingRecommended.length === 1 ? "" : "s") + " removed" : "All recommended items included"}</small></article>
            </div>

            <div className={styles.channelStrip} aria-label="Campaign channels">
              {recommendedChannels.map((channel) => {
                const active = activeChannels.includes(channel);
                return (
                  <span key={channel} className={active ? styles.channelActive : styles.channelInactive}>
                    <b>{active ? "✓" : "–"}</b>{channel}
                  </span>
                );
              })}
            </div>

            <div className={styles.recipeMap} aria-label="Recommended campaign flow">
              <div className={styles.recipeNode}>
                <span>Audience</span>
                <strong>{audience}</strong>
              </div>
              <i aria-hidden="true">→</i>
              <div className={styles.recipeBranches}>
                {activeChannels.slice(0, 4).map((channel) => (
                  <div key={channel}>
                    <span>{channel}</span>
                    <strong>{pricedItems.filter((item) => item.channels.includes(channel) || (channel === "Social" && item.channels.includes("Social"))).length || 1} touchpoint{pricedItems.filter((item) => item.channels.includes(channel)).length === 1 ? "" : "s"}</strong>
                  </div>
                ))}
                {!activeChannels.length ? <div><span>Channels</span><strong>Choose the route</strong></div> : null}
              </div>
              <i aria-hidden="true">→</i>
              <div className={styles.recipeNode}>
                <span>Goal</span>
                <strong>{objective}</strong>
              </div>
            </div>

            <div className={styles.campaignFlow} aria-label="Campaign workflow coverage">
              {(["creation", "adaptation", "automation", "deployment"] as EffortCategory[]).map((category, index) => (
                <div key={category} className={categoryTotals[category] > 0 ? styles.flowActive : styles.flowInactive}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{categoryLabels[category]}</strong>
                  <small>{categoryTotals[category] > 0 ? categoryTotals[category] + " units" : "Not included"}</small>
                </div>
              ))}
            </div>
          </div>

          {activeClubId ? (
            <div className={styles.clubContext}>
              <div>
                <span>Club context applied</span>
                <strong>Built above the club&apos;s existing stack — not instead of it.</strong>
                <p>
                  Campaign recipes use saved channels, objectives, brand rules and approval defaults. Items outside the connected stack stay visible as explicit handoffs rather than pretending the platform can execute them.
                </p>
              </div>
              <div className={styles.clubContextFacts}>
                <span><strong>{clubSetup?.connectedChannels.length ?? 0}</strong> connected channels</span>
                <span><strong>{clubSetup?.priorityObjectives.length ?? 0}</strong> priority objectives</span>
                <span><strong>{clubSetup?.approvalRequired === false ? "Flexible" : "Required"}</strong> approval</span>
              </div>
            </div>
          ) : null}

          <div className={styles.effortExplainer}>
            {(["creation", "adaptation", "automation", "deployment"] as EffortCategory[]).map((category) => (
              <article key={category}>
                <span>{categoryLabels[category]}</span>
                <strong>{categoryTotals[category]} units</strong>
                <small>
                  {category === "creation" ? "Net-new campaign assets."
                    : category === "adaptation" ? "Variants and channel-specific versions."
                      : category === "automation" ? "Rules, flows and sequencing."
                        : "Publishing, scheduling and channel setup."}
                </small>
              </article>
            ))}
          </div>

          <div className={styles.nextMove}>
            <span>Do next</span>
            <strong>{nextMove}</strong>
            <small>AVELA advances one explicit stage at a time. Nothing is published or spent from this workspace.</small>
          </div>

          <div className={styles.calculator}>
            <div className={styles.catalogue}>
              <div className={styles.catalogueHead}>
                <div>
                  <span>Campaign builder</span>
                  <strong>Add, remove or resize the proposed campaign.</strong>
                </div>
                <small>Extra variants cost less than the first asset because they reuse the core campaign concept.</small>
              </div>

              {catalogue.map((item) => {
                const active = selected.has(item.id);
                const count = Math.max(1, variants[item.id] ?? 1);
                const rowTotal = item.baseEffort + (item.supportsVariants ? Math.max(0, count - 1) * Math.ceil(item.baseEffort * 0.45) : 0);
                const connectedStack = itemUsesConnectedStack(item);
                return (
                  <div key={item.id} className={active ? styles.itemActive : styles.item}>
                    <label className={styles.itemToggle}>
                      <input type="checkbox" checked={active} onChange={() => toggle(item.id)} />
                      <div>
                        <div className={styles.itemTitle}>
                          <strong>{item.label}</strong>
                          {item.recommended ? <span>Recommended</span> : null}
                          {activeClubId ? <span className={connectedStack ? styles.stackConnected : styles.stackHandoff}>{connectedStack ? "Connected stack" : "Handoff"}</span> : null}
                        </div>
                        <p>{item.detail}</p>
                        <small>{categoryLabels[item.category]} · {item.channels.join(" · ")} · effort {item.baseEffort} units</small>
                        {activeClubId && !connectedStack ? <p className={styles.stackNote}>Not in the club&apos;s connected channels. This remains a preparation/manual handoff unless a connector is added.</p> : null}
                      {item.recommended && !active ? <p className={styles.impactWarning}>If removed: {item.impact}</p> : null}
                      </div>
                    </label>

                    <div className={styles.itemCost}>
                      {item.supportsVariants && active ? (
                        <label>
                          Variants
                          <select value={count} onChange={(event) => changeVariants(item.id, Number(event.target.value))}>
                            {[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                        </label>
                      ) : null}
                      <b>{active ? rowTotal : 0} units</b>
                      {active && (item.id === "crm-email" || item.id === "vertical-video") ? (
                        <button
                          className={styles.generateButton}
                          type="button"
                          disabled={Boolean(drafts[item.id as GeneratableItem]) || generating !== null}
                          onClick={() => generateDraft(item.id as GeneratableItem)}
                        >
                          {drafts[item.id as GeneratableItem]
                            ? "Draft generated"
                            : generating === item.id
                              ? "Generating…"
                              : `Generate draft`}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className={styles.budget}>
              <span>Delivery effort</span>
              <strong>{total} units</strong>
              <dl>
                <div><dt>Planned work</dt><dd>{total} units</dd></div>
                <div><dt>Already generated</dt><dd>{generatedEffort} units</dd></div>
                <div><dt>Remaining to lock</dt><dd>{effortToLock} units</dd></div>
              </dl>

              <div className={styles.breakdown}>
                {(["creation", "adaptation", "automation", "deployment"] as EffortCategory[]).map((category) => (
                  <div key={category}><span>{categoryLabels[category]}</span><strong>{categoryTotals[category]} units</strong></div>
                ))}
              </div>

              <p>Effort units are an internal planning signal, not a purchasable currency. Commercial pricing stays outside the campaign workflow.</p>

              <div className={styles.launchState}>
                <span>Campaign stage</span>
                <strong>
                  {launchHandoffReady
                    ? "Launch handoff ready"
                    : hasReservation
                      ? "Scope locked"
                      : workspaceStatus === "review-ready"
                        ? "Ready to lock"
                        : "Estimate in progress"}
                </strong>
                <small>
                  {unresolvedGates > 0
                    ? `${unresolvedGates} approval gate${unresolvedGates === 1 ? "" : "s"} still unresolved.`
                    : !hasReservation && workspaceStatus !== "review-ready"
                      ? "Review the final scope before locking it."
                      : hasReservation
                        ? "Scope is locked until the campaign is reopened."
                        : "Scope and approval gates are clear."}
                </small>
              </div>

              <div className={styles.reviewFlow}>
                <div className={workspaceStatus === "draft" ? styles.reviewStepActive : ""}>
                  <span>1</span><strong>Scope</strong><small>{total} units planned</small>
                </div>
                <div className={workspaceStatus === "review-ready" && !hasReservation ? styles.reviewStepActive : ""}>
                  <span>2</span><strong>Review</strong><small>{missingRecommended.length} recommended removed</small>
                </div>
                <div className={hasReservation && !launchHandoffReady ? styles.reviewStepActive : ""}>
                  <span>3</span><strong>Lock</strong><small>{hasReservation ? "Scope locked" : `${effortToLock} units to lock`}</small>
                </div>
                <div className={launchHandoffReady ? styles.reviewStepActive : ""}>
                  <span>4</span><strong>Launch</strong><small>handoff only today</small>
                </div>
              </div>

              {reservationError ? <p className={styles.warning}>{reservationError}</p> : null}

              {!hasReservation ? (
                <button
                  className={styles.launch}
                  type="button"
                  disabled={!canReserve || reservationBusy}
                  onClick={() => void reserveCampaign()}
                >
                  {reservationBusy ? "Locking…" : "Lock reviewed scope"}
                </button>
              ) : launchHandoffReady ? (
                <button className={styles.launch} type="button" disabled>Launch campaign · connector required</button>
              ) : (
                <button className={styles.launch} type="button" disabled={!canPrepareLaunch} onClick={() => void prepareLaunchHandoff()}>
                  Prepare launch handoff
                </button>
              )}

              {hasReservation ? <button className={styles.reopen} type="button" disabled={reservationBusy} onClick={() => void reopenCampaign()}>Reopen campaign scope</button> : null}
              <small className={styles.guardrail}>Launch is not simulated: unsupported channels remain explicit handoffs. No CRM send, social publish or media spend happens from this button today.</small>
            </aside>
          </div>

          <section className={styles.production} aria-label="Generated campaign drafts">
            <div className={styles.productionHead}>
              <div>
                <span>Generative production</span>
                <h3>Approval-ready drafts from the campaign strategy.</h3>
                <p>Generation records the effort already spent on produced drafts. Signed-in club users sync this workspace across devices; otherwise the current device remains the fallback.</p>
              </div>
              <div className={styles.workspaceState}>
                <span>Workspace</span>
                <strong>
                  {activeClubId
                    ? remoteSaving
                      ? "Saving to club…"
                      : remoteSaveError
                        ? "Saved on device · club sync pending"
                        : `Saved to ${clubs.find((club) => club.id === activeClubId)?.name ?? "club"}`
                    : workspaceLoaded
                      ? "Saved on this device"
                      : "Loading workspace…"}
                </strong>
                <small>
                  {remoteSaveError
                    ? remoteSaveError
                    : activeClubId
                      ? `${clubs.find((club) => club.id === activeClubId)?.role ?? "member"} · ${workspaceStatus === "review-ready" ? "ready for review" : "draft in progress"}`
                      : workspaceStatus === "review-ready" ? "Marked ready for review" : "Draft in progress"}
                </small>
              </div>
            </div>

            <div className={styles.accountPanel}>
              {activeClubId ? (
                <>
                  <div>
                    <span>Club workspace</span>
                    <strong>{clubs.find((club) => club.id === activeClubId)?.name ?? "Connected club"}</strong>
                    <small>Remote persistence is protected by club membership and row-level security.</small>
                  </div>
                  <div className={styles.accountControls}>
                    {clubs.length > 1 ? (
                      <select value={activeClubId} onChange={(event) => void switchClub(event.target.value)}>
                        {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
                      </select>
                    ) : null}
                    <button type="button" onClick={() => void signOutOfClubWorkspace()}>Sign out</button>
                  </div>
                </>
              ) : remoteConfigured ? (
                <>
                  <div>
                    <span>Connect club workspace</span>
                    <strong>Pilot account sign-in</strong>
                    <small>Invited club users can restore campaigns, drafts and activity history on any device.</small>
                  </div>
                  <div className={styles.signInForm}>
                    <input type="email" autoComplete="email" placeholder="Work email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} />
                    <input type="password" autoComplete="current-password" placeholder="Password" value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} />
                    <button type="button" onClick={() => void signInToClubWorkspace()}>Sign in</button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span>Device workspace</span>
                    <strong>Club sync not configured</strong>
                    <small>Campaign state stays on this device until Supabase credentials and the club schema are enabled.</small>
                  </div>
                </>
              )}
            </div>

            {accountError ? <p className={styles.generationError}>{accountError}</p> : null}

            <div className={styles.productionActions}>
              <span><strong>{generatedEffort}</strong> effort units already generated</span>
              <button type="button" disabled={hasReservation} onClick={() => {
                setWorkspaceStatus((current) => {
                  const next = current === "draft" ? "review-ready" : "draft";
                  if (next === "review-ready") {
                    void recordActivity(
                      "review",
                      `${fixtureId}:campaign:review:${total}:${selectedCount}`,
                      "Campaign moved to review",
                      `${selectedCount} items · ${total} planned effort units · ${missingRecommended.length} recommended items removed.`,
                      { selectedCount, total, missingRecommended: missingRecommended.length, channels: activeChannels }
                    );
                  }
                  return next;
                });
              }}>
                {hasReservation ? "Scope locked by reservation" : workspaceStatus === "review-ready" ? "Return to draft" : "Review campaign"}
              </button>
            </div>

            {generationError ? <p className={styles.generationError}>{generationError}</p> : null}

            {generatedItems.length ? (
              <div className={styles.draftGrid}>
                {generatedItems.map((id) => {
                  const item = catalogue.find((entry) => entry.id === id);
                  const draft = drafts[id];
                  return (
                    <article key={id} className={styles.draftCard}>
                      <div className={styles.draftTop}>
                        <span>{item?.label}</span>
                        <strong>{item?.baseEffort} effort units</strong>
                      </div>
                      {draft ? Object.entries(draft).map(([key, value]) => (
                        <div className={styles.draftField} key={key}>
                          <span>{key.replaceAll("-", " ")}</span>
                          {Array.isArray(value) ? (
                            <ul>{value.map((line) => <li key={line}>{line}</li>)}</ul>
                          ) : (
                            <p>{value}</p>
                          )}
                        </div>
                      )) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.productionEmpty}>
                <strong>No generated drafts yet.</strong>
                <p>Generate the CRM email or vertical video draft from the campaign builder above.</p>
              </div>
            )}
          </section>

          <section className={styles.history} aria-label="Campaign activity history">
            <div className={styles.historyHead}>
              <div>
                <span>Campaign history</span>
                <h3>One timeline from review to launch handoff.</h3>
                <p>Signed-in club activity is written to the shared fixture workspace so teams can see what changed and when.</p>
              </div>
              <strong>{activeClubId ? `${activity.length} recorded event${activity.length === 1 ? "" : "s"}` : "Sign in to record shared history"}</strong>
            </div>

            {activity.length ? (
              <div className={styles.timeline}>
                {activity.map((event) => (
                  <article key={event.id}>
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div>
                      <span>{event.event_type.replaceAll("-", " ")}</span>
                      <strong>{event.label}</strong>
                      {event.detail ? <p>{event.detail}</p> : null}
                      <small>{new Date(event.created_at).toLocaleString("en-GB")}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.historyEmpty}>
                <strong>No shared campaign history yet.</strong>
                <p>Reviewing scope, generating drafts, locking scope and preparing launch handoff will create the timeline for authenticated club users.</p>
              </div>
            )}
          </section>
      </>
    </section>
  );
}
