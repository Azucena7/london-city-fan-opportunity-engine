# Matchday Companion provider activation

This note defines when a mobility layer may move from `not-configured` to `live`.

## Road / traffic — TfL Unified API

Environment variables:
- `TFL_APP_ID`
- `TFL_APP_KEY`

Adapter:
- `GET /api/matchday/road`

Activation rule:
1. Credentials are configured outside the repository.
2. The adapter returns HTTP 200.
3. The response includes `state: "live"` and a current `checkedAt`.
4. Incidents are filtered to the configured Hayes Lane radius.
5. Executive escalation only occurs for material incidents; provider availability alone remains informational.

Failure behaviour:
- Missing credentials => `not-configured`.
- Upstream error or timeout => `degraded`.
- Never infer road conditions from stale or absent data.

## Rail — National Rail / Rail Data Marketplace

Environment variables:
- `RDM_DATA_PRODUCT_ID`
- `RDM_DELIVERY_ENDPOINT`
- `RDM_AUTH_MODE`
- product-specific secret(s), once the selected product documentation is confirmed.

Current state:
- Consumer account approved.
- Product endpoint / credentials not yet connected.

Activation rule:
1. Select the exact RDM disruption/journey product.
2. Validate authentication and response schema.
3. Persist source timestamp and provider status in `data/live/source-health.json`.
4. Map only fixture-window disruption relevant to supporter corridors.
5. Do not describe rail routing as live before a timestamped provider response exists.

## Routing

No provider is approved yet.

Rules:
- Modelled corridors remain planning context only.
- No origin-to-stadium result may be labelled live without an authorised provider response.
- Exact supporter addresses/postcodes are outside the Matchday Companion measurement contract.

## Source hierarchy

1. Official club directions remain the fallback source of truth.
2. Open-Meteo provides live forecast context when inside the operational forecast window.
3. TfL / Rail enrich the service only when provider health is validated.
4. CRM/ticketing postcode sectors may influence aggregated territory insight only when club-authorised data is connected.

## Decision posture

- `inform`: useful context; do not escalate leadership attention.
- `review`: provider degradation or uncertainty requires a check before publishing guidance.
- `act`: verified conditions cross a threshold likely to change supporter communication or matchday operations.

The Matchday Companion must never convert source availability into a claim of demand, attendance, purchase, inventory or causal impact.
