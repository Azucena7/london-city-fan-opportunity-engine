import { NextRequest, NextResponse } from "next/server";

const DESTINATION_POSTCODE = "BR2 9EF";

function durationToMinutes(value?: string) {
  if (!value) return 0;
  const match = value.match(/(?:(\d+):)?(\d+):(\d+)/);
  if (!match) return 0;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return Math.round(hours * 60 + minutes + seconds / 60);
}

function normalizeRoute(route: any) {
  const parts = route?.route_parts ?? [];
  const walking = parts
    .filter((p: any) => p?.mode === "foot")
    .reduce((sum: number, p: any) => sum + durationToMinutes(p?.duration), 0);

  const transit = parts.filter((p: any) => p?.mode !== "foot");

  return {
    duration: durationToMinutes(route?.duration),
    changes: Math.max(0, transit.length - 1),
    walkingMinutes: walking,
    startDateTime: parts?.[0]?.departure_datetime ?? null,
    arrivalDateTime: parts?.[parts.length - 1]?.arrival_datetime ?? null,
    disruptions: [],
    legs: parts.map((p: any) => ({
      mode:
        p?.mode === "foot"
          ? "Walking"
          : p?.mode === "train"
          ? "Train"
          : p?.mode === "bus"
          ? "Bus"
          : p?.mode ?? "Travel",
      duration: durationToMinutes(p?.duration),
      departurePoint: p?.from_point_name ?? "Start",
      arrivalPoint: p?.to_point_name ?? "Next",
      instruction:
        p?.steps?.[0]?.instruction?.text ??
        null,
      line: p?.line_name || null
    }))
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode")?.trim();
  const date = searchParams.get("date")?.trim();
  const time = searchParams.get("time")?.trim();

  if (!postcode) {
    return NextResponse.json(
      {
        status: "needs_postcode",
        reason:
          "National journey planning currently requires a resolvable UK postcode."
      },
      { status: 400 }
    );
  }

  const appId = process.env.TRANSPORTAPI_APP_ID;
  const appKey = process.env.TRANSPORTAPI_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json({
      status: "needs_credentials",
      reason:
        "National origin recognised. Add TransportAPI credentials in Vercel to activate UK-wide multimodal routing."
    });
  }

  const from = `postcode:${postcode.replace(/\s+/g, "")}`;
  const to = `postcode:${DESTINATION_POSTCODE.replace(/\s+/g, "")}`;

  const params = new URLSearchParams({
    service: "silverrail",
    app_id: appId,
    app_key: appKey
  });

  if (date) params.set("date", date);
  if (time) params.set("time", time);

  try {
    const endpoint =
      `https://transportapi.com/v3/uk/public/journey/from/` +
      `${encodeURIComponent(from)}/to/${encodeURIComponent(to)}.json?` +
      params.toString();

    const response = await fetch(endpoint, {
      next: { revalidate: 120 }
    });

    const raw = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "unavailable",
          reason:
            raw?.error ??
            raw?.message ??
            "National journey planner could not return a route."
        },
        { status: response.status }
      );
    }

    const journeys = (raw?.routes ?? []).slice(0, 3).map(normalizeRoute);

    return NextResponse.json({
      status: journeys.length ? "live" : "unavailable",
      source: "TransportAPI",
      destination: "Hayes Lane, Bromley",
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
            : "National journey planner unavailable."
      },
      { status: 500 }
    );
  }
}
