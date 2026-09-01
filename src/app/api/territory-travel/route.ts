import { NextRequest, NextResponse } from "next/server";
import { territoryTravelSeeds } from "@/lib/territoryTravel";

const HAYES_LANE = "51.390984,0.017710";

function compactTime(value?: string | null) {
  if (!value) return undefined;
  return value.replace(":", "").slice(0, 4);
}

function compactDate(value?: string | null) {
  if (!value) return undefined;
  return value.replaceAll("-", "");
}

function summarizeJourney(journey: any) {
  const legs = journey?.legs ?? [];

  const walkingMinutes = legs
    .filter((l: any) => String(l?.mode?.id ?? "").toLowerCase() === "walking")
    .reduce((sum: number, l: any) => sum + Number(l?.duration ?? 0), 0);

  const transitLegs = legs.filter(
    (l: any) => String(l?.mode?.id ?? "").toLowerCase() !== "walking"
  );

  let disruptions = 0;
  for (const leg of legs) {
    disruptions += Array.isArray(leg?.disruptions) ? leg.disruptions.length : 0;
  }

  return {
    duration: Number(journey?.duration ?? 0),
    changes: Math.max(0, transitLegs.length - 1),
    walkingMinutes,
    disruptions
  };
}

async function getJourney(
  origin: string,
  opts?: {
    date?: string;
    time?: string;
    arriving?: boolean;
  }
) {
  const query = new URLSearchParams({
    journeyPreference: "LeastTime",
    walkingSpeed: "Average"
  });

  if (opts?.date) query.set("date", compactDate(opts.date) ?? "");
  if (opts?.time) query.set("time", compactTime(opts.time) ?? "");
  if (opts?.date || opts?.time) {
    query.set("timeIs", opts?.arriving ? "Arriving" : "Departing");
  }

  const appKey = process.env.TFL_API_KEY;
  if (appKey) query.set("app_key", appKey);

  const endpoint =
    `https://api.tfl.gov.uk/Journey/JourneyResults/` +
    `${encodeURIComponent(origin)}/to/${encodeURIComponent(HAYES_LANE)}` +
    `?${query.toString()}`;

  const response = await fetch(endpoint, { next: { revalidate: 120 } });

  if (!response.ok) {
    return null;
  }

  const raw = await response.json();
  const journey = raw?.journeys?.[0];

  return journey ? summarizeJourney(journey) : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const territoryId = searchParams.get("territory");
  const date = searchParams.get("date") ?? undefined;
  const arrival = searchParams.get("arrival") ?? undefined;

  if (!territoryId) {
    return NextResponse.json(
      { status: "error", reason: "Territory is required." },
      { status: 400 }
    );
  }

  const seed = territoryTravelSeeds.find(
    (item) => item.territory_id === territoryId
  );

  if (!seed) {
    return NextResponse.json(
      { status: "error", reason: "Unknown territory." },
      { status: 404 }
    );
  }

  const results = await Promise.all(
    seed.origins.map(async (origin) => {
      const [normal, matchday] = await Promise.all([
        getJourney(origin.query),
        date && arrival
          ? getJourney(origin.query, {
              date,
              time: arrival,
              arriving: true
            })
          : Promise.resolve(null)
      ]);

      return {
        origin,
        normal,
        matchday
      };
    })
  );

  return NextResponse.json({
    status: "live",
    source: "Transport for London Unified API",
    territory: seed,
    fixture: {
      date: date ?? null,
      targetArrival: arrival ?? null
    },
    generated_at: new Date().toISOString(),
    results
  });
}
