# Fan Growth Engine

A decision-intelligence product for football clubs that turns fan, ticketing, fixture, territory and market signals into the next best action for each fixture — then measures what happened and improves the next decision.

London City Lionesses is currently used as the live demonstration environment.

## Product proposition

**Turn fan data into the next best action for every fixture.**

The commercial product layer is designed around a simple operating loop:

1. **Discover** — identify the highest-value fan growth opportunity.
2. **Act** — turn it into an audience, action, owner, timing and measurement plan.
3. **Decide** — make evidence, assumptions, blockers and decision conditions explicit.
4. **Measure** — capture the post-match result.
5. **Learn** — feed the outcome into the next fixture decision.

## Product routes

- **/** — commercial product home.
- **/demo** — guided London City product walkthrough.
- **/decision-room** — evidence, assumptions, blockers and what would change the decision.
- **/results** — post-match Results & Learning loop.
- **/impact** — transparent ticket and revenue scenario model.
- **/pilot** — 90-day / 6-fixture Fan Growth Pilot proposition.
- **/today** — the full London City intelligence engine.

The deeper London City routes remain available for fixture, territory, signal, source, experience and operational detail.

## Commercial entry product

### 90-Day Fan Growth Pilot

Six home-fixture decision cycles.

For every fixture:

- one priority growth opportunity;
- one recommended action plan;
- audience, owner, timing and measurement;
- decision blockers and confidence;
- post-match result and learning.

At the end of the pilot, the club receives a **Fan Growth Playbook** covering who attends, who returns, what converts, where growth exists, which assumptions failed and what to prioritise next.

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

Public and editorial data live under `data/seed` and `data/live`. Internal ticketing, scans, CRM and retention data require an authorised connector. Never commit credentials; configure them as GitHub or Vercel secrets.

## London City intelligence engine

The underlying live prototype currently includes:

- **Today** — current decision, next home fixture, material changes and marketing response.
- **Calendar** — official schedule, results, fixture dossiers, attendance baselines and demand measurement.
- **Territories** — spatial opportunity, ranked evidence and access.
- **Signals** — deliberately narrow attention and demand signals.
- **Campaign plans** — sourced signals translated into approval-ready campaign drafts.
- **Measurement** — reach → engagement → intent → purchase/scan → repeat.
- **Sources** — source quality and operational status.

## Daily data refresh

GitHub Actions runs `npm run refresh:data` and `npm run refresh:public-signals` every day at 06:30 Europe/London.

The first refreshes the official fixture calendar, results and matchday weather. The second ranks a deliberately narrow set of attention competitors: simultaneous WSL, London men's football, England, nationally prominent men's fixtures and exceptional major sport. Routine culture and entertainment are excluded.

Both preserve the last valid observation when a source is unavailable. See `docs/DAILY_UPDATE_RUNBOOK.md` for sources, scoring, secrets, cadence and post-match responsibilities.

## Local development

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Validation

Before publishing meaningful data or logic changes:

```bash
npm run lint
npm test
npm run build
```
