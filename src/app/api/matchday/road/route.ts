import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HAYES_LANE = { lat: 51.390984, lon: 0.017710 };
const MATERIAL_RADIUS_KM = 15;

type TflStreet = { closure?: string | null; name?: string | null };
type TflDisruption = {
  id?: string;
  point?: string | null;
  severity?: string | null;
  category?: string | null;
  subCategory?: string | null;
  comments?: string | null;
  currentUpdate?: string | null;
  currentUpdateDateTime?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  streets?: TflStreet[];
};

function parsePoint(value?: string | null) {
  if (!value) return null;
  const match = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!match) return null;
  return { lon: Number(match[1]), lat: Number(match[2]) };
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat/2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon/2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function isMaterial(item: TflDisruption) {
  const text = [item.severity, item.category, item.subCategory, item.comments, item.currentUpdate, ...(item.streets ?? []).map((street) => street.closure)]
    .filter(Boolean).join(" ");
  return /full closure|partial closure|closed|severe|serious|high/i.test(text);
}

export async function GET() {
  const appId = process.env.TFL_APP_ID;
  const appKey = process.env.TFL_APP_KEY;
  if (!appId || !appKey) {
    return NextResponse.json({
      state: "not-configured",
      provider: "Transport for London Unified API",
      checkedAt: new Date().toISOString(),
      incidents: []
    }, { headers: { "cache-control": "no-store" } });
  }

  try {
    const url = new URL("https://api.tfl.gov.uk/Road/all/Disruption");
    url.searchParams.set("stripContent", "true");
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);

    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return NextResponse.json({
        state: "degraded",
        provider: "Transport for London Unified API",
        checkedAt: new Date().toISOString(),
        reason: "TfL returned " + response.status,
        incidents: []
      }, { status: 502, headers: { "cache-control": "no-store" } });
    }

    const raw = await response.json() as TflDisruption[];
    const incidents = raw.map((item) => {
      const point = parsePoint(item.point);
      const distance = point ? distanceKm(HAYES_LANE, point) : null;
      return {
        id: item.id ?? null,
        severity: item.severity ?? null,
        category: item.category ?? null,
        subCategory: item.subCategory ?? null,
        location: item.location ?? null,
        summary: item.currentUpdate ?? item.comments ?? null,
        updatedAt: item.currentUpdateDateTime ?? null,
        startDate: item.startDate ?? null,
        endDate: item.endDate ?? null,
        distanceKm: distance === null ? null : Math.round(distance * 10) / 10,
        material: isMaterial(item)
      };
    }).filter((item) => item.distanceKm !== null && item.distanceKm <= MATERIAL_RADIUS_KM)
      .sort((a,b) => Number(b.material) - Number(a.material) || (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    return NextResponse.json({
      state: "live",
      provider: "Transport for London Unified API",
      checkedAt: new Date().toISOString(),
      radiusKm: MATERIAL_RADIUS_KM,
      materialIncidentCount: incidents.filter((item) => item.material).length,
      incidents
    }, { headers: { "cache-control": "public, max-age=120, stale-while-revalidate=300" } });
  } catch (error) {
    return NextResponse.json({
      state: "degraded",
      provider: "Transport for London Unified API",
      checkedAt: new Date().toISOString(),
      reason: error instanceof Error ? error.message : "TfL request failed",
      incidents: []
    }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
