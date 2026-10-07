# AVELA Product Reference

## Product definition

**AVELA is The Decision Workspace for Football Club Marketing & Commercial Teams.**

It connects fan, fixture, campaign, player, sponsor, rights, calendar, operational and external context so a club can move from fragmented signals to a coordinated human decision.

AVELA is not primarily a reporting product. Its value is in helping a team decide and coordinate what to do next.

## Core loop

**Read → Decide → Move → Learn**

Operationally:

1. **Signal** — something changes or matters.
2. **Context** — AVELA joins relevant evidence, constraints and timing.
3. **Decision** — one priority opportunity and recommended move becomes explicit.
4. **Feasibility** — rights, people, availability, timing, systems and blockers are checked.
5. **Execution** — the decision is turned into a workable plan / handoff.
6. **Evidence** — outcome signals are collected.
7. **Human decision** — the club accepts, adjusts, rejects or escalates.
8. **Learning** — AVELA states what was learned and what should change next.

## Primary users

The product is designed primarily for:
- marketing leadership
- commercial leadership
- CRM / fan growth
- ticketing
- content / social
- partnerships / sponsorship
- campaign owners
- player marketing / talent usage
- executive stakeholders

It should reduce cross-functional coordination cost rather than create another specialist silo.

## Jobs to be done

### Daily / weekly
- understand what needs attention now,
- identify the highest-value opportunity,
- see the evidence behind it,
- expose missing information,
- understand blockers,
- assign ownership,
- decide what to do next.

### Match / campaign cycle
- detect demand/context change,
- translate it into an activation,
- verify feasibility,
- coordinate execution,
- measure what happened,
- carry learning forward.

### Commercial
- identify sponsor-compatible opportunities,
- check rights and availability,
- coordinate player/asset usage,
- avoid overuse or conflict,
- understand opportunity cost.

### Executive
- see decisions, risk, evidence and next moves without reading operational detail.

## Canonical navigation

### Decide
- Home / Decision Center
- Radar

### Plan & execute
- Campaigns
- Players
- Sponsors
- Calendar / Season

### Learn
- Learning

### Club system
- Executive
- Contracts
- Sources

### Workspace
- Setup
- Team / Access
- Help & methodology
- Product demo

## Page responsibilities

### Decision Center — `/app`
Purpose: answer “what needs attention now?”

Should surface:
- priority decisions,
- next actions,
- blockers,
- confidence,
- unresolved operational continuity,
- relevant source/data health.

It should not become a generic dashboard of every metric.

### Opportunity Radar — `/app/matches`
Purpose: show upcoming fixtures / opportunities and where context is changing.

Should support:
- scanning,
- prioritisation,
- signal refresh,
- opportunity comparison,
- drill-down into the Opportunity Brief.

### Opportunity Brief — `/app/matches/[fixtureId]`
Purpose: be the primary decision workspace for one fixture/opportunity.

The intended progression is:

1. Decide
2. Feasibility
3. Build
4. Evidence
5. Human decision
6. Learn

It should feel operational, not like a long editorial case-study page.

### Campaigns — `/app/campaigns`
Purpose: manage fixture-led and non-fixture campaigns.

Examples:
- season tickets
- Christmas
- membership
- match campaigns
- community activations

### Player Assets — `/app/players`
Purpose: decide which players should be used, when and why.

Must consider:
- contract / rights truth,
- planned commitments,
- current usage,
- availability,
- injury / sporting unavailability,
- international duty,
- commercial suitability,
- current performance / attention momentum,
- opportunity cost,
- pack size 1, 2, 3, 4, 5+.

Recommendations should update clearly when constraints or player selections change.

### Sponsors — `/app/sponsors`
Purpose: connect sponsor objectives/assets with club opportunities.

Should expose:
- compatibility,
- rights,
- timing,
- inventory / activation context,
- owners,
- next move,
- evidence.

### Contracts — `/app/contracts`
Purpose: provide contract/rights truth used by downstream decisions.

Contract truth is a hard input to player/sponsor recommendations, not a decorative record system.

### Season / Calendar — `/app/season`
Purpose: show timing, competition, campaign and player context across the season.

Player momentum and player asset usage are different signals and must remain distinct.

### Learning — `/app/learning`
Purpose: close the decision loop.

Every meaningful learning should make explicit:
- what happened,
- what AVELA learned,
- repeat,
- change,
- measure next.

### Sources — `/app/sources`
Purpose: connection centre and source trust.

For every important source, make clear:
- why it matters,
- connection mode,
- status,
- decision gain,
- next step,
- freshness / verification where available.

### Setup — `/app/setup`
Purpose: operationalise a source connection.

Typical flow:

**Choose source → Grant access → Map evidence → Verify refresh → Go operational**

### Executive — `/app/executive`
Purpose: concise, decision-oriented executive synthesis.

### Access / Team — `/app/access`
Purpose: team access, roles and operational continuity.

### Fan matchday utility — `/matchday/[fixtureId]`
Purpose: fan-facing practical matchday service.

Potential value:
- directions,
- weather,
- TfL / rail / road context,
- accessibility,
- travel friction,
- local/community nodes,
- partner opportunities.

Live provider data must be distinguished from modelled or fallback information.

## Commercial website

### Home — `/`
Primary job:
- explain the problem,
- explain AVELA,
- differentiate AVELA from existing tools and general LLMs,
- establish proof,
- move the user toward a pilot.

Desired flow:

**problem → product → differentiation → proof → pilot → lead**

### For Clubs — `/for-clubs`
Primary job:
- explain how a club can test AVELA without a large integration programme.

Core proposition:
- 4–6 fixtures or bounded campaign window,
- 1–2 workflows,
- one priority objective,
- existing data first,
- bounded measurement,
- clear continue/adjust/stop decision.

### Pilot — `/pilot`
Primary job:
- make the pilot concrete.

It should clarify:
- inputs,
- decisions,
- workflows,
- data,
- owners,
- measurement,
- outputs,
- success criteria,
- what deeper integration would require.

## Product differentiation

### Versus measurement / analytics tools
Those systems tell the club what happened or how content/partners performed.

AVELA should use those signals as inputs into the next coordinated decision.

### Versus CRM / ticketing
AVELA does not replace system-of-record customer or ticketing infrastructure.

It uses authorised outputs/context from those systems to improve decisions.

### Versus Asana / Monday / Jira
Those tools organise work once the work is known.

AVELA helps determine what the club should do, why and under which constraints before/while routing execution.

### Versus ChatGPT / Claude
A general LLM can help reason about a prompt.

AVELA should preserve club-specific operational context, source states, rights, availability, decision history, workflow, ownership, measurement and learning across repeated cycles.

## Player / commercial decision rules

- Rights are a hard gate before ranking.
- Availability is a hard decision input.
- Future commitments affect capacity.
- Injury/sporting unavailability can change commercial availability but must not be assumed to do so automatically.
- International duty must influence availability.
- Momentum can influence suitability but must not override rights or capacity.
- High momentum does not automatically mean high available usage.
- Pack recommendations need explainability.

## Evidence hierarchy

Prefer:
1. authorised club data,
2. official club / competition / provider data,
3. measured public evidence,
4. confirmed public information,
5. high-quality third-party data,
6. forecast/modelled context,
7. inference.

Never flatten these into one confidence-free number.

## Measurement

Descriptive attribution is not the same as causal lift.

Causal claims require an explicit measurement design, such as:
- randomized holdout,
- credible control,
- explicit counterfactual baseline.

The product should be useful before causal proof exists, but its language must remain honest.

## Pilot proof boundaries

The current public demonstration window:

- Brighton — observed
- Everton — active
- Crystal Palace — next
- Manchester City — next

This shows how the decision should evolve across cycles as evidence and constraints change.

It is not proof of AVELA adoption by London City.

## Definition of a good AVELA screen

A strong screen should normally answer at least some of:

- What is happening?
- Why does it matter?
- What does AVELA recommend?
- What evidence supports it?
- What is uncertain?
- What blocks action?
- Who owns the next move?
- When is action needed?
- What happened last time?
- What should change next?

Screens that only display data without helping one of those decisions should be challenged.
