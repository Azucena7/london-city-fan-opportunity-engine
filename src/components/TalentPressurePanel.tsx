"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { demoPlayers } from "@/lib/clubStrategy";
import styles from "@/app/app/season/season.module.css";

type Club = { id: string; name: string };
type Selection = {
  campaign_id: string;
  status: "selected" | "approved" | "committed";
  selected_player_ids: string[];
  player_count: number;
  snapshot?: {
    campaignName?: string;
    activationDate?: string;
    channel?: string;
    territory?: string;
  };
};

function weekKey(date: string) {
  const parsed = new Date(date + "T12:00:00Z");
  const day = (parsed.getUTCDay() + 6) % 7;
  parsed.setUTCDate(parsed.getUTCDate() - day);
  return parsed.toISOString().slice(0, 10);
}

function statusWeight(status: Selection["status"]) {
  if (status === "committed") return 3;
  if (status === "approved") return 2;
  return 1;
}

export function TalentPressurePanel() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [mode, setMode] = useState<"loading" | "local" | "shared">("loading");

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated?: boolean; clubs?: Club[] };
        const clubId = session.clubs?.[0]?.id;
        if (!session.authenticated || !clubId) {
          setMode("local");
          return;
        }

        const response = await fetch(`/api/player-pack-selection?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
        const result = await response.json() as { selections?: Selection[] };
        if (response.ok && Array.isArray(result.selections)) {
          setSelections(result.selections);
          setMode("shared");
        } else {
          setMode("local");
        }
      } catch {
        setMode("local");
      }
    })();
  }, []);

  const dated = selections.filter((selection) => selection.snapshot?.activationDate);
  const weeks = useMemo(() => {
    const groups = new Map<string, { score: number; campaigns: number; committed: number; players: Set<string> }>();
    for (const selection of dated) {
      const key = weekKey(selection.snapshot!.activationDate!);
      const current = groups.get(key) ?? { score: 0, campaigns: 0, committed: 0, players: new Set<string>() };
      current.score += statusWeight(selection.status) * Math.max(1, selection.player_count);
      current.campaigns += 1;
      if (selection.status === "committed") current.committed += 1;
      selection.selected_player_ids.forEach((id) => current.players.add(id));
      groups.set(key, current);
    }
    return [...groups.entries()]
      .map(([week, value]) => ({ week, ...value, playerCount: value.players.size }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [dated]);

  const conflicts = useMemo(() => {
    const byPlayer = new Map<string, Selection[]>();
    for (const selection of dated) {
      for (const playerId of selection.selected_player_ids) {
        const current = byPlayer.get(playerId) ?? [];
        current.push(selection);
        byPlayer.set(playerId, current);
      }
    }

    return [...byPlayer.entries()]
      .flatMap(([playerId, items]) => {
        const sorted = [...items].sort((a, b) => (a.snapshot?.activationDate ?? "").localeCompare(b.snapshot?.activationDate ?? ""));
        const pairs: Array<{ playerId: string; a: Selection; b: Selection; days: number }> = [];
        for (let i = 0; i < sorted.length; i += 1) {
          for (let j = i + 1; j < sorted.length; j += 1) {
            const aDate = sorted[i].snapshot?.activationDate;
            const bDate = sorted[j].snapshot?.activationDate;
            if (!aDate || !bDate) continue;
            const days = Math.round(Math.abs(Date.parse(bDate) - Date.parse(aDate)) / 86400000);
            if (days <= 7) pairs.push({ playerId, a: sorted[i], b: sorted[j], days });
          }
        }
        return pairs;
      })
      .sort((a, b) => a.days - b.days || statusWeight(b.a.status) + statusWeight(b.b.status) - statusWeight(a.a.status) - statusWeight(a.b.status));
  }, [dated]);

  const maxScore = Math.max(1, ...weeks.map((week) => week.score));

  return (
    <div className={styles.talentPressure}>
      <div className={styles.talentPressureIntro}>
        <div>
          <span>Talent pressure</span>
          <strong>{mode === "loading" ? "Checking shared player commitments…" : conflicts.length ? `${conflicts.length} overlap${conflicts.length === 1 ? "" : "s"} need attention` : "No near-term player overlaps detected"}</strong>
        </div>
        <Link href="/app/players">Open Player Assets →</Link>
      </div>

      {weeks.length ? (
        <div className={styles.weekPressure}>
          {weeks.slice(0, 8).map((week) => (
            <article key={week.week}>
              <div><span>Week of {week.week}</span><strong>{week.score}</strong></div>
              <i><em style={{ width: Math.max(8, (week.score / maxScore) * 100) + "%" }} /></i>
              <small>{week.campaigns} campaign{week.campaigns === 1 ? "" : "s"} · {week.playerCount} player{week.playerCount === 1 ? "" : "s"} · {week.committed} committed</small>
            </article>
          ))}
        </div>
      ) : <p className={styles.talentPressureEmpty}>{mode === "local" ? "Sign in to see shared talent pressure across campaigns." : "No dated shared player packs yet."}</p>}

      {conflicts.length ? (
        <div className={styles.talentConflictList}>
          {conflicts.slice(0, 6).map((conflict, index) => {
            const player = demoPlayers.find((item) => item.id === conflict.playerId);
            return (
              <article key={conflict.playerId + ":" + index}>
                <div>
                  <span>{conflict.days === 0 ? "Same-day conflict" : conflict.days + " days apart"}</span>
                  <strong>{player?.name ?? conflict.playerId}</strong>
                </div>
                <p>{conflict.a.snapshot?.campaignName ?? conflict.a.campaign_id} · {conflict.a.status} ↔ {conflict.b.snapshot?.campaignName ?? conflict.b.campaign_id} · {conflict.b.status}</p>
                <Link href={"/app/players?campaign=" + encodeURIComponent(conflict.b.campaign_id)}>Review pack →</Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
