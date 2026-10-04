# AVELA

Growth intelligence for women’s football clubs that turns fan, ticketing, fixture, territory and market signals into the next best action for each fixture — then measures what happened and improves the next decision.

London City Lionesses is currently used as the live demonstration environment.

## Product proposition

**Turn fan data into the next best action for every fixture.**

The club-facing product is designed around one simple operating loop:

1. **Match detected** — the fixture calendar starts the work automatically.
2. **Plan generated** — signals are interpreted into one recommended activation draft.
3. **Review** — the club can inspect evidence, adjust match-level signals and resolve blockers.
4. **Handoff** — an approved draft passes to the club's execution workflow.
5. **Learn** — post-match evidence improves the next fixture recommendation.

## Product routes

### Club-facing flow
- **/app** — operational Home: what needs attention, why, blockers and next action.
- **/app/matches** — Radar for upcoming home fixtures and automatic opportunity monitoring.
- **/app/matches/[fixtureId]** — Opportunity Brief: recommendation, activation draft, signals, evidence, impact and handoff review.
- **/app/campaigns** — fixture-led and seasonal campaign planning.
- **/app/players** — player asset availability, rights, usage and pack optimisation.
- **/app/season** — season-level opportunity and activation intelligence.
- **/app/learning** — measured post-match evidence and what changes next.
- **/app/sources** — intelligence source state and connector readiness.
- **/app/executive** — presentation-ready executive view.
- **/app/demo** — guided product demo.

### Commercial / implementation
- **/** — commercial product home.
- **/for-clubs** — club proposition and pilot discussion.
- **/pilot** — 90-day / 6-fixture Growth Intelligence Pilot proposition.
- **/pilot/operating-pack** — onboarding, data trust, roles and measurement design.
- **/pilot/rehearsal** — synthetic end-to-end rehearsal of the privacy-safe club-data path.
- **/cases** — product use cases.
- **/case-study** — public proof and method case study.
- **/live/london-city** — independent London City demonstration.

Historical URLs are preserved only as permanent redirects into the canonical AVELA routes. They are not maintained as parallel product surfaces.

## Commercial entry product

### 90-Day Growth Intelligence Pilot

Six home-fixture decision cycles.

For every fixture:

- one priority growth opportunity;
- one recommended action plan;
- audience, owner, timing and measurement;
- decision blockers and confidence;
- post-match result and learning.

At the end of the pilot, the club receives a **Growth Intelligence Playbook** covering who attends, who returns, what converts, where growth exists, which assumptions failed and what to prioritise next.

## Product principles

- **Simple on the surface, evidence underneath.**
- Separate **opportunity potential** from **decision confidence**.
- Separate what is **known, assumed, missing and measured**.
- Make impact assumptions visible rather than presenting opaque precision.
- Treat impact models as **scenarios, not forecasts**, until grounded in club data.
- Keep final commercial decisions human-led.
- Never claim causal impact before the measurement design supports it.

## Data model and integrations

The pilot can begin with the strongest data already available to a club rather than requiring a system migration.

Core sources:

- ticketing transactions and scans;
- CRM, consent and campaign history;
- paid, email, social and web activity;
- fixture calendar and inventory;
- territory and access;
- selected public demand and market signals.

Public and editorial data live under `data/seed` and `data/live`. Authorised CRM/ticketing exports remain outside the repository and are processed locally. The repository stores only aggregate fixture summaries and repeat-cohort counts; supporter-, order- and ticket-level hashes are discarded before the live product state is written. Never commit credentials or raw club exports.

## Daily data refresh

GitHub Actions runs `npm run refresh:data` and `npm run refresh:public-signals` every day at 06:30 Europe/London.

The first refreshes the official fixture calendar, results and matchday weather. The second ranks a deliberately narrow set of attention competitors: simultaneous WSL, London men's football, England, nationally prominent men's fixtures and exceptional major sport. Routine culture and entertainment are excluded.

Both preserve the last valid observation when a source is unavailable. See `docs/DAILY_UPDATE_RUNBOOK.md` for sources, scoring, secrets, cadence and post-match responsibilities.

## Pilot data rehearsal

Before a club provides authorised data, the aggregate data path can be exercised with the explicitly synthetic Brighton dataset:

```bash
npm run rehearse:pilot
```

The rehearsal is not a production result. It proves the ticket-grain → repeat matching → aggregate evidence path while keeping attribution descriptive and incrementality unproven.

## Local development

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Measurement and causal claims

Campaign identifiers support descriptive attribution. They do not, by themselves, establish incremental lift. A causal claim requires a pre-agreed measurement design such as a randomized holdout, credible control group or explicit counterfactual baseline.

## Validation and quality gate

Every pull request runs linting, typechecking, regression tests, data-contract validation and a production build in GitHub Actions. Before publishing meaningful data or logic changes locally:

```bash
npm run lint
npm test
npm run build
```
