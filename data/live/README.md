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

`experiment-measurement.json` defines the anonymous event allowlists, runtime provider contract,
three fixture cohorts and evidence thresholds shared by Experience and Mobility. Test mode is the
default and never contributes to production cohorts. Without an explicitly configured provider,
events are validated locally but not stored. Raw-event retention is capped at 90 days and partner-
facing evidence requires at least 20 valid production events. Run
`npm run validate:experiment-measurement` after changing events, cohorts or provider settings.

`partner-commercial-pack.json` prepares four candidate-specific commercial narratives while keeping
all relationships at `candidate-not-contacted`. Each pack must disclose public evidence, modelled
scenarios, missing measurement and partner-dependent facts. The repository cannot pass commercial,
operational, rights or privacy gates, contact a candidate, or present assumptions as quotes. Run
`npm run validate:partner-commercial-pack` after changing candidates, pilots, evidence or KPIs.

`pilot-readiness.json` ranks the four commercial hypotheses with a transparent 1–5 weighted model,
then joins the provisional recommendation to owners, checklist items, budget inputs and a T−90 to
T+7 decision route. It is an internal decision draft: owners remain unassigned, budget values remain
empty, outreach is disabled and blocked gates force `hold`. Run `npm run validate:pilot-readiness`
after changing scores, owners, blockers, timeline or decision state.

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
