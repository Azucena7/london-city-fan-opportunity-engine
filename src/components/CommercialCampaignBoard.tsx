"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { demoCommercialCampaigns, demoPlayers } from "@/lib/clubStrategy";
import { WorkspaceBadge } from "@/components/WorkspaceUI";
import styles from "@/app/app/campaigns/campaigns.module.css";

type Club = { id: string; name: string };
type Selection = {
  campaign_id: string;
  status: "selected" | "approved" | "committed";
  selected_player_ids: string[];
  player_count: number;
  snapshot?: { activationDate?: string; campaignName?: string };
  updated_at?: string;
};

export function CommercialCampaignBoard() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [state, setState] = useState<"loading" | "local" | "shared">("loading");

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated?: boolean; clubs?: Club[] };
        const clubId = session.clubs?.[0]?.id;
        if (!session.authenticated || !clubId) {
          setState("local");
          return;
        }
        const response = await fetch(`/api/player-pack-selection?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
        const result = await response.json() as { selections?: Selection[] };
        if (response.ok && Array.isArray(result.selections)) {
          setSelections(result.selections);
          setState("shared");
        } else {
          setState("local");
        }
      } catch {
        setState("local");
      }
    })();
  }, []);

  const byCampaign = useMemo(
    () => new Map(selections.map((selection) => [selection.campaign_id, selection])),
    [selections]
  );

  return (
    <>
      {demoCommercialCampaigns.map((campaign) => {
        const selection = byCampaign.get(campaign.id);
        const talentState = selection?.status ?? "recommended";
        const names = selection?.selected_player_ids
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
            campaignName: other.snapshot?.campaignName ?? otherCampaign?.name ?? other.campaign_id
          }));
        }) : [];

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
