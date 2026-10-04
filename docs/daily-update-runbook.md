# Daily update runbook

The site now separates code from live content. GitHub Actions refreshes the official fixture calendar and matchday weather state every day at 06:30 Europe/London. The two UTC schedules handle daylight-saving changes; the script exits outside the correct local hour.

## What is automatic

- Official London City fixtures, venues, competitions, kickoff times and published results.
- Detection of fixture changes compared with the previous snapshot.
- Next home and last completed home fixture.
- Matchday weather when the fixture enters the 16-day provider window.
- A commit only when tracked data changes; Vercel can deploy that commit through the existing Git integration.
- London City YouTube subscriber and channel-view snapshots, weekly or when a measured value changes.
- WSL attendance averages when the source returns a comparable table; blocked or incomplete responses are recorded without overwriting the last valid observation.
- Public-source health, last attempt and last successful refresh.

## What remains editorial or requires a connected research automation

- Ticket-sales milestones and scans from club systems.
- Media-attention changes outside the connected event and league-fixture sources.
- Sponsorship, community and consumer signals.
- Post-match acquisition, yield, territory and retention data.
- Eleven TV video-level reach until a canonical public video is configured.
- Google Trends matched-query exports; its relative index must be captured from a consistent comparison rather than scraped as absolute volume.

Those signals use `data/live/signals.json`, `postmatch.json`, `roadmap.json` and `wsl-attendance-benchmark.json`. Every entry must include an evidence state, observed time, source and explicit marketing implication. A connected daily research automation can update these files after this pull request is merged. Internal ticketing and CRM fields require an authorised data source; never put credentials in GitHub.

## Operating cadence

1. Daily: refresh fixtures and material public signals; check the WSL attendance source and audience/search sources, appending snapshots only when the sample or signal changes materially.
2. Inside T-48 hours: recheck fixture and weather every six hours when a suitable scheduler is connected.
3. T+1: result, public attendance and incidents.
4. T+3: scans, no-show, sales and yield.
5. T+7: acquisition, channels, territories and experiment review.
6. T+30/60/90: repeat purchase and cohort value.

## Club activation intelligence

For the next home fixture, add public activations to `data/seed/club-activations.json` when there is material evidence rather than on a fixed posting quota.

- Store the first observed date, fixture window, channel, funnel stage, audience, product, CTA and source URL.
- Keep observations separate from strategy hypotheses.
- Compare the current fixture with the previous home fixture and with the Engine recommendation.
- Report blocked or incomplete social coverage as `partial`; never infer inactivity from missing access.
- Use `cannot-verify` for email, paid-media targeting, CRM segmentation and private conversion unless an authorised source is connected.
- Preserve contradictory fixture details in `sourceDiscrepancies` until the authoritative source resolves them.

## Manual test

```bash
REFRESH_DRY_RUN=1 npm run refresh:data
REFRESH_DRY_RUN=1 npm run refresh:public-signals
npm run validate:public-signals
npm run typecheck
```

The public-signal refresh uses the official YouTube Data API, Ticketmaster Discovery API, official Barclays WSL fixture list and daily structured football feeds for the Premier League, London EFL clubs, England men and UEFA club competitions involving London teams. Configure `YOUTUBE_API_KEY` and `TICKETMASTER_API_KEY` as GitHub Actions repository secrets; Vercel environment variables do not propagate to GitHub-hosted workflows. YouTube channel statistics are read by handle.

The attention model applies a relevance gate before scoring. It admits simultaneous WSL fixtures, England men's internationals, matches involving London men's clubs, nationally prominent men's fixtures and exceptional sports occasions at major venues. A candidate must occur on the same day as the London City fixture. Routine concerts, musicals, theatre, attractions and generic family entertainment are excluded: co-occurrence alone is not treated as competition.

Admitted candidates are scored out of 100 for kickoff overlap (35), audience substitution (35), scale or national salience (20) and proximity or operational impact (10). Scores below 50 are omitted; 50–59 is context, 60–74 medium and 75–100 high. The interface shows the four strongest signals per upcoming home fixture. Fixture Download is a secondary machine-readable feed updated daily; use the linked competition or club source to reconfirm material schedule changes before committing spend.

The workflow also supports **Run workflow** from the GitHub Actions page.


## Audience and search cadence

- Public YouTube subscriber and channel-view counts: weekly, at T-7/T+1/T+7/T+30, or after a measured change.
- Fixture video/live-stream views: T+1 and T+7; keep live, replay and highlights separate where available.
- Eleven TV and broadcaster distribution: confirm before each fixture; add reported reach only when sourced.
- Google Trends: preserve matched-query snapshots for GB and Spain at announcement, T-7, T+1, T+7 and T+30. The 0–100 index is relative within a query and must not be treated as search volume.
- Search-demand capture states are explicit: `measured`, `insufficient-sample`, `source-unavailable` or `requires-access`. Never replace a failed capture with zero, and do not pass a hospitality gate from player interest alone.
- CRM/ticketing: use consent-safe fixture and campaign IDs; never commit personal data or credentials.
