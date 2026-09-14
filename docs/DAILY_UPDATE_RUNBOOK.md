# Daily update runbook

The site now separates code from live content. GitHub Actions refreshes the official fixture calendar and matchday weather state every day at 06:30 Europe/London. The two UTC schedules handle daylight-saving changes; the script exits outside the correct local hour.

## What is automatic

- Official London City fixtures, venues, competitions, kickoff times and published results.
- Detection of fixture changes compared with the previous snapshot.
- Next home and last completed home fixture.
- Matchday weather when the fixture enters the 16-day provider window.
- A commit only when tracked data changes; Vercel can deploy that commit through the existing Git integration.

## What remains editorial or requires a connected research automation

- Ticket-sales milestones and scans from club systems.
- Competing events and media-attention changes.
- Sponsorship, community and consumer signals.
- Post-match acquisition, yield, territory and retention data.

Those signals use `data/live/signals.json`, `postmatch.json` and `roadmap.json`. Every entry must include an evidence state, observed time, source and explicit marketing implication. A connected daily research automation can update these files after this pull request is merged. Internal ticketing and CRM fields require an authorised data source; never put credentials in GitHub.

## Operating cadence

1. Daily: refresh fixtures and material public signals.
2. Inside T-48 hours: recheck fixture and weather every six hours when a suitable scheduler is connected.
3. T+1: result, public attendance and incidents.
4. T+3: scans, no-show, sales and yield.
5. T+7: acquisition, channels, territories and experiment review.
6. T+30/60/90: repeat purchase and cohort value.

## Manual test

```bash
REFRESH_DRY_RUN=1 npm run refresh:data
npm run typecheck
```

The workflow also supports **Run workflow** from the GitHub Actions page.
