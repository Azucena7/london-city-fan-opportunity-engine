# Architecture

## Phase 1 - Public prototype

Static JSON -> Next.js frontend -> Vercel

Advantages:
- fast to build
- cheap
- easy to share on LinkedIn
- no sensitive fan data
- transparent methodology

## Phase 2 - Live decision engine

External sources / manual updates -> ingestion jobs -> Postgres/Supabase -> API -> Next.js

Suggested entities:
- territories
- grassroots_nodes
- competitors
- fixtures
- attendance
- weather
- ticketing_products
- local_events
- attention_events
- local_business_signals
- campaign_decisions
- post_match_results

## Phase 3 - Agentic workflows

Agents should perform bounded research tasks:

1. Fixture Intelligence Agent
   - checks schedule changes
   - competitor home/away status
   - TV selections
   - major event conflicts

2. Weather Agent
   - refreshes forecast 7d / 72h / 24h before match

3. Attendance Agent
   - captures published attendance and source confidence

4. Local Market Agent
   - monitors Bromley footfall, events, business and consumer signals

5. Decision Agent
   - calculates planning/live score
   - drafts recommended action
   - never publishes or spends budget automatically

6. Learning Agent
   - compares predicted opportunity with actual attendance / scans / repeat

## Deployment

Recommended:
- GitHub repo as source of truth
- Vercel for frontend
- GitHub Actions or Supabase cron for ingestion
- environment variables for API keys

## Security

Public repo should contain only public/researched data.
Never commit:
- CRM exports
- personal fan data
- email addresses
- API keys
- ticketing platform credentials
