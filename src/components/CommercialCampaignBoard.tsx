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
  recommendPlayerPacks
} from "@/lib/clubStrategy";
import { WorkspaceBadge } from "@/components/WorkspaceUI";
import styles from "@/app/app/campaigns/campaigns.module.css";

type Club = { id: string; name: string; permissions?: string[] };
type CampaignRecord = {
  campaign_key: string;
  campaign_kind: "commercial" | "fixture";
  status: string;
  state?: {
    campaign?: { name?: string; activationDate?: string; objective?: string };
    talent?: { status?: "selected" | "approved" | "committed"; selectedPlayerIds?: string[]; playerCount?: number };
  };
  updated_at?: string;
};

type Selection = {
  campaign_id: string;
  status: "selected" | "approved" | "committed";
  selected_player_ids: string[];
  player_count: number;
  snapshot?: { activationDate?: string; campaignName?: string };
  updated_at?: string;
};

function governanceRank(status: Selection["status"]) {
  if (status === "committed") return 3;
  if (status === "approved") return 2;
  return 1;
}

export function CommercialCampaignBoard() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [records, setRecords] = useState<CampaignRecord[]>([]);
  const [state, setState] = useState<"loading" | "local" | "shared">("loading");
  const [activeClub, setActiveClub] = useState<Club | null>(null);
  const [applyState, setApplyState] = useState<Record<string, string>>({});

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated?: boolean; clubs?: Club[] };
        const firstClub = session.clubs?.[0] ?? null;
        const clubId = firstClub?.id;
        if (!session.authenticated || !clubId) {
          setActiveClub(null);
          setState("local");
          return;
        }
        setActiveClub(firstClub);
        const [selectionResponse, recordResponse] = await Promise.all([
          fetch(`/api/player-pack-selection?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" }),
          fetch(`/api/campaign-record?clubId=${encodeURIComponent(clubId)}&kind=commercial`, { cache: "no-store" })
        ]);
        const selectionResult = await selectionResponse.json() as { selections?: Selection[] };
        const recordResult = await recordResponse.json() as { records?: CampaignRecord[] };
        if (selectionResponse.ok && Array.isArray(selectionResult.selections)) setSelections(selectionResult.selections);
        if (recordResponse.ok && Array.isArray(recordResult.records)) setRecords(recordResult.records);
        setState(selectionResponse.ok || recordResponse.ok ? "shared" : "local");
      } catch {
        setState("local");
      }
    })();
  }, []);

  async function applyResolution(campaignId: string, playerIds: string[], campaignName: string, activationDate: string, channel: string, territory: string) {
    if (!activeClub || !activeClub.permissions?.includes("campaigns:edit")) {
      setApplyState((current) => ({ ...current, [campaignId]: "Your club role cannot edit campaign talent selections." }));
      return;
    }
    setApplyState((current) => ({ ...current, [campaignId]: "Applying alternative as selected…" }));
    try {
      const response = await fetch(`/api/player-pack-selection/${encodeURIComponent(campaignId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: activeClub.id,
          status: "selected",
          selectedPlayerIds: playerIds,
          playerCount: playerIds.length,
          snapshot: {
            campaignName,
            activationDate,
            channel,
            territory,
            blockerCount: 0,
            resolutionSource: "talent-conflict"
          }
        })
      });
      const result = await response.json().catch(() => null) as { error?: string; selection?: Selection } | null;
      if (!response.ok) {
        setApplyState((current) => ({ ...current, [campaignId]: result?.error || "Alternative pack was not applied." }));
        return;
      }
      const nextSelection = result?.selection ?? {
        campaign_id: campaignId,
        status: "selected" as const,
        selected_player_ids: playerIds,
        player_count: playerIds.length,
        snapshot: { campaignName, activationDate }
      };
      setSelections((current) => [
        ...current.filter((item) => item.campaign_id !== campaignId),
        nextSelection
      ]);
      setApplyState((current) => ({ ...current, [campaignId]: "Alternative applied as selected · approval required again." }));
    } catch {
      setApplyState((current) => ({ ...current, [campaignId]: "Club workspace unavailable. No selection was changed." }));
    }
  }

  const byCampaign = useMemo(
    () => new Map(selections.map((selection) => [selection.campaign_id, selection])),
    [selections]
  );
  const recordByCampaign = useMemo(
    () => new Map(records.map((record) => [record.campaign_key, record])),
    [records]
  );

  return (
    <>
      {demoCommercialCampaigns.map((campaign) => {
        const selection = byCampaign.get(campaign.id);
        const record = recordByCampaign.get(campaign.id);
        const recordTalent = record?.state?.talent;
        const talentState = selection?.status ?? recordTalent?.status ?? "recommended";
        const selectedIds = selection?.selected_player_ids ?? recordTalent?.selectedPlayerIds ?? [];
        const names = selectedIds
          ?.map((id) => demoPlayers.find((player) => player.id === id)?.name ?? id)
          .join(" · ");
        const conflictRows = selection ? selections.flatMap((other) => {
          if (other.campaign_id === campaign.id) return [];
          const sharedIds = selection.selected_player_ids.filter((id) => other.selected_player_ids.includes(id));
          if (!sharedIds.length) return [];
          const otherCampaign = demoCommercialCampaigns.find((item) => item.id === other.campaign_id);
          const aDate = selection.snapshot?.activationDate ?? campaign.activationDate;
          const bDate = other.snapshot?.activationDate ?? otherCampaign?.activationDate;
          if (!bDate) return [];
          const days = Math.round(Math.abs(Date.parse(aDate) - Date.parse(bDate)) / 86400000);
          if (days > 7) return [];
          return sharedIds.map((playerId) => ({
            playerId,
            days,
            status: other.status,
            campaignId: other.campaign_id,
            campaignName: other.snapshot?.campaignName ?? otherCampaign?.name ?? other.campaign_id,
            activationDate: bDate
          }));
        }) : [];

        const conflictPlayerIds = new Set(conflictRows.map((item) => item.playerId));
        const strongestCompeting = conflictRows
          .map((conflict) => byCampaign.get(conflict.campaignId))
          .filter((item): item is Selection => Boolean(item))
          .sort((a, b) => governanceRank(b.status) - governanceRank(a.status)
            || (a.snapshot?.activationDate ?? "").localeCompare(b.snapshot?.activationDate ?? ""))[0] ?? null;
        const protectCurrent = selection ? (
          !strongestCompeting
          || governanceRank(selection.status) > governanceRank(strongestCompeting.status)
          || (
            governanceRank(selection.status) === governanceRank(strongestCompeting.status)
            && campaign.activationDate <= (strongestCompeting.snapshot?.activationDate ?? campaign.activationDate)
          )
        ) : false;
        const shouldChangeCurrent = conflictRows.length > 0 && !protectCurrent;
        const alternativePool = demoPlayers.filter((player) => !conflictPlayerIds.has(player.id));
        const eligibleAlternatives = shouldChangeCurrent && alternativePool.length >= campaign.playerNeed
          ? recommendPlayerPacks(
              alternativePool,
              {
                date: campaign.activationDate,
                category: campaign.category,
                channel: campaign.channel,
                territory: campaign.territory,
                owner: campaign.owner,
                budget: campaign.budget
              },
              demoAppearances,
              campaign.playerNeed,
              { fit: 30, balance: 15, engagement: 10, cost: 12, opportunityCost: 13, sportingAvailability: 5, momentum: 15 },
              demoPosts,
              true,
              demoInternationalDuty,
              demoPlayerMomentum
            )
          : [];
        const resolutionPack = eligibleAlternatives[0] ?? null;
        const currentCost = selection
          ? selection.selected_player_ids.reduce((sum, id) => sum + (demoPlayers.find((player) => player.id === id)?.fee ?? 0), 0)
          : null;
        const costDelta = resolutionPack && currentCost !== null ? resolutionPack.totalFee - currentCost : null;

        return (
          <article key={campaign.id} className={styles.campaignCard}>
            <div className={styles.meta}>
              <WorkspaceBadge>{campaign.type.replaceAll("-", " ")}</WorkspaceBadge>
              <small>{campaign.activationDate}</small>
            </div>
            <h3>{campaign.name}</h3>
            <p>{campaign.objective}</p>
            <div className={styles.cardFacts}>
              <span>Players <b>{campaign.playerNeed}</b></span>
              <span>Window <b>{campaign.start} → {campaign.end}</b></span>
            </div>
            <div className={styles.talentState}>
              <span>Talent</span>
              <strong data-status={talentState}>{talentState}</strong>
              <small>
                {names || (state === "loading"
                  ? "Checking club workspace…"
                  : talentState === "recommended"
                    ? "AVELA recommendation not yet selected"
                    : "Shared club selection")}
                {record ? " · shared campaign record" : ""}
              </small>
            </div>
            {conflictRows.length ? (
              <div className={styles.talentConflictAlert}>
                <strong>{conflictRows.length} talent conflict{conflictRows.length === 1 ? "" : "s"}</strong>
                <small>
                  {conflictRows.slice(0, 2).map((conflict) => {
                    const player = demoPlayers.find((item) => item.id === conflict.playerId);
                    return `${player?.name ?? conflict.playerId} · ${conflict.days === 0 ? "same day" : conflict.days + "d"} vs ${conflict.campaignName} (${conflict.status})`;
                  }).join(" · ")}
                </small>
                <div className={styles.conflictResolution}>
                  <span>AVELA resolution</span>
                  <strong>{protectCurrent ? "Protect this pack" : resolutionPack ? "Change this pack" : "Manual resolution required"}</strong>
                  <p>
                    {protectCurrent
                      ? "This campaign has the stronger governance state or earlier equal-priority date. Resolve the competing campaign first."
                      : resolutionPack
                        ? `Best alternative: ${resolutionPack.players.map((item) => item.player.name).join(" · ")} · score ${resolutionPack.packScore.toFixed(0)} · £${resolutionPack.totalFee}${costDelta === null ? "" : ` · ${costDelta >= 0 ? "+" : ""}£${costDelta} vs current`} · opportunity cost ${resolutionPack.opportunityCost.toFixed(0)}.`
                        : "No eligible alternative pack satisfies the current date, contract, availability, budget and duty constraints."}
                  </p>
                  {!protectCurrent && resolutionPack && selection?.status === "selected" ? (
                    <button
                      type="button"
                      disabled={applyState[campaign.id] === "Applying alternative as selected…"}
                      onClick={() => void applyResolution(
                        campaign.id,
                        resolutionPack.players.map((item) => item.player.id),
                        campaign.name,
                        campaign.activationDate,
                        campaign.channel,
                        campaign.territory
                      )}
                    >
                      {applyState[campaign.id] === "Applying alternative as selected…" ? "Applying…" : "Apply alternative as selected"}
                    </button>
                  ) : !protectCurrent && resolutionPack && selection && selection.status !== "selected" ? (
                    <small className={styles.reopenRequired}>Pack is {selection.status}. Reopen it in Player Assets before changing talent.</small>
                  ) : null}
                  {applyState[campaign.id] ? <small className={styles.applyStatus} role="status">{applyState[campaign.id]}</small> : null}
                </div>
              </div>
            ) : null}
            <Link href={"/app/players?campaign=" + encodeURIComponent(campaign.id)}>
              {talentState === "recommended" ? "Optimise pack →" : "Open talent pack →"}
            </Link>
          </article>
        );
      })}
    </>
  );
}
