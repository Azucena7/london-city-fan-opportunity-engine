"use client";

import { useMemo, useState } from "react";
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
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);
  const [manualContext, setManualContext] = useState("");

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
  const activeIds = manualContext === contextKey ? manualSelectedIds : recommendedIds;
  const activePlayers = players.filter((player) => activeIds.includes(player.id));
  const activeEvaluation = evaluatePlayerPack(
    activePlayers,
    request,
    demoAppearances,
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
      : manualContext === contextKey
        ? "Custom pack"
        : "Recommended";
  const momentumRanking = players
    .map((player) => ({ player, momentum: playerMomentumScore(player.id, demoPlayerMomentum) }))
    .sort((a,b) => (b.momentum.score ?? -1) - (a.momentum.score ?? -1));

  function choosePack(ids: string[]) {
    setManualSelectedIds(ids);
    setManualContext(contextKey);
  }

  function togglePlayer(playerId: string) {
    const current = manualContext === contextKey ? manualSelectedIds : recommendedIds;
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

      <section id="campaign-context" className={styles.campaignContext} aria-label="Commercial campaign context">
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

      <nav className={styles.decisionRail} aria-label="Player asset planning sections">
        <div className={styles.railState} aria-live="polite">
          <span>Live pack</span>
          <strong>{livePackState}</strong>
          <small>{activeIds.length}/{count} selected · {selectedCampaign.name}</small>
        </div>
        <div className={styles.railMetrics}>
          <div><span>Score</span><strong>{selectionComplete ? activeEvaluation.packScore.toFixed(0) : "—"}</strong></div>
          <div><span>Cost</span><strong>£{activeEvaluation.totalFee}</strong></div>
          <div><span>Opp. cost</span><strong>{activeEvaluation.opportunityCost.toFixed(0)}</strong></div>
          <div><span>Blockers</span><strong>{selectionComplete ? activeEvaluation.blockers.length : "—"}</strong></div>
        </div>
        <div className={styles.railLinks}>
          <a href="#campaign-context">Campaign</a>
          <a href="#availability">Availability</a>
          <a href="#player-status">Players</a>
          <a href="#momentum">Momentum</a>
          <a href="#packs">Packs</a>
          <a href="#scenario">Scenario</a>
        </div>
      </nav>

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

      <section id="momentum" className={styles.momentum}>
        <div className={styles.sectionHead}>
          <div><span>Momentum Monitor</span><h2>Use current pull while it is useful — without confusing it with long-term value.</h2></div>
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

      <section id="packs" className={styles.packs}>
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
                <div><span>Fit</span><strong>{pack.avgScore.toFixed(0)}</strong></div>
                <div><span>Momentum</span><strong>{pack.momentumScore?.toFixed(0) ?? "—"}</strong></div>
                <div><span>Opp. cost</span><strong>{pack.opportunityCost.toFixed(0)}</strong></div>
              </div>
              <button className={styles.usePack} type="button" onClick={() => choosePack(pack.players.map((item) => item.player.id))}>{index === 0 ? "Reset to recommendation" : "Use this pack"}</button>
              <p>{pack.blockers.length ? `Blocked: ${pack.blockers.join(", ")}` : "Eligible under current contract, date, channel, budget and international-duty assumptions."}</p>
            </article>
          ))}
          {!packs.length ? <div className={styles.noPack}><strong>No eligible pack for this requirement.</strong><p>Reduce player count, change date/channel/budget, or resolve availability and international-duty blockers.</p></div> : null}
        </div>
      </section>

      <section id="scenario" className={styles.simulator} aria-label="Player pack scenario simulator">
        <div className={styles.simulatorHead}>
          <div>
            <span>Live scenario</span>
            <h2>{selectionComplete ? "Your current pack" : `Select ${count - activeIds.length} more player${count - activeIds.length === 1 ? "" : "s"}`}</h2>
            <p>Every add/remove recalculates the recommendation economics and flags blockers immediately.</p>
          </div>
          <button type="button" onClick={() => { setManualSelectedIds([]); setManualContext(""); }}>Reset recommendation</button>
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
      </section>
    </section>
  );
}
