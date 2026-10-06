import { NextResponse } from "next/server";
import { calendar, mobilityPartnership } from "@/lib/data";
import { mobilityProviderReadiness, summariseMobilityProviderReadiness } from "@/lib/mobilityProviderReadiness";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;
  const fixture = calendar.find((item) => item.id === fixtureId && item.homeAway === "home");
  if (!fixture) {
    return NextResponse.json({ state: "not-found" }, { status: 404, headers: { "cache-control": "no-store" } });
  }

  const pilot = mobilityPartnership.pilots.find((item) => item.fixtureId === fixtureId) ?? null;
  const corridors = [...mobilityPartnership.corridors]
    .sort((a,b) => (b.travelFriction + b.territoryOpportunity) - (a.travelFriction + a.territoryOpportunity));

  return NextResponse.json({
    state: "ready",
    fixture: {
      id: fixture.id,
      date: fixture.date,
      kickoff: fixture.kickoff ?? null,
      opponent: fixture.opponent,
      competition: fixture.competition,
      venue: fixture.venue
    },
    providerSummary: summariseMobilityProviderReadiness(),
    providers: mobilityProviderReadiness,
    pilot: pilot ? {
      label: pilot.label.en,
      purpose: pilot.purpose.en,
      appealScore: pilot.appealScore
    } : null,
    corridors: corridors.map((corridor) => ({
      id: corridor.id,
      label: corridor.label.en,
      origins: corridor.representativeOrigins,
      evidenceState: corridor.evidenceState,
      travelFriction: corridor.travelFriction,
      territoryOpportunity: corridor.territoryOpportunity,
      note: corridor.note.en
    })),
    guardrails: {
      liveRouting: "Never present modelled travel friction as a live route.",
      privacy: "No individual address, postcode or movement is exposed.",
      fallback: "Use official club and transport information whenever a live provider is unavailable."
    }
  }, {
    headers: {
      "cache-control": "public, max-age=60, stale-while-revalidate=300"
    }
  });
}
