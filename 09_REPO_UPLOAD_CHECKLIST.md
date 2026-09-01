# GitHub Repo Upload Checklist

## Recommended repository name
`london-city-fan-opportunity-engine`

## Recommended visibility
Start **Private** while building.
Switch to Public only after reviewing sources, licensing and any sensitive data.

## Upload these folders/files

- README.md
- docs/
- data/seed/
- data/source/london_city_fan_opportunity_v1_weekly_decision_engine.xlsx
- .gitignore
- .env.example
- package.json (when frontend is created)
- src/ (frontend code when generated)
- public/ (logos/assets only when licensing permits)

## Do not upload

- real CRM data
- fan names/emails
- raw customer postcodes linked to individuals
- API keys
- passwords
- proprietary ticketing exports without permission
- copyrighted club imagery without usage rights

## First build sequence

1. Create empty repo.
2. Upload this kit.
3. Connect repo to ChatGPT/GitHub App.
4. Create frontend branch: `build/public-prototype`.
5. Implement Next.js shell.
6. Load seed JSON.
7. Build Weekly Decision Card first.
8. Build map second.
9. Add season/calendar view.
10. Deploy preview to Vercel.

## Definition of Done for public V1

A LinkedIn visitor can answer within 60 seconds:
- What problem is being solved?
- Which territory should London City target?
- Why?
- Which fixture is best to attack?
- What should the club actually do?
