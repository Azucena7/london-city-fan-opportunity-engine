# Scoring Logic

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
