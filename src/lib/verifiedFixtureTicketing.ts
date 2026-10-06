import { clubActivations } from "@/lib/data";

export function getVerifiedFixtureTicketUrl(fixtureId: string) {
  const observations = clubActivations.observations.filter((item) => item.fixtureId === fixtureId && item.evidenceState === "observed");
  const ticketObservation = observations.find((item) =>
    /ticket/i.test(item.callToAction.en) &&
    /^https?:\/\//.test(item.sourceUrl)
  );

  if (!ticketObservation) return null;

  return {
    url: ticketObservation.sourceUrl,
    label: ticketObservation.callToAction.en,
    sourceName: ticketObservation.sourceName,
    observedAt: ticketObservation.observedAt
  };
}
