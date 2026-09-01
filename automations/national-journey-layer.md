# National Journey Layer

## Problem fixed
TfL is not a Great Britain journey planner. A raw origin like "Cambridge" should not
be sent blindly to the TfL endpoint.

## New routing architecture
1. Resolve origin through a UK geocoder.
2. Detect London vs national scope.
3. London → TfL Unified API.
4. Outside London → TransportAPI multimodal journey planner.
5. Normalize both responses into the same frontend Journey shape.
6. Apply the same Access Score.

## Environment variables
TRANSPORTAPI_APP_ID
TRANSPORTAPI_APP_KEY

Keep credentials in Vercel server environment only.

## Integrity
If credentials are missing, the UI explicitly says the national origin was recognised
but routing is not yet activated. It does not fake a journey.
