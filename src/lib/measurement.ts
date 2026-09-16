export type MeasurementEventName =
  | "experience_concept_selected"
  | "experience_validation_complete"
  | "mobility_scenario_evaluated";

export type MeasurementDeliveryState =
  | "delivered"
  | "provider-not-configured"
  | "rejected"
  | "delivery-failed";

type EventProperties = Record<string, string | number | boolean>;

export type MeasurementResult = {
  accepted: boolean;
  state: MeasurementDeliveryState;
};

function campaignContext() {
  const params = new URLSearchParams(window.location.search);
  const safe = (value: string | null, fallback: string) => value && /^[a-zA-Z0-9._~-]{1,80}$/.test(value) ? value : fallback;
  return {
    utm_source: safe(params.get("utm_source"), "direct"),
    utm_medium: safe(params.get("utm_medium"), "prototype"),
    utm_campaign: safe(params.get("utm_campaign"), "unassigned"),
    utm_content: safe(params.get("utm_content"), "unassigned")
  };
}

export async function emitMeasurementEvent({
  eventName,
  properties,
  fixtureId,
  experimentId,
  locale
}: {
  eventName: MeasurementEventName;
  properties: EventProperties;
  fixtureId?: string;
  experimentId?: string;
  locale: "en" | "es";
}): Promise<MeasurementResult> {
  const envelope = {
    schema_version: "1.0",
    event_id: crypto.randomUUID(),
    event_name: eventName,
    occurred_at: new Date().toISOString(),
    locale,
    fixture_id: fixtureId ?? null,
    experiment_id: experimentId ?? null,
    ...campaignContext(),
    properties
  };

  const analyticsWindow = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  analyticsWindow.dataLayer?.push(envelope);
  window.dispatchEvent(new CustomEvent(eventName, { detail: envelope }));

  try {
    const response = await fetch("/api/measurement/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(envelope),
      keepalive: true
    });
    const result = await response.json() as { accepted?: boolean; state?: MeasurementDeliveryState };
    if (!response.ok) return { accepted: false, state: "rejected" };
    return {
      accepted: result.accepted === true,
      state: result.state ?? "provider-not-configured"
    };
  } catch {
    return { accepted: false, state: "delivery-failed" };
  }
}
