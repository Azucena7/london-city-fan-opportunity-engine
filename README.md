# AVELA

The marketing & commercial decision workspace for football clubs. AVELA joins fan, fixture, campaign, player, sponsor, rights, calendar and operational context so teams can decide what to do next — then learn from what actually happened.

London City Lionesses is currently used as the live demonstration environment.

## Product proposition

**Read the signals. Move the club.**

The club-facing product uses cross-functional decision orchestration to turn fragmented context into one simple operating loop:

1. **Match detected** — the scheduled fixture refresh starts the work automatically.
2. **Plan generated** — signals are interpreted into one recommended activation draft.
3. **Review** — the club can inspect evidence, adjust match-level signals and resolve blockers.
4. **Handoff** — an approved draft passes to the club's execution workflow.
5. **Learn** — post-match evidence improves the next fixture recommendation.

## Product routes

### Club-facing flow
- **/app** — operational Home: what needs attention, why, blockers and next action.
- **/app/matches** — Radar for upcoming home fixtures and refresh-based opportunity monitoring.
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
- **/pilot** — focused marketing & commercial decision pilot proposition: 4–6 fixtures or a bounded campaign window, one or two workflows.
- **/pilot/operating-pack** — onboarding, data trust, roles and measurement design.
- **/pilot/rehearsal** — synthetic end-to-end rehearsal of the privacy-safe club-data path.
- **/cases** — product use cases.
- **/case-study** — public proof and method case study.
- **/live/london-city** — independent London City demonstration.

Historical URLs are preserved only as permanent redirects into the canonical AVELA routes. They are not maintained as parallel product surfaces.

### Canonical runtime boundary

- Club authentication and persistence use only the `CLUB_SUPABASE_*` / `NEXT_PUBLIC_CLUB_SUPABASE_*` namespace.
- Retired unprefixed `SUPABASE_*` / `DATABASE_URL` variables are ignored by the application and should remain empty if legacy Vercel keys still exist.
- The retired TfL / TransportAPI journey-routing prototype is not part of the active runtime. Travel and mobility remain product signals/contracts rather than a parallel routing application.
- Canonical public URL: `https://avela-growth-intelligence.vercel.app`. The Vercel project is also named `avela-growth-intelligence`; the historical London City hostname is retained only as a permanent 308 redirect to the canonical AVELA host.


## Commercial entry product

### Focused Marketing & Commercial Decision Pilot

4–6 fixtures or a bounded campaign window, focused on one or two real decision workflows.

For every decision cycle:

- one priority opportunity;
- one recommended action plan;
- audience, owner, timing and measurement;
- decision blockers and confidence;
- post-match result and learning.

At the end of the pilot, the club has an evidence-based decision on whether to **continue, adjust or stop**: which workflows improved, which constraints or data gaps mattered, what learning carried forward and whether deeper integration is justified.

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

Both preserve the last valid observation when a source is unavailable. See `docs/daily-update-runbook.md` for sources, scoring, secrets, cadence and post-match responsibilities.

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


## Documentation

Maintained product and technical references live in [docs/README.md](docs/README.md). The repository root is kept for runtime and project entry files rather than phase-numbered design artifacts.
