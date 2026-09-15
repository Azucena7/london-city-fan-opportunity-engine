# Live state

`current.json` is the operational freshness summary consumed by Today. It stores the next and
last home fixture, weather, material-change counts and public-source health. Fixture records,
audience snapshots and attendance observations remain in their canonical files; `current.json`
does not duplicate their histories.

## Audience snapshots

`audience-reach.json` keeps public reach, search, broadcast and conversion measures separate.
Its `snapshots` array is append-only: a refresh adds a dated observation instead of replacing
the baseline. A trend is shown only when two snapshots contain the same metric key and unit.

Capture public observations weekly and at T+1, T+7 and T+30 after a material event or fixture.
Use `null` with `pending` or `requires-access` when a value is unavailable; never backfill zero.
`npm run refresh:public-signals` also schedules a T-7 Brighton observation and preserves the
last valid value whenever a provider blocks or times out.

## CRM and ticketing readiness

`crm-ticketing-readiness.json` describes integration coverage. The versioned record contract is
stored in `data/contracts/crm-ticketing.schema.json`; the Brighton dataset in `data/demo/` is
synthetic and exists only to exercise calculations. Run `npm run validate:crm-demo` before
publishing changes to the demo. Never mix demo values with public or club actuals.

## Post-match scorecards

`src/lib/postmatch.ts` joins records through the canonical fixture IDs in `calendar.json`.
Public observations and synthetic rehearsals produce separate scorecards. Every metric retains
its evidence state, and retention remains `waiting` or `requires-access` until comparable
fixtures exist.
