# Frontend Block 10 — UK Journey Intelligence

## Fixes
"Cambridge" and other non-London origins are now recognised before routing.

## Adds
- UK origin geocoding
- London vs national scope detection
- TfL routing for London
- TransportAPI routing for Great Britain
- Unified Access Score
- Explicit national-layer setup state
- No fake fallback journeys

## TransportAPI
The provider offers multimodal journey planning across Great Britain.
Credentials are required:
- TRANSPORTAPI_APP_ID
- TRANSPORTAPI_APP_KEY

## Commit title
`Add UK origin resolution and national journey routing layer`

## After deploy
Test:
- Cambridge
- Brighton
- Croydon
- London Bridge
