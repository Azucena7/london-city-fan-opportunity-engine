# AVELA — AI Working Agreement

## What AVELA is

AVELA is **The Decision Workspace for Football Club Marketing & Commercial Teams**.

It is not a generic analytics dashboard, CRM, project manager or LLM wrapper. Its job is to combine fragmented club context so teams can decide what to do next, coordinate execution and learn from what actually happened.

Core operating loop:

**Read → Decide → Move → Learn**

Expanded decision flow:

**signal → context → decision → feasibility → execution → evidence → human decision → learning**

The product should make complex cross-functional decisions feel simple on the surface while keeping evidence, assumptions, constraints and confidence inspectable underneath.

## Positioning

Primary external positioning:

> **The Decision Workspace for Football Club Marketing & Commercial Teams**

Useful internal/category language:

> cross-functional decision orchestration

Do not lead commercial copy with abstract category language when a concrete outcome can be stated instead.

AVELA complements — rather than replaces — systems such as CRM/ticketing, Blinkfire, Asana/Monday/Jira, calendars, contracts/documents, analytics and fixture/context sources.

AVELA is different from a general LLM because it is designed around persistent club context, rights, availability, workflows, decision history, evidence and measurement rather than one-off prompting.

## Non-negotiable truth rules

- Do not invent club data.
- Do not invent integrations, source health or provider connectivity.
- Do not present configured credentials as proof that a source is healthy.
- Do not turn public signals into private club facts.
- Do not convert sales into attendance.
- Do not treat campaign identifiers as proof of incrementality.
- Do not claim causal impact without an agreed measurement design.
- Do not infer supporter identity, CRM conversion or repeat attendance without authorised club data.
- Keep final commercial decisions human-led.
- Preserve explicit distinctions between measured, observed, confirmed, forecast, inferred, modelled, missing and pending.

## London City boundary

London City Lionesses is a **live demonstration environment**, not an AVELA customer.

Do not write or imply that London City:
- bought AVELA,
- adopted AVELA,
- used AVELA,
- approved AVELA,
- saw AVELA,
- achieved outcomes because of AVELA.

Public London City material demonstrates the method and product logic only.

The club pilot is a separate proposition using authorised club data, agreed workflows and pre-agreed measurement.

## Current product architecture

Canonical club-facing routes:

- `/app` — Decision Center / operational Home
- `/app/matches` — Opportunity Radar
- `/app/matches/[fixtureId]` — Opportunity Brief / fixture decision workspace
- `/app/campaigns` — campaign planning and execution
- `/app/players` — player asset planning, availability, rights, usage and pack optimisation
- `/app/sponsors` — sponsor and commercial opportunity workspace
- `/app/contracts` — contract and rights truth
- `/app/season` — season / calendar intelligence
- `/app/learning` — outcomes and next-decision learning
- `/app/executive` — executive view
- `/app/sources` — source state and connection readiness
- `/app/setup` — source/setup flow
- `/app/access` — team/access workspace
- `/app/help` — methodology/help
- `/app/demo` — guided product demo

Commercial/public routes:

- `/` — commercial home
- `/for-clubs` — club proposition
- `/pilot` — bounded pilot proposition
- `/pilot/operating-pack` — onboarding, data trust, roles and measurement
- `/pilot/rehearsal` — synthetic aggregate-data rehearsal
- `/cases` — use cases
- `/case-study` — public proof/method case study
- `/live/london-city` — independent London City demonstration
- `/matchday/[fixtureId]` — fan-facing matchday utility

Historical routes should redirect into canonical AVELA surfaces rather than be maintained as parallel products.

## High-value product capabilities to preserve

- Signal and fixture monitoring
- Opportunity detection and prioritisation
- Human-readable recommendations with confidence and blockers
- Feasibility before execution
- Campaign planning and operational handoff
- Player asset planning
- Player packs for 1, 2, 3, 4, 5+ players
- Contract / rights checks before recommending talent
- Injured or sporting-unavailable player handling
- International calendar / call-up constraints
- Campaign windows beyond fixtures, including season tickets and Christmas
- Sponsor opportunity coordination
- Executive reporting
- Source readiness / connection centre
- Learning loop that explicitly says what AVELA learned and what changes next
- Matchday mobility / how-to-get-there utility with clear live-vs-modelled source states
- Commercial pilot lead capture

Do not remove product capability merely to simplify the UI.

## Backend and data boundaries

The current application is Next.js with React and Supabase-backed club infrastructure.

Do not create a parallel backend unless explicitly instructed.

Do not change:
- database schema,
- Supabase architecture,
- API contracts,
- authentication architecture,
- source contracts,
- decision semantics,
- persistence model,
- privacy boundaries

during a frontend-only task.

Commercial lead capture is server-only. Public users must not receive direct insert permission to `commercial_leads`.

Authorised CRM/ticketing data must remain outside the repository at supporter/order/ticket grain. Only aggregate privacy-safe outputs belong in product state.

## Source/integration principles

A source can be:
- planned,
- configured,
- verifying,
- healthy,
- degraded,
- unavailable

Configured is not the same as healthy.

The product should make source trust visible without overwhelming the user.

Important source categories include:
- CRM / ticketing
- analytics
- social / Blinkfire
- fixtures / public context
- campaigns
- calendar
- player / contract rights
- territory / postcode context
- mobility / travel
- international calendar

## UX principles

AVELA should feel like a real daily work application, not a set of marketing pages.

Prioritise:
- persistent application shell
- clear hierarchy
- progressive disclosure
- familiar SaaS interaction patterns
- fast scanning
- decision-first information
- obvious next action
- restrained typography
- consistent spacing
- clear states
- drawers, filters, tables and calendars where useful
- mobile usability
- accessible focus and keyboard behaviour

Avoid:
- oversized landing-page typography inside the app
- decorative cards without a job to do
- excessive one-off component styling
- unnecessary gradients/effects
- excessive explanatory copy in primary work surfaces
- duplicated navigation
- generic AI-SaaS aesthetics

## Design references

Interaction inspiration may be drawn from:
- Linear — speed, hierarchy, navigation, density
- Attio — intelligence records, tables, enterprise refinement
- Notion — progressive disclosure and flexible information architecture
- Stripe Dashboard — operational clarity and metrics
- Asana / Monday — campaign/workflow planning

Do not copy their brand identity or visual language.

## Visual identity

Current AVELA palette:

- Navy: `#102742`
- Navy 2: `#173653`
- Teal: `#2F8F83`
- Coral: `#EF8B6C`
- Sand: `#E8DCCB`
- Paper: `#F8F6F1`

These are directionally important but may be refined in a frontend exploration if contrast, hierarchy or product quality materially improves.

## Mobile navigation

Current mobile primary destinations:
- Home
- Radar
- Campaigns
- Players

Overflow / More:
- Sponsors
- Calendar
- Learning
- Club system / Setup / Team / Help / Demo

When the active destination is inside overflow, the mobile overflow control should preserve that active context.

## Pilot proposition

Commercial entry product:

**4–6 fixtures or a bounded campaign window**
focused on **1–2 real workflows** and **one priority objective**.

Each cycle should answer:
- what opportunity matters,
- what action is recommended,
- why,
- who owns it,
- when it should happen,
- what blocks it,
- how it will be measured,
- what happened,
- what AVELA learned,
- what changes next.

At the end, the club should be able to decide whether to:
- continue,
- adjust,
- stop,
- deepen integration.

## Current pilot proof

The public multi-cycle demonstration window uses:
- Brighton — observed
- Everton — active
- Crystal Palace — next
- Manchester City — next

Do not turn future / planned cycles into observed outcomes.

## Quality and change discipline

Before a meaningful code change:
1. understand the existing route/component/data contract,
2. preserve capability,
3. make the smallest coherent change,
4. run the relevant tests,
5. keep `main` green,
6. do not bypass failing Quality Gates.

Canonical validation:

```bash
npm ci
npm run lint
npm test
npm run build
```

Do not use broad regex cleanup on large layered CSS files, especially the fixture Opportunity Brief stylesheet. Make targeted changes only.

## Branch roles

### `claude/audit`

Primary purpose: independent product, UX, frontend architecture and technical audit.

Default behaviour:
- inspect first,
- do not modify code unless explicitly asked,
- report what should stay/change/remove/consolidate,
- identify P0/P1/P2 priorities,
- challenge existing assumptions,
- do not assume newer means better.

### `lovable/frontend-v2`

Primary purpose: alternative frontend exploration.

Default behaviour:
- preserve backend, APIs, routes, semantics and product capability,
- redesign presentation and interaction only,
- do not merge to `main`,
- favour incremental page-by-page work,
- use preview deployments for comparison,
- stop and explain if a desired UI requires backend changes.

## What success looks like

A football club marketing or commercial user should be able to open AVELA and quickly answer:

1. What needs my attention?
2. Why does it matter?
3. What does AVELA recommend?
4. Can we actually do it?
5. Who needs to act?
6. What evidence supports this?
7. What happened last time?
8. What should change next?

The product should make those answers faster and clearer than assembling them manually across separate systems.
