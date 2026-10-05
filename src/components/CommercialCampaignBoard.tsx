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
            <Link href={"/app/players?campaign=" + encodeURIComponent(campaign.id)}>
              {talentState === "recommended" ? "Optimise pack →" : "Open talent pack →"}
            </Link>
          </article>
        );
      })}
    </>
  );
}
