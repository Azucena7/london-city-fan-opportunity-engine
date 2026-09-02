# FRONTEND BLOCK 14 — Product IA & Content Consolidation

## Objective
Make the Lab easier to understand by making navigation reflect user decisions rather than build history.

## New primary IA
- This Week — the operating recommendation
- Opportunities — WHERE + WHEN (Territories + Fixtures)
- Access — fan journey + territory access
- Method — scoring, evidence states, data discipline and AI role
- Case Study — secondary narrative route

## Route consolidation
- `/` → `/this-week`
- `/fixtures` → `/opportunities#fixtures`
- `/territories` → `/opportunities#territories`
- `/travel` → `/access#fan`
- `/territory-travel` → `/access#territory`
- `/signals` → `/method`
- `/story` → `/case-study`

## This Week changes
- Decision first: action, score, fixture, target, product, channel, message.
- Replaces “live inputs available” with clearer planning / weather / attendance readiness.
- Removes the standalone Weather card to avoid duplication.
- Evidence moves into a collapsed disclosure.
- Evidence states corrected: Calendar + Attention = PLANNING; Appeal = INFERRED; Weather = LIVE when available; Attendance = WAITING.

## Method changes
Unified architecture:
`940 LSOAs → WHERE → WHEN → MATCHWEEK → ACTION → LEARN`

Structural Opportunity:
- Family Potential 35%
- Girls Football Network 35%
- Accessibility / Friction 30%
- Competition Pressure + IDACI are context only, 0% direct weight.

Planning:
- Territory 35%
- Calendar 25%
- Attention 20%
- Fixture Appeal 20%

Matchweek:
- Territory 30%
- Calendar 20%
- Attention 15%
- Appeal 10%
- Weather 10%
- Attendance Momentum 15%

## Visual changes
- 8 pill-style primary nav items reduced to 4 text tabs with active state.
- Internal hero sizes reduced.
- Decision gets strongest visual hierarchy.
- Evidence and methodology become secondary layers.
- Repeated cards and uppercase labels reduced.

## Scope guardrails
No new modelling feature was added. TransportAPI credentials remain deferred. Structural Opportunity scores are unchanged.
