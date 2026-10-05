"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  demoAppearances,
  demoCommercialCampaigns,
  demoInternationalDuty,
  demoPlayerMomentum,
  demoPlayers,
  demoPosts,
  evaluatePlayerPack,
  internationalAvailabilityAlerts,
  playerCapacity,
  playerMomentumScore,
  recommendPlayerPacks,
  type ActivationRequest,
  type SportingAvailability
} from "@/lib/clubStrategy";
import styles from "./PlayerAssetPlanner.module.css";

type Club = { id: string; name: string; role: string; permissions?: string[] };
type SharedPackSelection = {
  campaign_id: string;
  status: "selected" | "approved" | "committed";
  selected_player_ids: string[];
  player_count: number;
  snapshot?: {
    activationDate?: string;
    channel?: string;
    territory?: string;
    campaignName?: string;
  };
};

const sportingLabel: Record<SportingAvailability, string> = {
  available: "Sporting available",
  injured: "Injured · club-marked",
  rehab: "Rehab · club-marked",
  "sporting-unavailable": "Sporting unavailable"
};

const fixtureBrief = {
  id: "fixture-everton",
  name: "Everton matchday campaign",
  type: "fixture" as const,
  start: "2026-10-03",
  end: "2026-10-18",
  activationDate: "2026-10-18",
  objective: "Convert the current Everton opportunity into a reviewable matchday activation.",
  category: "retail",
  channel: "club-social",
  territory: "UK",
  owner: "marketing",
  budget: 1600,
  playerNeed: 3
};

export function PlayerAssetPlanner({ initialCampaignId }: { initialCampaignId?: string }) {
  const campaignOptions = [fixtureBrief, ...demoCommercialCampaigns];
  const resolvedInitialCampaignId = campaignOptions.some((item) => item.id === initialCampaignId)
    ? initialCampaignId!
    : campaignOptions[0]?.id ?? fixtureBrief.id;
  const [campaignId, setCampaignId] = useState(resolvedInitialCampaignId);
  const selectedCampaign = campaignOptions.find((item) => item.id === campaignId) ?? fixtureBrief;
  const [countOverride, setCountOverride] = useState<number | null>(null);
  const count = countOverride ?? selectedCampaign.playerNeed;
  const [sporting, setSporting] = useState<Record<string, SportingAvailability>>(
    Object.fromEntries(demoPlayers.map((player) => [player.id, player.sportingAvailability ?? "available"]))
  );
  const [commercialOverride, setCommercialOverride] = useState<Record<string, boolean>>(
    Object.fromEntries(demoPlayers.map((player) => [player.id, Boolean(player.commercialAvailabilityOverride)]))
  );
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);
  const [manualContext, setManualContext] = useState("");
  const [selectionSource, setSelectionSource] = useState<"recommended" | "local" | "shared">("recommended");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [remoteStatus, setRemoteStatus] = useState("");
  const [remoteBusy, setRemoteBusy] = useState(false);
  const [sharedStatus, setSharedStatus] = useState<"selected" | "approved" | "committed" | null>(null);
  const [sharedSelections, setSharedSelections] = useState<SharedPackSelection[]>([]);
  const selectionStorageKey = `avela:player-pack:${campaignId}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(selectionStorageKey);
      if (!stored) {
        setManualSelectedIds([]);
        setManualContext("");
        setSelectionSource("recommended");
        return;
      }
      const parsed = JSON.parse(stored) as { ids?: string[]; count?: number };
      if (Array.isArray(parsed.ids) && parsed.ids.every((id) => demoPlayers.some((player) => player.id === id))) {
        setManualSelectedIds(parsed.ids);
        setManualContext("stored");
        setSelectionSource("local");
        if (typeof parsed.count === "number") setCountOverride(parsed.count);
      }
    } catch {
      setManualSelectedIds([]);
      setManualContext("");
      setSelectionSource("recommended");
    }
  }, [selectionStorageKey]);

  async function loadSharedSelection(clubId: string, targetCampaignId = campaignId) {
    setRemoteStatus("Loading shared selection…");
    try {
      const response = await fetch(`/api/player-pack-selection/${encodeURIComponent(targetCampaignId)}?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
      const result = await response.json() as {
        selection?: { selected_player_ids?: string[]; player_count?: number; status?: string } | null;
        error?: string;
      };
      if (!response.ok) {
        setRemoteStatus(result.error || "Shared selection could not be loaded.");
        return;
      }
      const ids = result.selection?.selected_player_ids;
      if (Array.isArray(ids) && ids.length && ids.every((id) => demoPlayers.some((player) => player.id === id))) {
        setManualSelectedIds(ids);
        setManualContext("shared");
        setSelectionSource("shared");
        setCountOverride(typeof result.selection?.player_count === "number" ? result.selection.player_count : ids.length);
        const nextStatus = result.selection?.status === "approved" || result.selection?.status === "committed" ? result.selection.status : "selected";
        setSharedStatus(nextStatus);
        setRemoteStatus(`Shared selection · ${nextStatus}`);
      } else {
        setSharedStatus(null);
        setRemoteStatus("No shared player selection yet.");
      }
    } catch {
      setRemoteStatus("Shared selection is temporarily unavailable.");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
        const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
        setClubs(nextClubs);
        if (result.authenticated && nextClubs.length) {
          const clubId = nextClubs[0].id;
          setActiveClubId(clubId);
          const [selectionResponse] = await Promise.all([
            fetch(`/api/player-pack-selection?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" }),
            loadSharedSelection(clubId, campaignId)
          ]);
          if (selectionResponse.ok) {
            const selectionResult = await selectionResponse.json() as { selections?: SharedPackSelection[] };
            setSharedSelections(Array.isArray(selectionResult.selections) ? selectionResult.selections : []);
          }
        } else {
          setActiveClubId("");
          setSharedSelections([]);
          setRemoteStatus("Local planning only");
        }
      } catch {
        setActiveClubId("");
        setRemoteStatus("Local planning only");
      }
    })();
  }, [campaignId]); // eslint-disable-line react-hooks/exhaustive-deps -- shared selection follows the campaign

  async function syncCommercialCampaignRecord(
    talentStatus: "selected" | "approved" | "committed",
    ids: string[]
  ) {
    if (!activeClubId || selectedCampaign.type === "fixture") return true;
    try {
      const response = await fetch(`/api/campaign-record/${encodeURIComponent(campaignId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          campaignKind: "commercial",
          status: "draft",
          state: {
            version: 1,
            source: "commercial-calendar",
            campaign: {
              id: selectedCampaign.id,
              name: selectedCampaign.name,
              type: selectedCampaign.type,
              objective: selectedCampaign.objective,
              start: selectedCampaign.start,
              end: selectedCampaign.end,
              activationDate: selectedCampaign.activationDate,
              category: selectedCampaign.category,
              channel: selectedCampaign.channel,
              territory: selectedCampaign.territory,
              owner: selectedCampaign.owner,
              budget: selectedCampaign.budget,
              playerNeed: selectedCampaign.playerNeed
            },
            talent: {
              status: talentStatus,
              selectedPlayerIds: ids,
              playerCount: ids.length
            }
          }
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function syncSharedSelection(ids: string[]) {
    if (!activeClubId || ids.length !== count) {
      if (activeClubId && ids.length !== count) setRemoteStatus("Complete the pack to sync shared selection.");
      return;
    }
    setRemoteBusy(true);
    setRemoteStatus("Syncing selected pack…");
    try {
      const response = await fetch(`/api/player-pack-selection/${encodeURIComponent(campaignId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          status: "selected",
          selectedPlayerIds: ids,
          playerCount: ids.length,
          snapshot: {
            campaignName: selectedCampaign.name,
            requestedPlayerCount: count,
            activationDate: selectedCampaign.activationDate,
            channel: selectedCampaign.channel,
            territory: selectedCampaign.territory
          }
        })
      });
      if (response.ok) {
        const recordSynced = await syncCommercialCampaignRecord("selected", ids);
        setSelectionSource("shared");
        setManualContext("shared");
        setSharedStatus("selected");
        setRemoteStatus(recordSynced
          ? "Synced to club workspace · selected"
          : "Player selection synced · campaign record sync pending");
      } else {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        setRemoteStatus(result?.error || "Shared selection could not be synced. Local selection is unchanged.");
      }
    } catch {
      setRemoteStatus("Club sync unavailable. Local selection is unchanged.");
    } finally {
      setRemoteBusy(false);
    }
  }

  const players = useMemo(
    () => demoPlayers.map((player) => ({
      ...player,
      sportingAvailability: sporting[player.id],
      commercialAvailabilityOverride: commercialOverride[player.id]
    })),
    [sporting, commercialOverride]
  );

  const committedAppearances = useMemo(
    () => sharedSelections
      .filter((selection) => selection.status === "committed")
      .flatMap((selection) => selection.selected_player_ids.map((playerId) => ({
        id: `committed:${selection.campaign_id}:${playerId}`,
        playerId,
        date: selection.snapshot?.activationDate ?? selectedCampaign.activationDate,
        status: "reserved" as const,
        category: "campaign-commitment",
        channel: selection.snapshot?.channel ?? "club-social",
        territory: selection.snapshot?.territory ?? "UK",
        owner: "club-workspace",
        evidence: `Committed talent pack · ${selection.snapshot?.campaignName ?? selection.campaign_id}`
      }))),
    [sharedSelections, selectedCampaign.activationDate]
  );
  const planningAppearances = useMemo(
    () => [...demoAppearances, ...committedAppearances],
    [committedAppearances]
  );

  const request: ActivationRequest = {
    date: selectedCampaign.activationDate,
    category: selectedCampaign.category,
    channel: selectedCampaign.channel,
    territory: selectedCampaign.territory,
    owner: selectedCampaign.owner,
    budget: selectedCampaign.budget
  };

  const packs = recommendPlayerPacks(
    players,
    request,
    planningAppearances,
    Math.min(count, players.length),
    { fit: 30, balance: 15, engagement: 10, cost: 12, opportunityCost: 13, sportingAvailability: 5, momentum: 15 },
    demoPosts,
    true,
    demoInternationalDuty,
    demoPlayerMomentum
  ).slice(0, 3);

  const contextKey = [
    campaignId,
    count,
    ...players.map((player) => `${player.id}:${player.sportingAvailability}:${player.commercialAvailabilityOverride ? 1 : 0}`)
  ].join("|");
  const recommendedIds = packs[0]?.players.map((item) => item.player.id) ?? [];
  const hasCurrentManualSelection = manualContext === contextKey || manualContext === "stored" || manualContext === "shared";
  const activeIds = hasCurrentManualSelection ? manualSelectedIds : recommendedIds;
  const activePlayers = players.filter((player) => activeIds.includes(player.id));
  const activeEvaluation = evaluatePlayerPack(
    activePlayers,
    request,
    planningAppearances,
    { fit: 30, balance: 15, engagement: 10, cost: 12, opportunityCost: 13, sportingAvailability: 5, momentum: 15 },
    demoPosts,
    true,
    demoInternationalDuty,
    demoPlayerMomentum
  );
  const baseline = packs[0] ?? null;
  const selectionComplete = activeIds.length === count;
  const livePackState = !selectionComplete
    ? "Incomplete"
    : activeEvaluation.blockers.length
      ? "Blocked"
      : hasCurrentManualSelection
        ? selectionSource === "shared" ? "Selected · shared" : selectionSource === "local" ? "Selected locally" : "Custom pack"
        : "Recommended";
  const momentumRanking = players
    .map((player) => ({ player, momentum: playerMomentumScore(player.id, demoPlayerMomentum) }))
    .sort((a,b) => (b.momentum.score ?? -1) - (a.momentum.score ?? -1));

  function choosePack(ids: string[]) {
    setManualSelectedIds(ids);
    setManualContext(contextKey);
    setSelectionSource("local");
    try {
      window.localStorage.setItem(selectionStorageKey, JSON.stringify({
        campaignId,
        ids,
        count,
        savedAt: new Date().toISOString()
      }));
    } catch {
      // Local persistence is a convenience only; planning must still work without storage.
    }
    void syncSharedSelection(ids);
  }

  function togglePlayer(playerId: string) {
    const current = hasCurrentManualSelection ? manualSelectedIds : recommendedIds;
    if (current.includes(playerId)) {
      choosePack(current.filter((id) => id !== playerId));
      return;
    }
    if (current.length >= count) return;
    choosePack([...current, playerId]);
  }

  function delta(value: number | null | undefined, reference: number | null | undefined, suffix = "") {
    if (value === null || value === undefined || reference === null || reference === undefined) return "—";
    const diff = value - reference;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(0)}${suffix}`;
  }

  const activeClub = clubs.find((club) => club.id === activeClubId) ?? null;
  const canApprove = Boolean(activeClub?.permissions?.includes("campaigns:approve"));

  async function advanceSharedStatus(nextStatus: "approved" | "committed") {
    if (!activeClubId || remoteBusy) return;
    if (!selectionComplete || activeEvaluation.blockers.length) {
      setRemoteStatus("Resolve pack blockers and complete the selection before approval.");
      return;
    }
    if (!canApprove) {
      setRemoteStatus("Your club role does not have campaign approval permission.");
      return;
    }
    setRemoteBusy(true);
    setRemoteStatus(nextStatus === "approved" ? "Approving selected pack…" : "Committing approved pack…");
    try {
      const response = await fetch(`/api/player-pack-selection/${encodeURIComponent(campaignId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClubId,
          status: nextStatus,
          selectedPlayerIds: activeIds,
          playerCount: activeIds.length,
          snapshot: {
            campaignName: selectedCampaign.name,
            requestedPlayerCount: count,
            activationDate: selectedCampaign.activationDate,
            channel: selectedCampaign.channel,
            territory: selectedCampaign.territory,
            blockerCount: activeEvaluation.blockers.length,
            packScore: activeEvaluation.packScore,
            totalFee: activeEvaluation.totalFee,
            opportunityCost: activeEvaluation.opportunityCost
          }
        })
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (response.ok) {
        const recordSynced = await syncCommercialCampaignRecord(nextStatus, activeIds);
        setSharedStatus(nextStatus);
        setSelectionSource("shared");
        setManualContext("shared");
        setRemoteStatus(nextStatus === "approved"
          ? recordSynced
            ? "Approved in club workspace · not yet committed"
            : "Talent approved · campaign record sync pending"
          : recordSynced
            ? "Committed in club workspace · now reserved in player capacity planning"
            : "Talent committed · campaign record sync pending");
        if (nextStatus === "committed") {
          setSharedSelections((current) => [
            ...current.filter((item) => item.campaign_id !== campaignId),
            {
              campaign_id: campaignId,
              status: "committed",
              selected_player_ids: activeIds,
              player_count: activeIds.length,
              snapshot: {
                campaignName: selectedCampaign.name,
                activationDate: selectedCampaign.activationDate,
                channel: selectedCampaign.channel,
                territory: selectedCampaign.territory
              }
            }
          ]);
        }
      } else {
        setRemoteStatus(result?.error || "Player pack status could not be advanced.");
      }
    } catch {
      setRemoteStatus("Club workspace is unreachable. Player pack status was not changed.");
    } finally {
      setRemoteBusy(false);
    }
  }

  const internationalAlerts = internationalAvailabilityAlerts(players, demoInternationalDuty, selectedCampaign.start, selectedCampaign.end);

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Player Asset Planning</span>
          <h1>Who should we use for this activation?</h1>
          <p>Tell AVELA the campaign and how many players you need. The recommendation balances fit, availability, international duty, cost, remaining usage, momentum and season opportunity cost.</p>
        </div>
        <div className={styles.need}>
          <span>Players needed</span>
          <div>
            {[1,2,3,4].map((value) => <button type="button" key={value} className={count === value ? styles.active : ""} onClick={() => setCountOverride(value)}>{value}</button>)}
            <button type="button" className={count >= 5 ? styles.active : ""} onClick={() => setCountOverride(Math.min(5, players.length))}>5+</button>
          </div>
          <small>Brief default · {selectedCampaign.playerNeed} player{selectedCampaign.playerNeed === 1 ? "" : "s"}</small>
        </div>
      </header>

      <section id="campaign-context" className={styles.briefBuilder} aria-label="Campaign context">
        <div className={styles.briefMain}>
          <span>Campaign context</span>
          <select
            value={campaignId}
            onChange={(event) => {
              setCampaignId(event.target.value);
              setCountOverride(null);
              setManualSelectedIds([]);
              setManualContext("");
              setSelectionSource("recommended");
            }}
          >
            {campaignOptions.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
          <strong>{selectedCampaign.objective}</strong>
        </div>
        <div className={styles.briefFacts}>
          <article><span>Date</span><strong>{selectedCampaign.activationDate}</strong></article>
          <article><span>Channel</span><strong>{selectedCampaign.channel}</strong></article>
          <article><span>Territory</span><strong>{selectedCampaign.territory}</strong></article>
          <article><span>Budget</span><strong>£{selectedCampaign.budget.toLocaleString("en-GB")}</strong></article>
        </div>
      </section>

      <nav className={styles.guidedSteps} aria-label="Player pack workflow">
        <a href="#campaign-context" aria-current="step"><span>01</span><strong>Need</strong><small>Campaign + player count</small></a>
        <a href="#constraints"><span>02</span><strong>Constraints</strong><small>Availability + blockers</small></a>
        <a href="#packs"><span>03</span><strong>Recommended pack</strong><small>Best current combination</small></a>
        <a href="#compare"><span>04</span><strong>Compare</strong><small>Only if you need alternatives</small></a>
        <a href="#commit"><span>05</span><strong>Commit</strong><small>Approve or hand back</small></a>
      </nav>

      <section id="constraints" className={styles.constraintsGate} aria-label="Current player constraints">
        <div>
          <span>Step 02 · Constraints</span>
          <strong>{activeEvaluation.blockers.length ? activeEvaluation.blockers.length + " blocker" + (activeEvaluation.blockers.length === 1 ? "" : "s") + " in the current pack" : "No hard blocker in the current pack"}</strong>
          <small>{internationalAlerts.length} international-duty alert{internationalAlerts.length === 1 ? "" : "s"} · sporting and commercial availability stay inspectable</small>
        </div>
        <a href="#availability">Inspect constraints →</a>
      </section>

      <section id="packs" className={styles.recommendation} aria-label="Pack Optimizer recommendation">
        <div className={styles.sectionHead}>
          <div><span>Step 03 · Recommended pack</span><h2>Best combinations for {count} player{count === 1 ? "" : "s"}.</h2></div>
          <p>AVELA optimises the group, not just the top individual names.</p>
        </div>

        {baseline ? (
          <article className={styles.heroPack}>
            <div className={styles.heroPackIntro}>
              <span>Recommended now</span>
              <h3>{baseline.players.map((item) => item.player.name).join(" · ")}</h3>
              <p>{baseline.blockers.length ? `This pack currently has ${baseline.blockers.length} blocker${baseline.blockers.length === 1 ? "" : "s"}.` : "Eligible under the current date, contract, channel, budget and international-duty assumptions."}</p>
              <button type="button" onClick={() => choosePack(baseline.players.map((item) => item.player.id))}>Use recommended pack</button>
            </div>

            <div className={styles.heroScore}>
              <span>Pack score</span>
              <strong>{baseline.packScore.toFixed(0)}</strong>
              <small>Current best trade-off</small>
            </div>

            <div className={styles.heroPlayers}>
              {baseline.players.map((item) => (
                <div key={item.player.id}>
                  <strong>{item.player.name}</strong>
                  <span>{sportingLabel[item.player.sportingAvailability ?? "available"]}</span>
                  <small>Fit {item.player.fit} · {item.capacity.remaining ?? "?"} uses remaining</small>
                </div>
              ))}
            </div>

            <div className={styles.heroMetrics}>
              <div><span>Average fit</span><strong>{baseline.avgScore.toFixed(0)}</strong></div>
              <div><span>Momentum</span><strong>{baseline.momentumScore?.toFixed(0) ?? "—"}</strong></div>
              <div><span>Cost</span><strong>£{baseline.totalFee}</strong></div>
              <div><span>Opportunity cost</span><strong>{baseline.opportunityCost.toFixed(0)}</strong></div>
            </div>

            <details className={styles.heroWhy}>
              <summary>Why AVELA chose this pack</summary>
              <div>
                <p><strong>Fit:</strong> balances campaign fit across the group rather than simply taking the highest-profile individuals.</p>
                <p><strong>Availability:</strong> applies sporting status, commercial override and international-duty constraints before recommending.</p>
                <p><strong>Scarcity:</strong> accounts for remaining appearances and opportunity cost so one activation does not consume the season&apos;s best assets unnecessarily.</p>
                <p><strong>Momentum:</strong> uses current attention where evidence exists, without treating missing dimensions as zero.</p>
              </div>
            </details>
          </article>
        ) : (
          <div className={styles.noPack}><strong>No eligible pack for this requirement.</strong><p>Reduce player count, change date/channel/budget, or resolve availability and international-duty blockers.</p></div>
        )}

        {packs.length > 1 ? (
          <details id="compare" className={styles.alternatives}>
            <summary className={styles.alternativeHead}>
              <div><span>Step 04 · Compare</span><strong>Challenge the recommendation only if you need another trade-off.</strong></div>
              <b>Show {packs.length - 1} alternative{packs.length - 1 === 1 ? "" : "s"} →</b>
            </summary>
            <div className={styles.alternativeGrid}>
              {packs.slice(1).map((pack, index) => (
                <article key={pack.players.map((item) => item.player.id).join("-")}>
                  <div className={styles.packHead}>
                    <div><span>Option {index + 2}</span><strong>{pack.packScore.toFixed(0)}</strong></div>
                    <b>£{pack.totalFee}</b>
                  </div>
                  <div className={styles.packPlayers}>
                    {pack.players.map((item) => (
                      <div key={item.player.id}>
                        <strong>{item.player.name}</strong>
                        <small>{item.capacity.remaining ?? "?"} remaining · fit {item.player.fit}</small>
                      </div>
                    ))}
                  </div>
                  <div className={styles.packMetrics}>
                    <div><span>Fit</span><strong>{pack.avgScore.toFixed(0)}</strong></div>
                    <div><span>Momentum</span><strong>{pack.momentumScore?.toFixed(0) ?? "—"}</strong></div>
                    <div><span>Opp. cost</span><strong>{pack.opportunityCost.toFixed(0)}</strong></div>
                  </div>
                  <button className={styles.usePack} type="button" onClick={() => choosePack(pack.players.map((item) => item.player.id))}>Use this pack</button>
                </article>
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <details id="scenario" className={styles.simulator} aria-label="Player pack scenario simulator">
        <summary className={styles.simulatorSummary}>
          <div><span>Optional scenario</span><strong>Manually change the recommended pack</strong></div>
          <small>Open only when you want to add/remove players and recalculate the trade-off.</small>
        </summary>
        <div className={styles.simulatorBody}>
        <div className={styles.simulatorHead}>
          <div>
            <span>Live scenario</span>
            <h2>{selectionComplete ? "Your current pack" : `Select ${count - activeIds.length} more player${count - activeIds.length === 1 ? "" : "s"}`}</h2>
            <p>Change the recommendation only when the trade-off is worth it. Every add/remove recalculates cost, fit, momentum, scarcity and blockers.</p>
          </div>
          <button type="button" disabled={remoteBusy} onClick={() => {
            setManualSelectedIds([]);
            setManualContext("");
            setSelectionSource("recommended");
            setCountOverride(null);
            if (activeClubId) setRemoteStatus("Showing AVELA recommendation locally · shared selection unchanged");
            try { window.localStorage.removeItem(selectionStorageKey); } catch {}
          }}>Reset recommendation</button>
        </div>

        <div className={styles.currentPack}>
          <div className={styles.currentPlayers}>
            {activePlayers.map((player) => (
              <button type="button" key={player.id} onClick={() => togglePlayer(player.id)}>
                <span>{player.name}</span><b>×</b>
              </button>
            ))}
            {Array.from({ length: Math.max(0, count - activePlayers.length) }).map((_, index) => <div key={index} className={styles.emptySlot}>+ player</div>)}
          </div>

          <div className={styles.liveMetrics}>
            <article><span>Pack score</span><strong>{activeEvaluation.packScore.toFixed(0)}</strong><small>{delta(activeEvaluation.packScore, baseline?.packScore)} vs recommended</small></article>
            <article><span>Cost</span><strong>£{activeEvaluation.totalFee}</strong><small>{delta(activeEvaluation.totalFee, baseline?.totalFee, " GBP")} vs recommended</small></article>
            <article><span>Momentum</span><strong>{activeEvaluation.momentumScore?.toFixed(0) ?? "—"}</strong><small>{delta(activeEvaluation.momentumScore, baseline?.momentumScore)} vs recommended</small></article>
            <article><span>Opportunity cost</span><strong>{activeEvaluation.opportunityCost.toFixed(0)}</strong><small>{delta(activeEvaluation.opportunityCost, baseline?.opportunityCost)} vs recommended · lower is better</small></article>
          </div>
        </div>

        <div className={styles.changeStory}>
          <div><span>What changed?</span><strong>{manualContext === contextKey ? "AVELA recalculated this combination." : "This is the current AVELA recommendation."}</strong></div>
          <div className={styles.changeChips}>
            <b>{delta(activeEvaluation.totalFee, baseline?.totalFee, " GBP")} cost</b>
            <b>{delta(activeEvaluation.momentumScore, baseline?.momentumScore)} momentum</b>
            <b>{delta(activeEvaluation.avgScore, baseline?.avgScore)} fit</b>
            <b>{delta(activeEvaluation.opportunityCost, baseline?.opportunityCost)} opportunity cost</b>
            <b>{activeEvaluation.blockers.length ? `${activeEvaluation.blockers.length} blocker${activeEvaluation.blockers.length === 1 ? "" : "s"}` : "No blockers"}</b>
          </div>
          <p>{!selectionComplete ? "Pack is incomplete. Add players from Momentum Monitor." : activeEvaluation.blockers.length ? `Resolve: ${activeEvaluation.blockers.join(", ")}.` : activeEvaluation.momentumScore !== null && baseline?.momentumScore !== null && activeEvaluation.momentumScore > baseline.momentumScore && activeEvaluation.opportunityCost > (baseline?.opportunityCost ?? 0) ? "This version captures more current momentum but consumes more scarce player capacity." : "The current trade-off remains within the campaign constraints."}</p>
        </div>
        </div>
      </details>

      <section id="commit" className={styles.workflowExit} aria-label="Continue campaign workflow">
        <div>
          <span>Selection state</span>
          <strong>{sharedStatus === "committed" ? "Player pack committed in the club workspace." : sharedStatus === "approved" ? "Player pack approved and awaiting commitment." : selectionSource === "shared" ? "Selected pack is shared with authorised club users." : "This player pack is still a planning selection."}</strong>
          <p>{remoteStatus || "Changing the pack recalculates fit, cost, scarcity and blockers. Selection does not approve talent use or create a final player commitment."}</p>
          {clubs.length > 1 ? (
            <label>
              Club
              <select value={activeClubId} onChange={(event) => {
                setActiveClubId(event.target.value);
                void loadSharedSelection(event.target.value, campaignId);
              }}>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
              </select>
            </label>
          ) : null}
        </div>
        <div className={styles.governanceActions}>
          {sharedStatus === "selected" && canApprove && selectionComplete && activeEvaluation.blockers.length === 0 ? (
            <button type="button" disabled={remoteBusy} onClick={() => void advanceSharedStatus("approved")}>
              {remoteBusy ? "Updating…" : "Approve selected pack"}
            </button>
          ) : null}
          {sharedStatus === "approved" && canApprove ? (
            <button type="button" disabled={remoteBusy} onClick={() => void advanceSharedStatus("committed")}>
              {remoteBusy ? "Updating…" : "Commit approved pack"}
            </button>
          ) : null}
          <Link href="/app/campaigns">Return to Campaigns →</Link>
        </div>
      </section>

      <details className={styles.evidencePanel}>
        <summary>
          <span>Decision evidence</span>
          <strong>Availability, player status and Momentum Monitor</strong>
          <small>Open only when you need to challenge or explain the recommendation.</small>
        </summary>

        <div className={styles.evidenceBody}>
          <section id="availability" className={styles.alerts}>
            <div className={styles.sectionHead}>
              <div><span>International duty alerts</span><h2>Know absences before the pack is locked.</h2></div>
              <p>Windows create watch alerts. Internal pre-alerts and public squad confirmations remove affected players from eligible packs for overlapping dates.</p>
            </div>
            <div className={styles.alertGrid}>
              {internationalAlerts.map((alert) => (
                <article key={alert.playerId + alert.start}>
                  <div><span>{alert.visibility === "internal" ? "Internal pre-alert" : alert.state === "public-confirmed" ? "Public confirmation" : "International window"}</span><strong>{alert.playerName}</strong></div>
                  <p>{alert.message}</p>
                  <small>{alert.team} · {alert.start} → {alert.end}</small>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.summary}>
            <article><span>Activation</span><strong>{selectedCampaign.name} · {selectedCampaign.activationDate}</strong><small>{selectedCampaign.channel} · {selectedCampaign.territory} · £{selectedCampaign.budget.toLocaleString("en-GB")} budget</small></article>
            <article><span>Optimisation goal</span><strong>Fit + balance + cost + opportunity cost</strong><small>Engagement used where measured</small></article>
            <article><span>Human control</span><strong>Club confirms sporting status</strong><small>No medical inference or automatic player-status claim</small></article>
          </section>

          <section id="player-status" className={styles.playerGrid} aria-label="Player asset status">
            {players.map((player) => {
              const capacity = playerCapacity(player, planningAppearances);
              const duty = demoInternationalDuty.find((item) => item.playerId === player.id && item.state !== "released");
              return (
                <article key={player.id}>
                  <div className={styles.playerTop}>
                    <div><span>{player.id}</span><h2>{player.name}</h2></div>
                    <strong>£{player.fee}</strong>
                  </div>

                  <label>
                    Sporting status
                    <select value={sporting[player.id]} onChange={(event) => setSporting((current) => ({ ...current, [player.id]: event.target.value as SportingAvailability }))}>
                      <option value="available">Available</option>
                      <option value="injured">Injured</option>
                      <option value="rehab">Rehab</option>
                      <option value="sporting-unavailable">Unavailable</option>
                    </select>
                  </label>

                  <label className={styles.override}>
                    <input
                      type="checkbox"
                      checked={commercialOverride[player.id]}
                      onChange={(event) => setCommercialOverride((current) => ({ ...current, [player.id]: event.target.checked }))}
                    />
                    <span>Commercially available despite sporting status</span>
                  </label>

                  <div className={styles.capacity}>
                    <div><span>Used</span><strong>{capacity.used}</strong></div>
                    <div><span>Remaining</span><strong>{capacity.remaining ?? "?"}</strong></div>
                    <div><span>Fit</span><strong>{player.fit}</strong></div>
                  </div>

                  <div className={styles.state}>
                    <span>{sportingLabel[player.sportingAvailability ?? "available"]}</span>
                    <small>{player.signed && player.validated ? "Agreement validated" : "Agreement not validated"}</small>
                    {duty ? <small>{duty.public ? "International duty · public" : "International duty · internal"} · {duty.start}–{duty.end}</small> : null}
                  </div>
                </article>
              );
            })}
          </section>

          <section id="momentum" className={styles.momentum}>
            <div className={styles.sectionHead}>
              <div><span>Momentum Monitor</span><h2>Change the pack with evidence, not instinct alone.</h2></div>
              <p>Sporting, attention/social, international and commercial momentum remain separate. Missing dimensions are excluded from the average, never treated as zero.</p>
            </div>
            <div className={styles.momentumGrid}>
              {momentumRanking.map(({ player, momentum }) => {
                const signal = momentum.signal;
                const isSelected = activeIds.includes(player.id);
                return (
                  <article key={player.id} className={isSelected ? styles.momentumSelected : ""}>
                    <div className={styles.momentumTop}>
                      <div><span>{isSelected ? "In current pack" : "Candidate"}</span><strong>{player.name}</strong></div>
                      <b>{momentum.score !== null ? momentum.score.toFixed(0) : "—"}</b>
                    </div>
                    {signal ? (
                      <div className={styles.momentumDimensions}>
                        {([
                          ["Sporting", signal.sporting],
                          ["Attention", signal.attention],
                          ["International", signal.international],
                          ["Commercial", signal.commercial]
                        ] as const).map(([label, dimension]) => {
                          const item = dimension as typeof signal.sporting;
                          return (
                            <div key={String(label)} title={item.source}>
                              <span><b>{label}</b><small>{item.direction === "up" ? "↑" : item.direction === "down" ? "↓" : item.direction === "stable" ? "→" : "?"} {item.value ?? "missing"}</small></span>
                              <i><em style={{ width: `${item.value ?? 0}%` }} /></i>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p>No current momentum evidence.</p>}
                    <small className={styles.momentumSource}>{signal ? `Snapshot ${signal.observedAt} · ${momentum.availableDimensions}/4 dimensions available` : "No evidence snapshot"}</small>
                    <button type="button" onClick={() => togglePlayer(player.id)} disabled={!isSelected && activeIds.length >= count}>
                      {isSelected ? "Remove from pack" : activeIds.length >= count ? "Pack full" : "Add to pack"}
                    </button>
                  </article>
                );
              })}
            </div>
            <p className={styles.demoNote}>Demo momentum values are synthetic and labelled as such in the data model. In a club deployment these slots should be fed by authorised/public sources such as sporting events, social/content performance, search/attention and international context.</p>
          </section>
        </div>
      </details>
    </section>
  );
}
