import { clubActivations } from "@/lib/data";

function looksLikeOfficialTicketRoute(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = (parsed.pathname + parsed.search).toLowerCase();
    const trustedHost = host.endsWith("londoncitylionesses.com") || host.includes("ticket") || host.includes("stadium");
    const ticketPath = /ticket|buytickets|seatselection|checkout|purchase/.test(path);
    return parsed.protocol === "https:" && trustedHost && ticketPath;
  } catch {
    return false;
  }
}

export function getVerifiedFixtureTicketUrl(fixtureId: string) {
  const observations = clubActivations.observations.filter((item) =>
    item.fixtureId === fixtureId &&
    item.evidenceState === "observed" &&
    item.channel === "ticketing"
  );

  const ticketObservation = observations.find((item) =>
    /ticket|buy/i.test(item.callToAction.en) &&
    looksLikeOfficialTicketRoute(item.sourceUrl)
  );

  if (!ticketObservation) return null;

  return {
    url: ticketObservation.sourceUrl,
    label: ticketObservation.callToAction.en,
    sourceName: ticketObservation.sourceName,
    observedAt: ticketObservation.observedAt
  };
}
