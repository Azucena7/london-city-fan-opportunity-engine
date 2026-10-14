import { readFile, writeFile } from "node:fs/promises";
import { HAYES_LANE, ROAD_RADIUS_KM, parseRoadDisruptions } from "./lib/tfl-road.mjs";

const ROAD_PATH = new URL("../data/live/tfl-road.json", import.meta.url);
const SOURCE_HEALTH_PATH = new URL("../data/live/source-health.json", import.meta.url);
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

async function readJson(url, fallback) {
  try { return JSON.parse(await readFile(url, "utf8")); } catch { return fallback; }
}

async function main() {
  const now = new Date().toISOString();
  const [stored, health] = await Promise.all([
    readJson(ROAD_PATH, null),
    readFile(SOURCE_HEALTH_PATH, "utf8").then(JSON.parse)
  ]);

  const url = new URL("https://api.tfl.gov.uk/Road/all/Disruption");
  url.searchParams.set("stripContent", "true");
  if (process.env.TFL_APP_KEY) url.searchParams.set("app_key", process.env.TFL_APP_KEY);

  let incidents = null;
  let failure = null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`TfL returned ${response.status}`);
    incidents = parseRoadDisruptions(await response.json());
  } catch (error) {
    failure = error?.message ?? String(error);
  }

  const next = {
    version: now.slice(0, 10),
    source: { name: "Transport for London Unified API · Road disruption", url: "https://api.tfl.gov.uk/Road/all/Disruption" },
    venue: { name: "Hayes Lane, Bromley", ...HAYES_LANE },
    radiusKm: ROAD_RADIUS_KM,
    checkedAt: now,
    lastSuccessfulAt: incidents ? now : stored?.lastSuccessfulAt ?? null,
    incidents: incidents ?? stored?.incidents ?? []
  };
  const nextHealth = {
    ...health,
    sources: health.sources.map((source) => source.id !== "tfl-road" ? source : {
      ...source,
      access: "public",
      state: incidents ? "operational" : source.lastSuccessfulAt ? "degraded" : "blocked",
      cadence: "daily",
      lastAttemptAt: now,
      lastSuccessfulAt: incidents ? now : source.lastSuccessfulAt,
      ownerAction: {
        en: "Runs with the daily data refresh from the TfL Unified API (anonymous access; a TFL_APP_KEY secret raises the rate limit).",
        es: "Se ejecuta con la actualización diaria desde la API Unified de TfL (acceso anónimo; un secreto TFL_APP_KEY amplía el límite)."
      },
      note: {
        en: "Daily snapshot of TfL road disruption within 15 km of Hayes Lane. Works not yet published by TfL cannot appear; rail disruption is a separate source.",
        es: "Instantánea diaria de incidencias viarias de TfL a menos de 15 km de Hayes Lane. Las obras que TfL aún no ha publicado no pueden aparecer; el tren es otra fuente."
      }
    })
  };

  if (DRY_RUN) {
    console.log(JSON.stringify({ incidents: incidents?.length ?? null, material: incidents?.filter((item) => item.material).length ?? null, failure }, null, 2));
    return;
  }
  await Promise.all([
    writeFile(ROAD_PATH, `${JSON.stringify(next, null, 2)}\n`),
    writeFile(SOURCE_HEALTH_PATH, `${JSON.stringify(nextHealth, null, 2)}\n`)
  ]);
  console.log(failure
    ? `TfL road: refresh failed (${failure}); kept ${next.incidents.length} stored.`
    : `TfL road: ${incidents.length} incidents within ${ROAD_RADIUS_KM} km, ${incidents.filter((item) => item.material).length} material.`);
  if (failure) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
