# Frontend Block 13 — Territory Travel Intelligence

## Scope
London / TfL only.
TransportAPI remains optional and deferred.

## Adds
- `/territory-travel`
- Representative origins for six priority territories
- Current vs matchday journey comparison for each origin
- Aggregate time delta
- Aggregate Access Score delta
- Share of high-friction origins
- Territory response:
  - MAINTAIN
  - ACCESS MESSAGE
  - PROTECT

## Representative origins
These are prototype routing anchors such as stations or local centres.
They are NOT official LSOA centroids.

## Decision discipline
The model no longer extrapolates from one fan journey.
It aggregates several origins before suggesting a territory-level response.

## Commit title
`Add territory travel intelligence and aggregated access response`

## Test
Run:
- Bromley 016B
- Croydon 045E
- Croydon 013E
- Lewisham 030A

Check:
1. Three origin rows return where TfL resolves them.
2. Current and matchday values appear.
3. Territory aggregate appears only when comparable journeys exist.
4. Response never says to abandon a territory solely because travel worsens.
