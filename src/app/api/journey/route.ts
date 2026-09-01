import { NextRequest, NextResponse } from "next/server";

const HAYES_LANE = "51.390984,0.017710";

function compactTime(value?: string | null) {
  if (!value) return undefined;
  return value.replace(":", "").slice(0, 4);
}

function compactDate(value?: string | null) {
  if (!value) return undefined;
  return value.replaceAll("-", "");
}

function disruptionText(journey: any) {
  const messages: string[] = [];

  for (const leg of journey?.legs ?? []) {
    for (const d of leg?.disruptions ?? []) {
      const text =
        d?.description ??
        d?.summary ??
        d?.additionalInfo ??
        d?.categoryDescription;

      if (text && !messages.includes(text)) messages.push(text);
    }
  }

  return messages.slice(0, 4);
}

function summarizeJourney(journey: any) {
  const legs = journey?.legs ?? [];

  const walkingMinutes = legs
    .filter((l: any) => String(l?.mode?.id ?? "").toLowerCase() === "walking")
    .reduce((sum: number, l: any) => sum + Number(l?.duration ?? 0), 0);

  const transitLegs = legs.filter(
    (l: any) => String(l?.mode?.id ?? "").toLowerCase() !== "walking"
  );

  return {
    duration: Number(journey?.duration ?? 0),
    startDateTime: journey?.startDateTime,
    arrivalDateTime: journey?.arrivalDateTime,
    changes: Math.max(0, transitLegs.length - 1),
    walkingMinutes,
    disruptions: disruptionText(journey),
    legs: legs.map((l: any) => ({
      mode: l?.mode?.name ?? l?.mode?.id ?? "Travel",
      duration: Number(l?.duration ?? 0),
      departurePoint: l?.departurePoint?.commonName,
      arrivalPoint: l?.arrivalPoint?.commonName,
      instruction:
        l?.instruction?.summary ??
        l?.instruction?.detailed ??
        l?.routeOptions?.[0]?.name ??
        null,
      line:
        l?.routeOptions?.[0]?.name ??
        l?.routeOptions?.[0]?.directions?.[0] ??
        null
    }))
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const from = searchParams.get("from")?.trim();
  const date = compactDate(searchParams.get("date"));
  const time = compactTime(searchParams.get("time"));
  const requestedTimeIs = searchParams.get("timeIs");

  const timeIs =
    requestedTimeIs === "Arriving" || requestedTimeIs === "Departing"
      ? requestedTimeIs
      : "Departing";

  if (!from) {
    return NextResponse.json(
      { status: "error", reason: "Origin is required." },
      { status: 400 }
    );
  }

  try {
    const query = new URLSearchParams({
      journeyPreference: "LeastTime",
      walkingSpeed: "Average"
    });

    if (date) query.set("date", date);
    if (time) query.set("time", time);

    if (date || time) {
      query.set("timeIs", timeIs);
    }

    const appKey = process.env.TFL_API_KEY;
    if (appKey) query.set("app_key", appKey);

    const endpoint =
      `https://api.tfl.gov.uk/Journey/JourneyResults/` +
      `${encodeURIComponent(from)}/to/${encodeURIComponent(HAYES_LANE)}` +
      `?${query.toString()}`;

    const response = await fetch(endpoint, {
      next: { revalidate: 120 }
    });

    const raw = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "unavailable",
          reason:
            raw?.message ??
            raw?.exceptionType ??
            "TfL could not resolve this journey."
        },
        { status: response.status }
      );
    }

    const journeys = (raw?.journeys ?? []).slice(0, 3).map(summarizeJourney);

    return NextResponse.json({
      status: journeys.length ? "live" : "unavailable",
      source: "Transport for London Unified API",
      destination: "Hayes Lane",
      queryMode: timeIs,
      generated_at: new Date().toISOString(),
      journeys
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        reason:
          error instanceof Error
            ? error.message
            : "Journey service unavailable."
      },
      { status: 500 }
    );
  }
}
