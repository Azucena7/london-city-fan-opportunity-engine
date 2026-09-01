# Frontend Block 11 — EN / ES

## Adds
- EN / ES selector
- Language persistence with localStorage
- Browser-language default for Spanish users
- Shared translation dictionary
- Bilingual navigation
- Bilingual Overview
- Bilingual This Week shell
- Bilingual Travel page and Journey Planner

## Important
Some deeply nested components such as EvidenceList, WeeklyDecisionHero and
fixture/territory data labels remain English in this block.
The i18n foundation is now in place so those can be migrated without changing architecture.

## Commit title
`Add English Spanish language switcher and i18n foundation`

## After deploy
Test:
1. Open Overview
2. Switch EN → ES
3. Navigate to This week
4. Navigate to Travel
5. Refresh browser
6. Confirm ES remains selected
