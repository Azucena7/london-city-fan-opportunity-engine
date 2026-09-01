# Frontend Block 06

Connects the first genuinely live signal.

## Adds
- `/api/weather` Vercel server route
- Live Hayes Lane forecast via Open-Meteo
- Weather suitability score
- Automatic refresh / revalidation
- Live weather card in `/this-week`
- No API key required

## Data integrity
If the forecast cannot be retrieved, the UI remains `WAITING`.
It never inserts a guessed weather value.

## Commit title
`Connect live Hayes Lane weather signal`

## Vercel
Commit to `main`; Vercel should redeploy automatically.
