# Automation placeholders

Future jobs:
- refresh-weather
- refresh-fixtures
- refresh-attendance
- refresh-attention-events
- refresh-local-market
- calculate-weekly-decision
- post-match-learning

Keep each job idempotent and source-aware.
Every record should include `sourceUrl`, `checkedAt`, and `confidence` where possible.
