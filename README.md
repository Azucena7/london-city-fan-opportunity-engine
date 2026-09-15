# London City Fan Opportunity Lab

A decision product for turning London City Lionesses fixtures, audience signals, territory opportunity and post-match learning into clear marketing actions.

## Product structure

- **Today** — current decision, next home fixture, material changes and marketing response.
- **Calendar** — the complete official schedule, results, fixture dossiers, the 2025/26 attendance baseline, a secondary WSL/London-market attendance benchmark, and an audience-to-demand measurement layer.
- **Territories** — spatial opportunity, ranked evidence and access.
- **How it works** — methodology and scoring logic.
- **Commercial case study** — the business problem, product value, evidence and Brighton campaign rehearsal.
- **Technical case study** — phased architecture, public-source automation, data contracts, validation and CRM boundaries.

Legacy routes redirect to the new information architecture, so existing shared links continue to work.

## Local development

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Daily data refresh

GitHub Actions runs `npm run refresh:data` and `npm run refresh:public-signals` every day at 06:30 Europe/London. The first refreshes the official fixture calendar, results and matchday weather; the second appends comparable public audience observations and checks the WSL attendance source. Both preserve the last valid observation when a source is unavailable. See [`docs/DAILY_UPDATE_RUNBOOK.md`](docs/DAILY_UPDATE_RUNBOOK.md) for sources, cadence and post-match responsibilities.

Public and editorial data live under `data/seed` and `data/live`. Internal ticketing, scans, CRM and retention data require an authorised connector. Never commit credentials; configure them as GitHub or Vercel secrets.


## Demand history

`data/history/attendance-2025-26.json` stores the auditable home-league ledger used to derive the 3,176 average, 2,982 median, 3,012 Hayes Lane average and 5,414 record. Public aggregate discrepancies remain visible in the interface instead of being silently reconciled.

## WSL attendance benchmark

`data/live/wsl-attendance-benchmark.json` stores successive early-season snapshots. Published values are ranked separately from pending clubs, and the interface only calculates club-level movement when a comparable new home observation exists.


## Audience and search demand

`data/live/audience-reach.json` keeps owned-channel, Eleven TV, broadcaster, search-interest and CRM measures separate. The Calendar module connects them through a five-stage measurement chain: reach, engagement, intent, purchase/scan and repeat. Google Trends is treated as a relative awareness signal, never as ticket demand or absolute search volume.

## Signal-to-campaign plans

`data/live/campaign-plans.json` turns sourced fixture signals into approval-ready campaign drafts.
Every brief retains its fixture, signal, playbook, activation and attribution keys. The first
vertical slice is Brighton: four coordinated activations, T-12 to T+30 windows, directional
channel allocation and explicit approval gates. Run `npm run validate:campaigns` before publishing.
