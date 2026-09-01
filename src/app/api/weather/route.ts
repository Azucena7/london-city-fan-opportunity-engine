import { NextResponse } from "next/server";

const HAYES_LANE = {
  latitude: 51.390984,
  longitude: 0.017710
};

export async function GET() {
  try {
    const params = new URLSearchParams({
      latitude: String(HAYES_LANE.latitude),
      longitude: String(HAYES_LANE.longitude),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max"
      ].join(","),
      timezone: "Europe/London",
      forecast_days: "7"
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { next: { revalidate: 1800 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable", reason: `Weather API ${response.status}` },
        { status: 502 }
      );
    }

    const raw = await response.json();

    return NextResponse.json({
      status: "live",
      venue: "Hayes Lane",
      coordinates: HAYES_LANE,
      timezone: raw.timezone,
      generated_at: new Date().toISOString(),
      daily: raw.daily
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        reason: error instanceof Error ? error.message : "Unknown weather error"
      },
      { status: 500 }
    );
  }
}
