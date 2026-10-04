# Architecture

## Current system

AVELA is a Next.js application deployed on Vercel with two deliberately separate product boundaries:

1. **Public product and evidence surfaces**
   - commercial AVELA website;
   - guided product demo;
   - public London City case-study environment;
   - public/structured signal data under `data/seed` and `data/live`.

2. **Private club workspace**
   - authentication through Supabase Auth;
   - club membership and permission checks;
   - row-level security for club-scoped data;
   - persistent campaign workspaces, setup context, activity history and delivery-effort events.

The public case study demonstrates the method. It is not a substitute for authorised club data and must not imply that a demonstrated club is a customer.

## Runtime flow

```text
Public + authorised signals
        |
        v
ingestion / validation scripts
        |
        +--> data/seed + data/live --------+
        |                                   |
        |                                   v
        |                         opportunity / campaign logic
        |                                   |
        |                                   v
        +----------------------------> Next.js on Vercel
                                            |
                           +----------------+----------------+
                           |                                 |
                           v                                 v
                    public AVELA                    private club app
                    + case study                           |
                                                          v
                                                Supabase Auth + RLS
                                                          |
                         +--------------------------------+-------------------+
                         |                                |                   |
                         v                                v                   v
                campaign_workspaces                 club_setup      campaign_activity
                         |
                         v
                delivery-effort API
                         |
                         v
                legacy physical credit_ledger
                (storage name only)
```

The application contract is **delivery effort / units**. The physical `credit_ledger.credits` naming is retained only as a database compatibility boundary and is not exposed as product currency.

## Canonical application surfaces

### Public

- `/` — commercial AVELA product site.
- `/for-clubs` — club proposition and pilot path.
- `/pilot` — 90-day / 6-fixture pilot proposition.
- `/case-study` — evidence and methodology.
- `/live/london-city` — independent public demonstration.
- `/app/demo` — guided product workflow using demo-safe evidence.

### Private club workflow

- `/app` — operational home.
- `/app/matches` — Opportunity Radar.
- `/app/matches/[fixtureId]` — Opportunity Brief.
- `/app/campaigns` — campaign planning.
- `/app/players` — player asset planning.
- `/app/learning` — evidence and learning.
- `/app/season` — season intelligence.
- `/app/sources` — source and connector readiness.
- `/app/setup` — reusable club operating context.
- `/app/access` — authentication, access requests and membership workflow.

Historical routes are permanent redirects into canonical AVELA routes. The historical Vercel hostname permanently redirects to `https://avela-growth-intelligence.vercel.app`.

## Data and signal architecture

### Public / repository-backed inputs

The repository contains only public, researched, synthetic or aggregate-safe material needed by the demonstration and validation workflows.

Core areas include:

- fixtures and competition context;
- attendance evidence;
- weather;
- public audience and attention signals;
- territory and access context;
- public club activations;
- player / commercial demo data;
- campaign plans and measurement contracts;
- source-health and readiness state.

Every material signal should retain its evidence state and source provenance. Missing inputs remain missing rather than being converted to zero or guessed values.

### Automated refresh

GitHub Actions runs the scheduled refresh jobs. The current public-signal refresh uses the API credentials configured in GitHub Actions secrets, not Vercel environment variables.

Validation scripts protect:

- schema/data contracts;
- source-health states;
- CRM/ticketing rehearsal inputs;
- campaign plans;
- measurement and readiness contracts;
- repository hygiene;
- product/content regressions.

## Private persistence and access

The private workspace uses only the `CLUB_SUPABASE_*` / `NEXT_PUBLIC_CLUB_SUPABASE_*` namespace.

Canonical runtime credentials:

- `CLUB_SUPABASE_URL`;
- `CLUB_SUPABASE_PUBLISHABLE_KEY`;
- integration-provided `NEXT_PUBLIC_CLUB_*` equivalents where applicable.

The application does not rely on unprefixed `SUPABASE_*`, `DATABASE_URL`, provider JWT secrets or Postgres credentials for user authentication.

Identity and authorization are separate:

- Supabase Auth proves identity;
- club membership grants club access;
- row-level security and permissions determine what a member can view or change.

Authentication alone never grants access to a club workspace.

## AI generation

Campaign draft generation is server-side through Vercel AI Gateway.

Supported authentication is:

- `AI_GATEWAY_API_KEY`; or
- Vercel OIDC where available.

Generation can produce approval-ready draft material, but it does not publish campaigns, commit media spend, send CRM, or claim external execution.

## Weather

The active weather route uses Open-Meteo and does not require a weather API key.

Weather is only treated as live when it falls inside a reliable forecast horizon. The product should not substitute guessed weather values outside that window.

## Mobility and national rail

The previous TfL / TransportAPI journey-routing application was retired.

Current state:

- travel/access remain decision signals and product contracts;
- Rail Data Marketplace consumer access is approved;
- no RDM product-specific endpoint is connected yet;
- national rail routing therefore remains unavailable until a suitable RDM product is validated and connected.

There is no hidden TransportAPI fallback.

## Decision and execution boundary

AVELA is a decision layer above the club's existing stack, not a replacement CRM, ticketing platform or publishing suite.

The product may:

- monitor and rank fixture opportunities;
- explain which signals drove a recommendation;
- draft campaign scope and assets;
- model delivery effort;
- support review, approval and scope locking;
- prepare a handoff;
- record observed evidence and learning.

The product must not imply that an unsupported action has occurred. Until a real authorised connector exists, sends, publishing, bookings and spend remain explicit external handoffs.

## Deployment

- **Source of truth:** GitHub.
- **Production:** Vercel project `avela-growth-intelligence`.
- **Canonical host:** `https://avela-growth-intelligence.vercel.app`.
- **Production branch:** `main`.
- **Preview deploys:** explicit `preview-*` branches only.
- **Scheduled data refresh:** GitHub Actions.
- **Private persistence:** Supabase.

Every pull request must pass lint, TypeScript checks, content checks, regression tests and a production build before merge.

## Security and privacy boundary

Never commit:

- raw CRM exports;
- supporter names, emails or addresses;
- ticket/order-level personal data;
- API keys or provider credentials;
- private club datasets;
- secrets from Supabase, Vercel or external providers.

Authorised pilot data must be reduced to aggregate, privacy-safe outputs before it enters the product evidence layer. Campaign identifiers support descriptive attribution; causal claims require an explicit measurement design.

## Planned integrations versus current runtime

Future integrations must be represented as **not configured** until a real provider contract and credentials are connected. Documentation and source-health data should not present a retired or hypothetical connector as a working fallback.

This distinction is intentional: AVELA should expose what is live, what is modelled, what is missing and what still requires authorised access.
