"use client";

import { useMemo, useState } from "react";
import {
  demoAppearances,
  demoCommercialCampaigns,
  demoInternationalDuty,
  demoPlayers,
  demoPosts,
  internationalAvailabilityAlerts,
  playerCapacity,
  recommendPlayerPacks,
  type ActivationRequest,
  type SportingAvailability
} from "@/lib/clubStrategy";
import styles from "./PlayerAssetPlanner.module.css";

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

export function PlayerAssetPlanner() {
  const campaignOptions = [fixtureBrief, ...demoCommercialCampaigns];
  const [campaignId, setCampaignId] = useState(campaignOptions[0]?.id ?? fixtureBrief.id);
  const selectedCampaign = campaignOptions.find((item) => item.id === campaignId) ?? fixtureBrief;
  const [countOverride, setCountOverride] = useState<number | null>(null);
  const count = countOverride ?? selectedCampaign.playerNeed;
  const [sporting, setSporting] = useState<Record<string, SportingAvailability>>(
    Object.fromEntries(demoPlayers.map((player) => [player.id, player.sportingAvailability ?? "available"]))
  );
  const [commercialOverride, setCommercialOverride] = useState<Record<string, boolean>>(
    Object.fromEntries(demoPlayers.map((player) => [player.id, Boolean(player.commercialAvailabilityOverride)]))
  );

  const players = useMemo(
    () => demoPlayers.map((player) => ({
      ...player,
      sportingAvailability: sporting[player.id],
      commercialAvailabilityOverride: commercialOverride[player.id]
    })),
    [sporting, commercialOverride]
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
    demoAppearances,
    Math.min(count, players.length),
    { fit: 35, balance: 20, engagement: 10, cost: 15, opportunityCost: 15, sportingAvailability: 5 },
    demoPosts,
    true,
    demoInternationalDuty
  ).slice(0, 3);

  const internationalAlerts = internationalAvailabilityAlerts(players, demoInternationalDuty, selectedCampaign.start, selectedCampaign.end);

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Player Asset Planning</span>
          <h1>Use the right players without burning the season.</h1>
          <p>Optimise commercial appearances across contract rights, availability, international duty, cost, remaining quota and opportunity cost. Sporting status is a club-entered planning flag, not a medical assessment.</p>
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

      <section className={styles.campaignContext} aria-label="Commercial campaign context">
        <div>
          <span>Campaign context</span>
          <select
            value={campaignId}
            onChange={(event) => {
              setCampaignId(event.target.value);
              setCountOverride(null);
            }}
          >
            {campaignOptions.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>
        <article>
          <span>Type</span>
          <strong>{selectedCampaign.type.replaceAll("-", " ")}</strong>
        </article>
        <article>
          <span>Activation date</span>
          <strong>{selectedCampaign.activationDate}</strong>
        </article>
        <article>
          <span>Objective</span>
          <strong>{selectedCampaign.objective}</strong>
        </article>
      </section>

      <section className={styles.alerts}>
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

      <section className={styles.playerGrid} aria-label="Player asset status">
        {players.map((player) => {
          const capacity = playerCapacity(player, demoAppearances);
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

      <section className={styles.packs}>
        <div className={styles.sectionHead}>
          <div><span>Pack Optimizer</span><h2>Best combinations for {count} player{count === 1 ? "" : "s"}.</h2></div>
          <p>AVELA optimises the group, not just the top individual names.</p>
        </div>

        <div className={styles.packGrid}>
          {packs.map((pack, index) => (
            <article key={pack.players.map((item) => item.player.id).join("-")} className={index === 0 ? styles.best : ""}>
              <div className={styles.packHead}>
                <div><span>{index === 0 ? "Recommended" : `Option ${index + 1}`}</span><strong>{pack.packScore.toFixed(0)}</strong></div>
                <b>£{pack.totalFee}</b>
              </div>
              <div className={styles.packPlayers}>
                {pack.players.map((item) => (
                  <div key={item.player.id}>
                    <strong>{item.player.name}</strong>
                    <small>{item.player.sportingAvailability ?? "available"} · {item.capacity.remaining ?? "?"} remaining · fit {item.player.fit}</small>
                  </div>
                ))}
              </div>
              <div className={styles.packMetrics}>
                <div><span>Avg fit</span><strong>{pack.avgScore.toFixed(0)}</strong></div>
                <div><span>Opportunity cost</span><strong>{pack.opportunityCost.toFixed(0)}</strong></div>
                <div><span>Sporting availability bonus</span><strong>{pack.sportingAvailabilityBonus.toFixed(0)}</strong></div>
              </div>
              <p>{pack.blockers.length ? `Blocked: ${pack.blockers.join(", ")}` : "Eligible under current contract, date, channel, budget and international-duty assumptions."}</p>
            </article>
          ))}
          {!packs.length ? <div className={styles.noPack}><strong>No eligible pack for this requirement.</strong><p>Reduce player count, change date/channel/budget, or resolve availability and international-duty blockers.</p></div> : null}
        </div>
      </section>
    </section>
  );
}
