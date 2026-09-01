# Travel Friction Delta

## Purpose
Convert accessibility from a static distance assumption into an observed / scheduled matchday signal.

## Comparison
Normal:
- current journey request

Matchday:
- selected next home fixture
- verified fixture date
- target arrival = kickoff minus 45 minutes
- TfL uses `timeIs=Arriving`

## Delta
Compare:
- duration
- Access Score
- changes
- walking burden
- disruptions

## Decision discipline
A single user's journey must NOT automatically change territory spend.

Fan-level response may:
- add travel messaging
- recommend earlier departure / alternative route
- flag high friction

Territory-level acquisition decisions should only change after aggregating multiple representative origins.

## Next
Block 13 should model representative origins for priority territories and aggregate Travel Friction Delta into a territory signal.
