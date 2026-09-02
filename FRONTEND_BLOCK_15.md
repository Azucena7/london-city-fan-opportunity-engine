# Frontend Block 15 — Product Clarity & Semantic Cleanup

## Goal
Make the Block 14 information architecture easier to understand without adding new product features.

## What changes

### This Week
- Removes the second introductory hero so the operational recommendation is the first product content after navigation.
- Removes the duplicated Planning / Weather / Attendance readiness strip.
- Groups decision inputs into the actual model hierarchy:
  - WHERE — Territory Opportunity
  - WHEN — Calendar Whitespace, Attention Availability, Fixture Appeal
  - MATCHWEEK — Weather, Attendance Momentum
- Fixes the copy from “What is holding up the recommendation” to “What drives the recommendation”.
- Keeps evidence and sources behind progressive disclosure.

### Opportunities — Territories
- Replaces the nonexistent `familyScore` display with observed seed fields:
  - households with dependent children
  - family density
- Uses `sundayTravelMinutes` and `transfers` explicitly.
- Renames Competition to Competition Context and states “Not deducted”.
- Removes the generic `ATTACK / TEST` fallback. Territory cards now describe structural opportunity only; campaign action belongs to territory × fixture planning.

### Opportunities — Fixtures
- Simplifies the default table to Fixture / Target Territory / Planning Score / Action.
- Uses Attention Availability rather than Attention Pressure so higher always means better.
- Makes the four planning inputs expandable on demand.

### Access
- Cleans Spanish copy: trayecto, día de partido, hora de inicio, etc.
- Removes Vercel / credential language from user-facing national-routing messages.
- Adds `FrictionBadge` so HIGH / WATCH / STABLE are no longer represented using evidence-state badges.
- Territory access now uses medians rather than averages.
- A territory response is withheld unless at least two-thirds of representative origins return comparable journeys, with a minimum target sample of two.

### Method
- Keeps architecture and the three model layers visible.
- Moves Evidence & Data, Operating Cadence, and AI & Limitations into progressive-disclosure sections.
- Renames “Used in V1” to “Current Engine” to avoid mixing structural, planning and dynamic layers under one ambiguous label.

### Language consistency
- Attention is consistently framed as Attention Availability in decision/evidence views.
- Spanish Weather / Momentum / matchday / journey copy is reduced where those English terms were unnecessary.

## No changes to
- Structural Opportunity weights.
- Planning Score weights or thresholds.
- Live / Matchweek weights.
- Weather API.
- TfL routing APIs.
- TransportAPI credentials or connection.
- Seed scoring values.

## Files changed
- `src/app/layout.tsx`
- `src/app/block15.css` (new)
- `src/components/FixtureTable.tsx`
- `src/components/FrictionBadge.tsx` (new)
- `src/components/JourneyPlanner.tsx`
- `src/components/LiveSignalGrid.tsx`
- `src/components/LocalizedAccessPage.tsx`
- `src/components/LocalizedMethodPage.tsx`
- `src/components/LocalizedOpportunitiesPage.tsx`
- `src/components/LocalizedThisWeek.tsx`
- `src/components/TerritoryCards.tsx`
- `src/components/TerritoryTravelIntelligence.tsx`
- `src/components/ThisWeekHero.tsx`
- `src/lib/i18n.ts`
- `src/lib/models.ts`
- `src/lib/territoryTravel.ts`
- `src/lib/travelDelta.ts`

## Validation performed
- TypeScript parser pass across all 63 TS/TSX files: 0 syntax diagnostics.
- Local import-path check on changed files.
- CSS brace validation.
- Full `next build` could not be completed in the local environment because dependency installation timed out; Vercel remains the final dependency/build validation.

## Suggested commit
`Refine product clarity and semantic hierarchy`
