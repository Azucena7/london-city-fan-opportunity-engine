# Live state

`current.json` is legacy scaffolding and is no longer consumed by the frontend.
Runtime match state is now assembled by `LiveMatchProvider` from:
- the selected next home fixture
- live weather
- attendance momentum when a verified source becomes available

This avoids two competing sources of truth.
