import { NextResponse } from "next/server";
import measurement from "../../../../../data/live/experiment-measurement.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Cohort = typeof measurement.cohorts[number];
const fixtureIds = new Set(measurement.experiments.map((item) => item.fixtureId));

function emptySummary(state: "provider-not-configured" | "test-mode" | "source-unavailable") {
  return NextResponse.json({ state, cohorts: measurement.cohorts }, { headers: { "cache-control": "no-store" } });
}

function validCohorts(value: unknown): value is Cohort[] {
  if (!Array.isArray(value) || value.length !== measurement.experiments.length) return false;
  const seen = new Set<string>();
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const cohort = item as Record<string, unknown>;
    if (!fixtureIds.has(cohort.fixtureId as string)) return false;
    if (seen.has(cohort.fixtureId as string)) return false;
    seen.add(cohort.fixtureId as string);
    for (const key of ["sampleSize", "transportInterestCount", "mobilityScenarioCount"] as const) {
      if (!Number.isInteger(cohort[key]) || (cohort[key] as number) < 0) return false;
    }
    if ((cohort.transportInterestCount as number) > (cohort.sampleSize as number) || (cohort.mobilityScenarioCount as number) > (cohort.sampleSize as number)) return false;
    const expectedState = (cohort.sampleSize as number) >= measurement.minimumAggregateCohort ? "threshold-met" : "insufficient-sample";
    return cohort.state === expectedState;
  });
}

export async function GET() {
  const mode = process.env.MEASUREMENT_MODE === "production" ? "production" : "test";
  if (mode !== "production") return emptySummary("test-mode");
  const endpoint = process.env.MEASUREMENT_SUMMARY_URL;
  const writeKey = process.env.MEASUREMENT_WRITE_KEY;
  if (!endpoint || !writeKey) return emptySummary("provider-not-configured");

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return emptySummary("source-unavailable");
  }
  if (url.protocol !== "https:") return emptySummary("source-unavailable");

  try {
    const response = await fetch(url, {
      headers: { "authorization": `Bearer ${writeKey}`, "accept": "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (!response.ok) return emptySummary("source-unavailable");
    const result = await response.json() as { cohorts?: unknown };
    if (!validCohorts(result.cohorts)) return emptySummary("source-unavailable");
    return NextResponse.json({ state: "measured", cohorts: result.cohorts }, { headers: { "cache-control": "no-store" } });
  } catch {
    return emptySummary("source-unavailable");
  }
}
