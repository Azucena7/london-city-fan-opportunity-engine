# Automatic Fixture Selection

## Purpose
`/this-week` should never rely on a manually typed match date.

## Logic
1. Read structured fixtures.
2. Resolve fixture date safely.
3. Keep home fixtures only.
4. Ignore past fixtures.
5. Select earliest future home fixture.
6. Pass that date to the weather adapter.

## Integrity rules
- Unknown date => do not activate weather.
- Outside forecast horizon => `WAITING`.
- No upcoming home fixture => state that explicitly.
- Do not silently choose the first forecast day.

## Next step
Use the selected fixture to load its specific:
- planning score
- target territory
- recommended product
- campaign message
- attention context
