# Automations and Agents

## Current automation boundary

AVELA currently uses **deterministic scheduled workflows and validation scripts**, not autonomous agents.

The active automation layer is GitHub Actions:

- workflow: `.github/workflows/daily-data-refresh.yml`;
- scheduled around **06:30 Europe/London**, with UTC slots that cover daylight-saving changes;
- can also be started manually with `workflow_dispatch`;
- runs on Node.js 22;
- refreshes repository-backed public data;
- commits material data changes back to the repository.

The workflow executes:

1. `npm run refresh:data`
2. `npm run refresh:public-signals`

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

Routine concerts, theatre, musicals, attractions and generic entertainment are not automatically treated as matchday competition.

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

- Rail Data Marketplace access is approved at account level, but national rail routing remains unavailable until a specific RDM product is validated and connected.
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

Agentic workflows are a **future capability**, not part of the current production claim.

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
