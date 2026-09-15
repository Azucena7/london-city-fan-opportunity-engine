# Live state

`current.json` is legacy scaffolding and is no longer consumed by the frontend.
Runtime match state is now assembled by `LiveMatchProvider` from:
- the selected next home fixture
- live weather
- attendance momentum when a verified source becomes available

This avoids two competing sources of truth.

## Audience snapshots

`audience-reach.json` keeps public reach, search, broadcast and conversion measures separate.
Its `snapshots` array is append-only: a refresh adds a dated observation instead of replacing
the baseline. A trend is shown only when two snapshots contain the same metric key and unit.

Capture public observations weekly and at T+1, T+7 and T+30 after a material event or fixture.
Use `null` with `pending` or `requires-access` when a value is unavailable; never backfill zero.
