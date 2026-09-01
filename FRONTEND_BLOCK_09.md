# Frontend Block 09 — Journey Planner

## Adds
- `/travel`
- Fan-entered origin
- TfL journey planning to Hayes Lane
- Current journey duration
- Changes
- Walking minutes
- Route legs
- Disruption messaging
- Access Score
- Travel now / Matchday forecast UX
- Optional `TFL_API_KEY`, server-side only

## Data integrity
- Journey data is requested from TfL.
- Missing routes are shown as unavailable.
- Matchday future planning is labelled as such.
- The Access Score is a prototype heuristic, not a TfL metric.

## Commit title
`Add TfL journey planner and matchday access score`

## Vercel
Commit to `main`; Vercel should redeploy automatically.
