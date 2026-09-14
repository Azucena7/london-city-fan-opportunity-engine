# London City Fan Opportunity Lab

A decision product for turning London City Lionesses fixtures, audience signals, territory opportunity and post-match learning into clear marketing actions.

## Product structure

- **Today** — current decision, next home fixture, material changes and marketing response.
- **Calendar** — the complete official schedule, results and fixture dossiers.
- **Territories** — spatial opportunity, ranked evidence and access.
- **How it works** and **Case study** — secondary explanatory content.

Legacy routes redirect to the new information architecture, so existing shared links continue to work.

## Local development

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Daily data refresh

GitHub Actions runs `npm run refresh:data` every day at 06:30 Europe/London. It refreshes the official fixture calendar, results and matchday weather state, preserves historical observations and commits changed snapshots. See [`docs/DAILY_UPDATE_RUNBOOK.md`](docs/DAILY_UPDATE_RUNBOOK.md) for sources, cadence and post-match responsibilities.

Public and editorial data live under `data/seed` and `data/live`. Internal ticketing, scans, CRM and retention data require an authorised connector. Never commit credentials; configure them as GitHub or Vercel secrets.
