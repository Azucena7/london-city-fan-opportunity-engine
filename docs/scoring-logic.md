# Scoring Logic

Reference scoring rationale. Runtime behaviour is governed by the active scoring implementation and tests.

## 1. Territory Opportunity

The structural score should ultimately be based on:

- Family Potential: 35%
- Girls Football Network: 35%
- Matchday Accessibility / Friction: 30%

IDACI is context for affordability/support, not a positive wealth variable and should not reward richer areas.

### Family signal
Uses exact Census 2021 TS003 dependent-child household counts at LSOA level.

### Girls network
Measures verified distribution nodes, not just number of football clubs.
Examples:
- Wildcats
- girls teams / age groups
- academies
- community sessions
- Sister Club relationships

### Accessibility
Final version must use Sunday public-transport journey time, transfers and last mile.
Straight-line distance is only a screening variable.

## 2. Competition Pressure

Context only - do not automatically subtract it from Opportunity.

High competition can also validate demand.

Current heuristic:
- 75% nearest Tier-1 women's club proximity
- 25% nearest Tier 3-5 local women's club proximity

## 3. Calendar Whitespace

Measures whether local women's-football alternatives are home that weekend.

Palace-away dates matter disproportionately in Croydon.
Charlton-away dates matter more in Lewisham / Greenwich.

## 4. Attention Availability

`Attention Availability = 100 - Attention Pressure`

Attention Pressure includes:
- public holidays
- large local events
- Premier League TV
- FA Cup
- Six Nations
- NFL London
- England football
- major entertainment / family occasions

## 5. Planning Score

Used months/weeks ahead, before live weather and momentum exist.

```
Planning Score =
35% Territory Opportunity
+ 25% Calendar Whitespace
+ 20% Attention Availability
+ 20% Fixture Appeal
```

Decision thresholds:
- >=85 ATTACK HARD
- >=72 ATTACK
- >=58 TEST / SELECTIVE
- <58 DEFEND CORE

## 6. Live Score

Used inside the matchweek.

```
Live Score =
30% Territory Opportunity
+ 20% Calendar Whitespace
+ 15% Attention Availability
+ 10% Fixture Appeal
+ 10% Weather Suitability
+ 15% Attendance Momentum
```

Fixture Appeal is currently an expert heuristic and should be replaced/calibrated using observed demand once enough games are logged.

## 7. Context Pressure (Radar order, October 2026)

The Radar rank now adds a transparent **context pressure** from the latest refresh
(`src/lib/contextPressure.ts`, loaded by `src/lib/currentContextPressure.ts`):

| Family | Rule | Points | Evidence |
|---|---|---|---|
| Competing events | 3 per high overlap + 1 per medium overlap (event landscape) | max 9 | scheduled |
| Weather | matchday forecast at the shared high / medium level (`weatherThresholds.ts`) | 6 / 3 | forecast |
| Transport | any TfL road closure within 5 km or rail disruption on the day | 6 | reported |
| Calendar | 3 per calendar moment (bank holiday, international window) | max 4 | scheduled |

Total is capped at 20. Rules:

- `rank = baseRank + contextPressure.points` sets the order of the Radar and the decision queue.
- The attention state (Act now, Review, Monitor) is still read from `baseRank`: the outside
  world reorders and explains, it does not change decision rules.
- Every point has a named driver, a source and an evidence state, shown on the Radar row
  ("Outside the club +N: …").
- It is attention, not a forecast: it never estimates attendance or demand.
