import { NextResponse } from "next/server";
import measurement from "../../../../../data/live/experiment-measurement.json";

export const dynamic = "force-dynamic";

export function GET() {
  const mode = process.env.MEASUREMENT_MODE === "production" ? "production" : "test";
  const ingestConfigured = Boolean(process.env.MEASUREMENT_INGEST_URL && process.env.MEASUREMENT_WRITE_KEY);
  const summaryConfigured = Boolean(mode === "production" && process.env.MEASUREMENT_SUMMARY_URL && process.env.MEASUREMENT_WRITE_KEY);
  return NextResponse.json({
    mode,
    ingestConfigured,
    summaryConfigured,
    maximumRetentionDays: measurement.provider.maximumRetentionDays,
    minimumAggregateCohort: measurement.minimumAggregateCohort
  }, { headers: { "cache-control": "no-store" } });
}
