# Weather Live Adapter

## Current implementation
The frontend now calls:

`GET /api/weather`

The Vercel server route requests a 7-day forecast for Hayes Lane from Open-Meteo.

## Why
- No API key required.
- Keeps third-party requests server-side.
- Revalidates every 30 minutes.
- Returns `WAITING` / unavailable rather than inventing a value.

## Current target fixture
The `/this-week` page currently asks for:
`2026-09-04`

This should later be derived automatically from the next home fixture rather than hard-coded.

## Next upgrade
1. Parse next home fixture from structured fixture data.
2. Select matching forecast date automatically.
3. Feed weather suitability into Live Score.
4. Keep Live Score inactive while attendance momentum is null.
