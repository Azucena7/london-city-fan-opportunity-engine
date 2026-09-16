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

`search-demand.json` keeps Google Trends comparison sets separate by market and intent stage.
Never compare values across different query groups, windows or geographies. A blocked capture is
stored as `source-unavailable`; a low-volume result is `insufficient-sample`; neither is zero demand.
Run `npm run validate:search-demand` after adding an export. A snapshot may be `measured` only when
it contains dated 0–100 observations for terms declared in that comparison set.

`experience-demand-validation.json` defines three research concepts and a non-personal analytics
event. While its status is `validation-concept`, registration, deposits and purchase must remain
blocked. The public page may emit the declared browser event, but it must not collect names,
contact details, addresses, payment data or free text until an approved processor and consent
flow exist. Run `npm run validate:experience-demand` after changing concepts, fixtures or gates.

`mobility-partnership.json` turns three future fixtures and representative travel corridors into
planning scenarios. Scores and shuttle economics are modelled, not observed demand, prices or
operator quotes. A corridor can become a partner signal only after at least 20 aggregated intent
events; addresses, postcodes and individual movements must never be shared. Run
`npm run validate:mobility-partnership` after changing pilots, scoring or simulator assumptions.

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

## Campaign plans

`campaign-plans.json` contains planning drafts, not live media instructions. Each campaign
joins to the canonical fixture, source signals, reusable playbooks, channel attribution IDs and
the post-match measurement states. Offers, assets, partners, destinations and spend remain
approval-dependent. Run `npm run validate:campaigns` before publishing changes.
