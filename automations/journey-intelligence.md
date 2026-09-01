# Journey Intelligence

## Block 09
The public prototype now supports fan-entered origins and server-side TfL journey planning.

## Current signal
Access Score considers:
- total minutes
- number of changes
- walking minutes
- disruption count

This is a heuristic designed around family matchday friction.

## TfL access
Anonymous Unified API access is rate-limited.
A `TFL_API_KEY` can be added later in Vercel without exposing it client-side.

## Matchday mode
The frontend can request a future journey using the selected fixture date.
Until verified kick-off time is attached to each fixture, the prototype uses a
clearly labelled planning-time assumption.

## Block 10
Next:
1. resolve verified kick-off / target arrival time
2. compare NOW vs MATCHDAY forecast
3. ingest planned closures and future line status
4. derive delta in journey duration / friction
5. push delta into territory-level acquisition recommendations
