import { calendar, campaignPlans, liveSignals } from "@/lib/data";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import {
  describeSignalEffect,
  isRecentSignal,
  offRadarEffect,
  strongestEffect,
  type RadarRead,
  type SignalEffect,
  type SignalLogEntry
} from "@/lib/signalLog";

function fixtureLabel(fixtureId: string) {
  const fixture = calendar.find((item) => item.id === fixtureId);
  if (!fixture) return fixtureId;
  const date = new Date(fixture.date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return (fixture.homeAway === "home" ? "v " : "@ ") + fixture.opponent + " · " + date;
}

function read(fixtureId: string, excludeSignalIds?: ReadonlySet<string>): RadarRead | null {
  const options = excludeSignalIds ? { excludeSignalIds } : {};
  const radar = buildOpportunityRadar([fixtureId], null, options)[0];
  const opportunity = getCurrentProductOpportunity(fixtureId, options);
  if (!radar || !opportunity) return null;
  return { radarState: radar.radarState, confidence: opportunity.confidence.label, rank: radar.rank };
}

/**
 * Every sourced signal, newest first, with what it changed on the Radar. `radarFixtureIds`
 * are the fixtures the Radar reads today (the decision queue's upcoming home fixtures).
 */
export function getCurrentSignalLog(radarFixtureIds: string[], today: string): SignalLogEntry[] {
  const onRadar = new Set(radarFixtureIds);
  const baseline = new Map(radarFixtureIds.map((id) => [id, read(id)]));
  // The same attachment the engine uses: the signal's own fixture, or a campaign that cites it.
  const declaredBy = new Map<string, string[]>();
  for (const campaign of campaignPlans.campaigns) {
    for (const id of [...(campaign.triggerSignalIds ?? []), ...(campaign.contextSignalIds ?? [])]) {
      declaredBy.set(id, [...(declaredBy.get(id) ?? []), campaign.fixtureId]);
    }
  }

  return [...liveSignals]
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
    .map((signal) => {
      const fixtureIds = Array.from(new Set([signal.fixtureId, ...(declaredBy.get(signal.id) ?? [])].filter((id): id is string => Boolean(id))));
      const effects: SignalEffect[] = [];
      for (const fixtureId of fixtureIds) {
        const label = fixtureLabel(fixtureId);
        if (onRadar.has(fixtureId)) {
          const withSignal = baseline.get(fixtureId);
          const withoutSignal = read(fixtureId, new Set([signal.id]));
          if (withSignal && withoutSignal) effects.push(describeSignalEffect(fixtureId, label, withSignal, withoutSignal, signal.materiality));
          continue;
        }
        const fixture = calendar.find((item) => item.id === fixtureId);
        if (!fixture) effects.push(offRadarEffect("unknown-fixture"));
        else if (fixture.homeAway !== "home") effects.push(offRadarEffect("away", label));
        else if (fixture.date < today || fixture.status === "final") effects.push(offRadarEffect("played", label));
        else effects.push(offRadarEffect("beyond-horizon", label));
      }
      if (!effects.length) effects.push(offRadarEffect("no-fixture"));

      return {
        id: signal.id,
        observedAt: signal.observedAt,
        title: signal.title.en,
        category: signal.category,
        state: signal.state,
        direction: signal.direction,
        materiality: signal.materiality,
        sourceName: signal.sourceName,
        sourceUrl: signal.sourceUrl,
        isNew: isRecentSignal(signal.observedAt, today),
        fixtureLabels: fixtureIds.map(fixtureLabel),
        effects,
        strongest: strongestEffect(effects)
      };
    });
}
