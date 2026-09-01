# Live Signal Contract

This file defines the future write contract for automated agents.

## Target
`data/live/current.json`

## Rules
- Never invent missing live data.
- Use `null` when unavailable.
- Preserve `updated_at`.
- Weather only activates inside a reliable forecast window.
- Attendance momentum must be based on verified ticket-sales / scans / attendance signals.
- Attention may be inferred, but should be labelled accordingly.
- Frontend must distinguish `MEASURED`, `INFERRED`, `LIVE`, `STRUCTURAL`, and `WAITING`.

## Future agent loop
1. Read next home fixture.
2. Check date horizon.
3. Fetch weather if inside reliable window.
4. Fetch or ingest current attendance / sales momentum if available.
5. Refresh attention competition.
6. Write `data/live/current.json`.
7. Trigger deploy or data refresh.
