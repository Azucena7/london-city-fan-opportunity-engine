# Frontend Block 11.2 — Product Consolidation

## Fixes
- One runtime source of truth for This Week
- Weather state is shared across hero, signals and evidence
- Hard-coded 2/6 readiness removed
- Fixture-specific territory/calendar/attention/appeal values
- Live score implemented but only activates when attendance momentum is verified
- Real fixture kickoff displayed
- Matchday journey planning uses kickoff minus 45 minutes instead of 12:00
- Fixtures / Territories / Signals page shells and component labels bilingual
- Typed Fixture / Territory / LiveMatchState models
- `.env.example` aligned with actual integrations
- Next.js `typedRoutes` warning removed
- `data/live/current.json` explicitly marked legacy / not consumed

## Commit
`Consolidate live match state types and bilingual product views`

## Repo cleanup after this deploy
The following duplicates can be deleted later; they are not required by the app:
- root seed JSON files
- `/seed/`
- duplicate root source workbook
- old `FRONTEND_BLOCK_*.md` files
Do cleanup only after production is confirmed healthy.
