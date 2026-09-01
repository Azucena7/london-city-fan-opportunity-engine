# Frontend Block 11.1 — Bilingual stabilization

## Fixes
- Shared labels now change consistently across EN / ES
- Signal badges translate
- Weekly Decision labels translate
- Evidence translates
- This Week hero translates
- Weather states translate
- Story Mode translates
- Next Home Fixture labels translate
- Language preference remains persisted
- `suppressHydrationWarning` added to avoid html lang hydration noise

## Still intentionally not translated
- Proper nouns
- Club/product names
- Data values such as fixture opponent names
- Some seed-data strategy strings authored in English

## Commit title
`Stabilize bilingual UX across core product views`

## Test
1. Set ES on Overview
2. Visit This week
3. Visit Travel
4. Visit Story mode
5. Refresh
6. Return to Overview
7. Switch to EN
8. Confirm shared labels change without mixed-language UI
