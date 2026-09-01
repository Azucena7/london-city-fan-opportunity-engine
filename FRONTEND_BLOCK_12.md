# Frontend Block 12 — Travel Friction Delta

## Adds
- Current journey vs scheduled matchday journey
- Matchday target arrival = kickoff minus 45 minutes
- TfL `timeIs=Arriving`
- Normal Access Score vs Matchday Access Score
- Time delta
- Access Score delta
- Engine response: NO CHANGE / WATCH / ADJUST
- Explicit warning that one individual journey must not move territory budget
- Cambridge/general-city postcode shown as a representative routing point

## Important distinction
This is public-transport journey friction, not live road-traffic prediction.

TfL future routing can reflect scheduled network conditions available to the journey planner.
It should not be described as guaranteed future congestion.

## Commit title
`Add matchday travel friction delta and engine response`

## Test
London origins:
- Bromley South
- London Bridge
- Croydon

National origin after TransportAPI credentials:
- Cambridge

Check that:
1. Current journey appears.
2. Matchday journey appears if provider supports it.
3. Delta is shown only when both journeys exist.
4. No territory budget shift is claimed from one user journey.
