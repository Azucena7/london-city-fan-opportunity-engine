import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { status: "error", reason: "Location is required." },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      q: `${q}, United Kingdom`,
      format: "jsonv2",
      addressdetails: "1",
      limit: "1",
      countrycodes: "gb"
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "LondonCityFanOpportunityLab/1.0 research-prototype"
        },
        next: { revalidate: 86400 }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable", reason: "Geocoder unavailable." },
        { status: 502 }
      );
    }

    const results = await response.json();
    const result = results?.[0];

    if (!result) {
      return NextResponse.json({
        status: "unavailable",
        reason: "Location could not be resolved."
      });
    }

    const lat = Number(result.lat);
    const lon = Number(result.lon);
    const postcode = result.address?.postcode ?? null;

    // Broad Greater London / TfL useful operating envelope.
    const inLondon =
      lat >= 51.25 &&
      lat <= 51.72 &&
      lon >= -0.55 &&
      lon <= 0.35;

    return NextResponse.json({
      status: "resolved",
      query: q,
      displayName: result.display_name,
      lat,
      lon,
      postcode,
      locality:
        result.address?.city ??
        result.address?.town ??
        result.address?.village ??
        result.address?.suburb ??
        q,
      region:
        result.address?.state ??
        result.address?.county ??
        null,
      scope: inLondon ? "london" : "national"
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        reason: error instanceof Error ? error.message : "Geocoding failed."
      },
      { status: 500 }
    );
  }
}
