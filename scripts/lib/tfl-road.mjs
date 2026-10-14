// TfL road disruption around the home venue. The TfL Unified API answers anonymous requests
// (lower rate limits); an app key is used when one is configured. AVELA keeps only incidents
// within the radius and marks the material ones: closures and serious or severe disruption.

export const HAYES_LANE = { lat: 51.390984, lon: 0.01771 };
export const ROAD_RADIUS_KM = 15;

function parsePoint(value) {
  const match = typeof value === "string" ? value.match(/\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]|POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i) : null;
  if (!match) return null;
  // TfL points read "[lon,lat]" (or WKT "POINT (lon lat)").
  const lon = Number(match[1] ?? match[3]);
  const lat = Number(match[2] ?? match[4]);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

function distanceKm(a, b) {
  const rad = (value) => value * Math.PI / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isMaterial(item) {
  const text = [item.severity, item.category, item.subCategory, ...(item.streets ?? []).map((street) => street?.closure)].filter(Boolean).join(" ");
  return /full closure|partial closure|closed|severe|serious/i.test(text);
}

function day(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
}

export function parseRoadDisruptions(payload, venue = HAYES_LANE, radiusKm = ROAD_RADIUS_KM) {
  if (!Array.isArray(payload)) throw new Error("TfL payload is not a list of disruptions");
  return payload
    .map((item) => {
      const point = parsePoint(item?.point);
      const distance = point ? distanceKm(venue, point) : null;
      return {
        id: item?.id ?? null,
        location: item?.location ?? null,
        severity: item?.severity ?? null,
        category: item?.category ?? null,
        subCategory: item?.subCategory ?? null,
        startDate: day(item?.startDateTime ?? item?.startDate),
        endDate: day(item?.endDateTime ?? item?.endDate),
        distanceKm: distance === null ? null : Math.round(distance * 10) / 10,
        material: isMaterial(item ?? {})
      };
    })
    .filter((item) => item.id && item.distanceKm !== null && item.distanceKm <= radiusKm)
    .sort((a, b) => Number(b.material) - Number(a.material) || a.distanceKm - b.distanceKm || String(a.id).localeCompare(String(b.id)));
}
