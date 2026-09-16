# Data Model

## Territory

```ts
interface Territory {
  lsoaCode: string
  name: string
  borough: string
  lat: number
  lon: number
  householdsWithDependentChildren: number
  familyDensity: number
  straightLineKmToHayesLane?: number
  verifiedGirlsNodes6km?: number
  girlsNetworkScore?: number
  sundayTravelMinutes?: number
  transfers?: number
  matchdayFrictionScore?: number
  opportunityScore?: number
  nearestTier1Competitor?: string
  kmToTier1Competitor?: number
  competitionPressure?: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}
```

## Fixture

```ts
interface Fixture {
  date: string
  opponent: string
  kickoff: string
  home: boolean
  targetTerritory?: string
  calendarWhitespace?: number
  attentionPressure?: number
  attentionAvailability?: number
  fixtureAppeal?: number
  weatherSuitability?: number
  attendanceMomentum?: number
  planningScore?: number
  liveScore?: number
  decision?: 'ATTACK HARD' | 'ATTACK' | 'TEST / SELECTIVE' | 'DEFEND CORE'
}
```

## GrassrootsNode

```ts
interface GrassrootsNode {
  name: string
  operator: string
  postcode?: string
  lat: number
  lon: number
  strength: number
  offer: string
  sourceUrl: string
  status: 'VERIFIED' | 'UNKNOWN'
}
```

## Competitor

```ts
interface Competitor {
  club: string
  division: string
  tier: number
  venue: string
  venueRole: string
  lat: number
  lon: number
  kmFromHayesLane: number
  competitionType: string
}
```

## AttendanceObservation

```ts
interface AttendanceObservation {
  id: string
  season: string
  date: string
  club: string
  opponent: string
  competition: string
  venue: string
  venueGroup?: 'hayes-lane' | 'the-den'
  attendance: number
  attendanceState: 'measured' | 'reported'
  soldOut?: boolean
  configuredCapacity?: number
  occupancy?: number
  sourceName: string
  sourceUrl: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}
```

## CrmTicketingRecord v1.0

Grain: one ticket per row. The stable attribution path is:

`fixture_id → campaign_id → content_id → ticket_id_hash → scan_status → supporter_id_hash`

Required groups:
- fixture and source keys
- pseudonymous supporter, order and ticket keys
- purchase timestamp, product and realised unit price
- scan state and conditional scan timestamp
- consent state and extract timestamp

Excluded from the contract:
- names, email addresses and phone numbers
- full postcodes and dates of birth
- payment details

The public prototype may use `synthetic-demo` records to validate calculations. Synthetic
records must never be combined with measured club results.

## PostMatchScorecard

Generated per canonical `fixture_id` from the calendar, public post-match observations and,
where explicitly selected, a synthetic rehearsal dataset.

Each metric carries one evidence state:
- `public-measured`
- `public-reported`
- `synthetic-demo`
- `requires-access`
- `waiting`

The scorecard closes five windows independently: T+1, T+7, T+30, T+60 and T+90. Reaching a
date does not make a window complete when its required evidence is still unavailable.

## CampaignPlan v1.0

The campaign path is:

`fixture_id → signal_id → playbook_id → activation_id → campaign_id / UTM → measurement → scorecard`

Each plan includes:
- objective, audience, proposition, message and approval-dependent offer
- channel-specific activation briefs and required assets
- execution windows and a directional allocation mix
- public, pending-source, requires-instrumentation and requires-access KPIs
- approval gates and guardrails

Repository campaigns default to `draft`. A plan cannot become `ready` while an approval is
pending, and it cannot become `live` without an authorised execution source outside the public
prototype. Recommended channel shares are planning guidance, never spend authorisation.

## TicketingProduct

```ts
interface TicketingProduct {
  club: string
  product: string
  coverage: string
  adultPrice?: number
  juniorPrice?: number
  perGameAdult?: number
  observedSignal: string
  inferredObjective: string
  confidence: string
  sourceUrls: string[]
}
```

## MatchdayDecision

```ts
interface MatchdayDecision {
  fixture: string
  territory: string
  product: string
  channel: string
  message: string
  primaryKpi: string
  secondaryKpi?: string
  planningScore: number
  liveScore?: number
  decision: string
  postMatchLearning?: string
}
```

### Attendance rules

- League and cup observations remain separate.
- A missing observation is `pending`, never zero.
- Physical stadium capacity is not used as configured matchday capacity unless the source confirms it.
- Public reported attendance remains distinct from internal ticket scans.
- Season aggregates are derived from the auditable match ledger; conflicting published aggregates remain documented.

## ClubActivation

Public, fixture-linked evidence of what the club has activated. Observations and strategy hypotheses remain separate so the product never presents an inference as a club-stated objective.

```ts
interface ClubActivation {
  id: string
  fixtureId: string
  observedAt: string
  window: string // T-42 ... T+7
  channel: 'website' | 'ticketing' | 'instagram' | 'news' | 'matchday' | 'partner'
  funnelStage: 'awareness' | 'consideration' | 'conversion' | 'experience' | 'retention'
  audience: LocalizedText
  title: LocalizedText
  messageAngle: LocalizedText
  product: LocalizedText
  callToAction: LocalizedText
  sourceName: string
  sourceUrl: string
  evidenceState: 'observed' | 'partially-observed' | 'cannot-verify'
  confidence: 'high' | 'medium' | 'low'
}
```

## StrategyHypothesis

```ts
interface StrategyHypothesis {
  id: string
  title: LocalizedText
  rationale: LocalizedText
  confidence: 'high' | 'medium' | 'low'
  evidenceIds: string[] // references ClubActivation.id
}
```

## ActivationAlignment

Compares an Engine recommendation with public execution without treating unavailable internal evidence as a negative result.

```ts
interface ActivationAlignment {
  id: string
  recommendation: LocalizedText
  observed: LocalizedText
  status: 'deployed' | 'partially-observed' | 'not-publicly-observed' | 'cannot-verify'
}
```

## SourceDiscrepancy

Preserves contradictory public observations instead of silently selecting one value.

```ts
interface SourceDiscrepancy {
  field: 'kickoff' | 'date' | 'venue'
  detectedAt: string
  state: 'unresolved' | 'resolved'
  values: Array<{
    value: string
    sourceName: string
    sourceUrl: string
    checkedAt: string
  }>
}
```
