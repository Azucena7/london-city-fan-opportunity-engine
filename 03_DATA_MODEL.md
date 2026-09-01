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
  date: string
  club: string
  opponent: string
  venue: string
  attendance: number
  capacity?: number
  occupancy?: number
  sourceUrl: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}
```

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
