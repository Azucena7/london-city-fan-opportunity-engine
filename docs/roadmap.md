# Roadmap

## Product direction

Working product name: **AVELA**.

Primary positioning: **The Opportunity Engine for Football Club Marketing & Commercial Teams**.

Inside the app, the working surface is a decision workspace (earlier category name: Marketing & Commercial Decision Workspace for Football Clubs). Internal category language: **cross-functional decision orchestration**.

Initial go-to-market and proof focus: **women’s football**. The technology is football-wide.

Core loop: **Read → Decide → Move → Learn**, expanded as signal → context → decision → feasibility → execution → evidence → human decision → learning.

London City Lionesses is a live demonstration environment, not a customer. The club pilot is a separate proposition on authorised club data.

## Status at a glance (October 2026)

Status is what the public build does today. "Built" means a working surface, not that it runs on a club's private data.

| Phase | Status | Where it lives |
|---|---|---|
| A · Positioning and product shell | Built | `/`, `/for-clubs`, `/pilot`, app shell |
| B · Women’s-football signal layer | Partly built: public demand, access, attention, sponsorship and weather signals; calendar moments; TfL road and rail; news radar; international duty in Player assets; exclude-and-recalculate on the brief | `data/live/*`, `/app/matches/[fixtureId]`, `/app/players` |
| C · Opportunity Radar | Built: ranking by opportunity, urgency and signal movement; "no material opportunity" is a valid result; Morning Commercial Read | `/app/matches`, `/app` |
| D · Opportunity Brief | Built | `/app/matches/[fixtureId]` |
| E · Activation builder | Built: channels, asset list, owners, timing, delivery effort, editable scope and approval gates; nothing is published or spent from AVELA | Brief phase 03, `/app/campaigns` |
| F · Commercial modules | Sponsor opportunity built; attendance scenarios such as big-stadium transfer not yet | `/app/sponsors`, `/app/contracts` |
| G · Measurement and memory | Partly built: decision history and Learning, with T+1 / T+7 / T+30 / T+60 / T+90 closure windows; every window after T+1 needs authorised club data to close | `/app/learning`, brief phase 06 |
| H · Club-grade integrations | Source centre and setup built; aggregate CRM/ticketing import script; no live private connector in the public build | `/app/sources`, `/app/setup` |
| I · League intelligence | Not started | — |

## Phase A - Positioning and product shell

- Position the commercial site as the Opportunity Engine for football club marketing and commercial teams; the decision workspace is where the move is run.
- Keep London City Live as the public proof environment.
- Lead with “See what could change the match.” and the Opportunity Engine (signal → what changed → why it matters → prepared move); the workspace is where the move is run.
- Keep fixtures as a primary decision trigger while supporting campaigns and commercial moments that do not require a fixture.
- Preserve the existing evidence and trust-state architecture.

## Phase B - Women’s-football signal layer

Add explicit signal families for:

- national-team windows and return-to-club momentum;
- player search / social momentum;
- women’s-football competition overlap;
- men’s-football fixture overlap;
- family opportunity;
- girls’ grassroots / academy density;
- cultural crossover where evidence supports relevance;
- international player / opponent demand;
- sponsor-fit moments;
- big-stadium transfer potential.

Requirements:

- every recommendation must expose the signals used;
- signal state must remain sourced / inferred / assumed / access-dependent;
- users should be able to exclude a non-mandatory signal and recalculate where practical.

## Phase C - Opportunity Radar

- rank upcoming fixtures by opportunity potential, confidence and urgency;
- show newly changed signals since the previous observation;
- surface material confidence movements;
- allow “no meaningful incremental opportunity” as a valid result;
- create lightweight alert-ready events for important changes.

## Phase D - Opportunity Brief

For each priority fixture, produce:

- opportunity;
- why now;
- evidence;
- audience;
- expected commercial objective;
- confidence;
- recommended play;
- key risks;
- what would change the decision;
- signals used.

## Phase E - Activation builder

Extend the existing CampaignPlan contract with:

- recommended channels;
- content / asset list;
- human owners;
- timing;
- estimated delivery effort;
- editable production scope;
- directional media / activation budget;
- UTM and campaign keys;
- approval gates.

The product may propose. It must not autonomously authorise spend or publish without club approval.

## Phase F - Women’s-football commercial modules

### Attendance intelligence
- demand-gap detection;
- venue / big-stadium scenarios;
- family and first-time audience opportunities;
- repeat-attendance opportunities;
- inventory and timing context.

### Sponsor opportunity
- match / audience / player / cultural context;
- sponsor-category fit;
- activation idea;
- evidence and measurement suggestion.

Sponsor prospecting, lead generation and sales-pipeline management remain a separate adjacent product.

## Phase G - Measurement and Club Opportunity Memory

For each fixture preserve:

- what AVELA predicted;
- what the club planned;
- what was executed;
- what was observed;
- which assumptions were wrong;
- which signals were useful;
- which audience / channel / offer patterns repeated.

Add T+1, T+7, T+30, T+60 and T+90 closure states where data access supports them (all five are tracked in Learning today; only T+1 can close on public data).

## Phase H - Club-grade integrations

Private club data:

- CRM;
- ticketing transactions;
- scans;
- realised price;
- campaign source;
- consent-safe geography;
- sponsorship inventory / category metadata where authorised.

Integration principle:

**Keep the existing stack. Orchestrate the decision across it.**

## Phase I - League intelligence

Potential league product:

- cross-club fixture intelligence;
- league-level audience trends;
- growth opportunity benchmarking;
- fixture / venue scenario support;
- sponsor opportunity patterns;
- competition-level learning.

Any cross-club benchmarking must respect data rights, privacy and contractual boundaries.

## Subproduct track: Matchday Companion (later, not in the current focus)

A supporter-facing "how to get to the stadium" utility with real-time travel signals and a sponsorable mobility layer. The core product already has the pieces it needs to decide; this track turns them into a fan product.

What exists today:

- `/matchday/[fixtureId]`: the fan-facing utility, with live-versus-modelled source states.
- Daily TfL road and rail snapshots, used by the Morning Read.
- `data/live/mobility-partnership.json`: corridors, partner models and guardrails, still at planning-scenario stage.
- Supporter origins by postcode district, from authorised club aggregates (see `docs/data-model.md`).

Why it stays out of the core focus for now: the club user's question is "what should we do for this fixture", and origins already answer that inside the Opportunity Engine (which corridors to watch, where to activate, what evidence a mobility partner would need). A fan app adds a separate audience, live-service reliability and a sponsor sale.

Start it only when all three hold:

1. A pilot club supplies origin aggregates for at least two fixtures, so corridors come from its own supporters rather than public geography.
2. A live provider covers the main corridors. TfL road and rail are in place; National Rail Darwin/RDM is blocked by licence country.
3. A named sponsor category (rail operator, ride-hail, coach, bike, parking) or a club partner wants the placement, measured against an agreed baseline.

Guardrails carried over: modelled routes are never shown as live, no individual supporter location is used, and any partner reporting stays aggregate.

## Live public proof programme

Continue London City Live with:

- published attendance;
- schedule changes;
- weather;
- public event / transport conflicts;
- public audience and search signals;
- fixture-level annotations;
- pre-match recommendation snapshots;
- post-match evidence comparison.

The public case should always preserve what was known before the event and avoid rewriting the recommendation after the result.
