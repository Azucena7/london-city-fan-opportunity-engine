# Automations and Agents

## Current automation boundary

AVELA currently uses **deterministic scheduled workflows and validation scripts**, not autonomous agents.

The active automation layer is GitHub Actions:

- workflow: `.github/workflows/daily-data-refresh.yml`;
- scheduled in three UTC slots (22:17, 01:47, 04:17) because GitHub starts scheduled jobs hours late; a gate lets only the first run that starts on a new **Europe/London** day refresh, so data normally lands early in the London morning;
- can also be started manually with `workflow_dispatch`;
- runs on Node.js 24;
- refreshes repository-backed public data;
- commits material public-data changes back to the repository.

The workflow executes:

1. `npm run refresh:data`
2. `npm run refresh:public-signals`
3. `npm run refresh:news-radar` (non-blocking)
4. `npm run refresh:calendar-moments` (non-blocking)
5. `npm run send:morning-read` (non-blocking; scheduled and manual runs only)

### News radar

`refresh:news-radar` reads public Google News RSS searches listed in `data/seed/news-radar.json` and stores the headline, outlet, link and date in `data/live/news-radar.json`. Each headline is tagged with the configured topics and with any upcoming fixture whose opponent it names, and it is kept for `retentionDays`. The Radar page shows these as **unreviewed** headlines: they never create a signal or change a score, confidence or rank. To change what is watched, edit the `feeds` (query, language, country), the `topics` (keywords) or `excludeOutlets` (aggregators and betting sites to ignore) in the seed file. Every refresh re-tags stored headlines, drops excluded outlets and drops headlines found only by a search that is no longer configured, so a change applies to what is already stored; a push that changes the file runs a refresh straight away. A headline becomes evidence only when someone reviews it and records it as a signal.

### Calendar moments

`refresh:calendar-moments` fetches England and Wales bank holidays from the GOV.UK API into `data/live/bank-holidays.json` and records the result in the source register (`uk-bank-holidays`). If GOV.UK fails, the stored holidays are kept and the source reads degraded; until the first successful run it reads not configured and no holiday is shown or inferred. FIFA women's international windows are a reviewed seed in `data/seed/international-windows.json` (`fifa-international-windows`): edit it when FIFA revises the calendar, and confirm the June 2027 window before adding it. The app places each upcoming home fixture against both — bank holiday weekend, last home match before a window, inside a window, first home match after it — in the Morning Commercial Read and the Opportunity Engine. These are positions against published dates, never estimates of their effect.

### Morning Commercial Read delivery

`send:morning-read` builds the same Morning Commercial Read the home page shows, plus the engine drafts due to be prepared in the next seven days, from the freshly refreshed data. It always writes the read to the GitHub Actions run summary. It also emails it through Resend when two repository secrets exist: `RESEND_API_KEY` and `MORNING_READ_TO` (one or more addresses, comma-separated). `MORNING_READ_FROM` is optional; without a verified sending domain, Resend's `onboarding@resend.dev` sender only delivers to the Resend account owner's own address. It runs on scheduled and manual runs only — never on a push — and a delivery failure never blocks the data refresh. Recipients live only in secrets, never in the repository.

Public-source API credentials used by this workflow belong in GitHub Actions repository secrets. Vercel environment variables do not supply secrets to GitHub-hosted jobs.

## What the daily refresh does

### Fixture and match context

`refresh:data` updates the canonical fixture/result context and matchday weather inputs used by the public evidence environment.

The refresh should preserve source provenance and the last valid observation when a provider is temporarily unavailable.

### Public attention and audience signals

`refresh:public-signals` refreshes a deliberately narrow competition/attention set rather than treating every London event as competition.

Relevant inputs include, where available:

- simultaneous women’s-football fixtures;
- London men’s football;
- England internationals;
- nationally prominent men’s fixtures;
- exceptional major sports occasions;
- approved public audience/source APIs.

Routine concerts, theatre, musicals, attractions and generic entertainment are not automatically treated as matchday competition. They may be collected as public context, but only material conflicts should influence a decision recommendation.

## Validation and safety

The automated refresh is constrained by validation scripts and repository contracts.

Automated jobs may:

- fetch approved public sources;
- normalize and validate observations;
- update repository-backed public signal files;
- preserve prior valid observations when a provider fails;
- commit material public-data changes.

Automated jobs must not:

- invent a missing value;
- turn missing evidence into zero;
- convert ticket availability into attendance;
- make an unsupported causal claim;
- use private club data;
- send CRM;
- publish club content;
- commit media spend;
- contact sponsors or supporters.

## Post-match and private-data work

Several useful steps remain deliberately human- or access-dependent.

After a fixture, AVELA may need authorised inputs such as:

- club-confirmed attendance;
- ticket transactions;
- scans;
- product mix;
- campaign/source identifiers;
- repeat cohorts;
- approved aggregate commercial outcomes.

These are not automatically available from the public refresh.

Private CRM/ticketing data must follow the privacy-safe pilot path and must not be committed to the public repository.

## Source readiness versus automation

A source marked `not-configured`, `requires-access` or `blocked` is not silently replaced by a guessed or retired provider.

Examples:

- Rail Data Marketplace access may exist at account level while national rail routing remains unavailable until a specific RDM product is validated and connected.
- The retired TfL / TransportAPI journey-routing application is not an active fallback.
- Private club connectors remain unavailable until a real club authorises and configures them.

## Human approval gates

No current automation should automatically:

- spend advertising budget;
- email or message supporters;
- publish social content;
- contact sponsors;
- change ticket prices;
- approve a campaign;
- mark an external action as executed without evidence.

AVELA may research, score, draft, recommend and prepare a handoff. Execution remains with the authorised club workflow unless a real connector is explicitly implemented and permissioned.

## Future agentic layer

Agentic workflows are a **future capability, not part of the current production claim**.

Useful bounded agents could eventually include:

### Fixture intelligence

- detect schedule or venue changes;
- flag TV selection changes;
- compare competition overlap;
- surface material changes to the next decision.

### Evidence monitoring

- check source freshness;
- identify contradictory observations;
- request or flag missing evidence;
- preserve provenance.

### Post-match learning

- assemble T+1 / T+7 / T+30 / T+60 / T+90 evidence states;
- compare prediction, plan, observed execution and outcome;
- propose what should change for the next fixture.

### Club operations

Only after authorised integrations exist, bounded agents could prepare actions for review inside the club's existing stack. They must inherit club permissions, approval gates, audit logging and provider limits.

## Design rule for future agents

An agent is not considered live because a prompt or automation description exists.

A future agent should only be represented as operational when it has:

1. a real trigger;
2. declared input sources;
3. explicit permission boundaries;
4. deterministic validation or guardrails;
5. observable output;
6. failure handling;
7. auditability;
8. a human approval boundary wherever an external action can create spend, communication or contractual consequences.

Until those conditions are met, AVELA should label the capability as planned, modelled or requires-access rather than presenting it as automated.
