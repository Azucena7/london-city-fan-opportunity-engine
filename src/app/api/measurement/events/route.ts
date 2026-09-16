import { NextRequest, NextResponse } from "next/server";
import measurement from "../../../../../data/live/experiment-measurement.json";
import experience from "../../../../../data/live/experience-demand-validation.json";
import mobility from "../../../../../data/live/mobility-partnership.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Primitive = string | number | boolean;
type Envelope = {
  schema_version: string;
  event_id: string;
  event_name: string;
  occurred_at: string;
  locale: string;
  fixture_id: string | null;
  experiment_id: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  properties: Record<string, Primitive>;
};

const commonFields = new Set(measurement.commonFields);
const eventContracts = new Map(measurement.events.map((item) => [item.name, item]));
const fixtureIds = new Set(experience.fixtures.map((item) => item.id));
const experiments = new Map(measurement.experiments.map((item) => [item.id, item.fixtureId]));
const conceptIds = new Set(experience.concepts.map((item) => item.id));
const origins = new Map(experience.origins.map((item) => [item.id, item.market]));
const partySizes = new Set(experience.partySizes.map((item) => item.id));
const priceBands = new Set(experience.concepts.flatMap((item) => item.priceBands.map((band) => band.id)));
const corridorIds = new Set(mobility.corridors.map((item) => item.id));
const vehicleSeats = new Set(mobility.simulator.capacities.map((item) => item.seats));
const categoricalBands = {
  rider_band: new Set(["<10", "10-19", "20-32", "33-48", "49+"]),
  fare_band: new Set(["<10", "10-19", "20-29", "30-39", "40+"]),
  occupancy_band: new Set(["<25", "25-49", "50-74", "75-99", "100+"]),
  opportunity_score_band: new Set(["<50", "50-64", "65-79", "80-89", "90+"])
};

function invalid(message: string) {
  return NextResponse.json({ accepted: false, state: "rejected", message }, { status: 400, headers: { "cache-control": "no-store" } });
}

function safeString(value: unknown, max = 160) {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function validPropertyValues(eventName: string, properties: Record<string, Primitive>) {
  if (eventName === "experience_concept_selected") return conceptIds.has(properties.concept_id as string);
  if (eventName === "experience_validation_complete") {
    return conceptIds.has(properties.concept_id as string)
      && origins.get(properties.origin_id as string) === properties.origin_market
      && partySizes.has(properties.party_size as string)
      && priceBands.has(properties.price_band as string);
  }
  if (eventName === "mobility_scenario_evaluated") {
    return corridorIds.has(properties.corridor_id as string)
      && vehicleSeats.has(properties.vehicle_seats as number)
      && categoricalBands.rider_band.has(properties.rider_band as string)
      && categoricalBands.fare_band.has(properties.fare_band as string)
      && categoricalBands.occupancy_band.has(properties.occupancy_band as string)
      && categoricalBands.opportunity_score_band.has(properties.opportunity_score_band as string);
  }
  return false;
}

function validate(body: unknown): body is Envelope {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const record = body as Record<string, unknown>;
  if (Object.keys(record).some((key) => !commonFields.has(key))) return false;
  if (record.schema_version !== "1.0") return false;
  if (!safeString(record.event_id, 80) || !/^[0-9a-f-]{36}$/i.test(record.event_id as string)) return false;
  if (!safeString(record.event_name, 80) || !eventContracts.has(record.event_name as never)) return false;
  if (!safeString(record.occurred_at, 40) || Number.isNaN(Date.parse(record.occurred_at as string))) return false;
  if (record.locale !== "en" && record.locale !== "es") return false;
  if (record.fixture_id !== null && (!safeString(record.fixture_id, 80) || !fixtureIds.has(record.fixture_id as string))) return false;
  if (record.experiment_id !== null) {
    if (!safeString(record.experiment_id, 80) || !experiments.has(record.experiment_id as string)) return false;
    if (experiments.get(record.experiment_id as string) !== record.fixture_id) return false;
  }
  for (const field of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) {
    if (!safeString(record[field], 80) || !/^[a-zA-Z0-9._~-]+$/.test(record[field] as string)) return false;
  }
  if (!record.properties || typeof record.properties !== "object" || Array.isArray(record.properties)) return false;
  const contract = eventContracts.get(record.event_name as never);
  const allowlist = new Set(contract?.allowedProperties ?? []);
  for (const key of contract?.requiredProperties ?? []) {
    if (!(key in (record.properties as Record<string, unknown>))) return false;
  }
  for (const [key, value] of Object.entries(record.properties as Record<string, unknown>)) {
    if (!allowlist.has(key) || typeof value !== contract?.propertyTypes[key as keyof typeof contract.propertyTypes]) return false;
    if (typeof value === "string" && (value.length === 0 || value.length > 160)) return false;
    if (typeof value === "number" && !Number.isFinite(value)) return false;
  }
  return validPropertyValues(record.event_name as string, record.properties as Record<string, Primitive>);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 8192) return invalid("Payload exceeds 8 KB");

  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 8192) return invalid("Payload exceeds 8 KB");
    body = JSON.parse(raw);
  } catch {
    return invalid("Invalid JSON");
  }
  if (!validate(body)) return invalid("Event does not match the measurement allowlist");

  const endpoint = process.env.MEASUREMENT_INGEST_URL;
  const writeKey = process.env.MEASUREMENT_WRITE_KEY;
  const mode = process.env.MEASUREMENT_MODE === "production" ? "production" : "test";
  if (!endpoint || !writeKey) {
    return NextResponse.json({ accepted: false, state: "provider-not-configured", mode }, { status: 202, headers: { "cache-control": "no-store" } });
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return NextResponse.json({ accepted: false, state: "provider-invalid" }, { status: 503 });
  }
  if (url.protocol !== "https:") return NextResponse.json({ accepted: false, state: "provider-invalid" }, { status: 503 });

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "authorization": `Bearer ${writeKey}`, "content-type": "application/json" },
      body: JSON.stringify({ ...body, measurement_mode: mode }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (!upstream.ok) return NextResponse.json({ accepted: false, state: "delivery-failed" }, { status: 502 });
    return NextResponse.json({ accepted: true, state: "delivered", mode }, { status: 202, headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ accepted: false, state: "delivery-failed" }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
