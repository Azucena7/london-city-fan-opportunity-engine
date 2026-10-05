# AVELA app visual system

## Product position

AVELA is the decision-intelligence layer for football-club marketing teams.

It should not present itself as another analytics, social measurement, sponsorship-valuation or CRM platform. Existing tools can remain systems of record or specialist sources. AVELA connects those signals with club context, player availability, calendar pressure, operational constraints and commercial priorities to recommend the next best action.

Core product loop:

**Signals → Context → Opportunity → Decision → Action → Learning**

The visual system must make that loop obvious without asking the user to interpret a dense BI dashboard.

## UI principles

1. **Decision before dashboard.** Every primary surface answers what changed, why it matters and what to do next.
2. **Cards are units of work.** Use signal, opportunity, recommendation and constraint cards instead of undifferentiated tables.
3. **Explainability by design.** Every recommendation exposes the signals and constraints behind it.
4. **Impact / effort / urgency / confidence are human-readable.** Prefer High / Medium / Low plus exact data when useful.
5. **One visual language.** Navy navigation, off-white canvas, white cards, teal for evidence/context and coral for opportunity/action.
6. **No nautical literalism.** The sail/wind idea lives in the AVELA mark and in flow lines, not in boat imagery.
7. **Football is explicit in content, not cliché iconography.** Avoid balls, shields and generic pitch graphics as decoration.
8. **Existing tools are sources, not competitors inside the UI.** Blinkfire/CRM/ticketing/social data should appear as provenance where relevant.
9. **Operational truth matters.** Availability, permissions, contracts and workload can reduce or block a recommendation.
10. **Responsive first.** On small screens preserve the decision queue and critical action before secondary context.

## Shared component hierarchy

### Signal card
- signal category
- current movement / intensity
- source and freshness
- relation to a fixture/campaign/player
- evidence state

### Opportunity card
- short opportunity statement
- why now
- impact
- effort
- urgency / window
- confidence
- CTA: review / add to plan

### Recommendation card
- recommended action
- assets needed
- operational fit
- commercial fit
- expected impact
- explicit explanation panel

### Constraint card
- unavailable player
- international duty
- approval dependency
- contract restriction
- workload / capacity
- conflicting campaign or event

## Navigation and surfaces

### Home — Decision briefing
Purpose: daily/weekly starting point.

Primary blocks:
- decision-health summary
- highest-priority recommendation
- decision queue
- latest intelligence
- club operating state
- next 30 days
- active work / learning loop

### Radar — Signals to opportunities
Current route: `/app/matches`.

Purpose: prioritise fixtures and opportunity windows.

Primary blocks:
- upcoming fixtures ranked by attention
- signal intensity
- calendar pressure
- opportunity score
- recommended play
- explainability
- quick path to match workspace

### Match workspace
Current route: `/app/matches/[fixtureId]`.

Purpose: one decision room per fixture.

Primary blocks:
- opportunity statement
- recommendation
- signals behind it
- required actions
- owner / deadline
- player and partner fit
- constraints
- expected impact
- add to execution plan

### Campaigns — Plans in execution
Current route: `/app/campaigns`.

Purpose: convert recommendations into coordinated work.

Primary blocks:
- active / planned / completed filters
- campaign cards
- timeline
- owners and approvals
- player/partner dependencies
- effort / status / blockers
- outcome handoff to Learning

### Player assets
Current route: `/app/players`.

Purpose: use players as marketing assets without ignoring sporting reality.

Primary blocks:
- availability
- injury / sporting unavailability
- international duty
- contractual obligations
- current traction
- usage load
- best-fit campaigns
- optimal 1/2/3/4/5+ player packs
- cost/opportunity view

### Sponsors
Current route: `/app/sponsors`.

Purpose: connect verified rights and partner needs to relevant opportunities.

Primary blocks:
- partner status
- verified contractual rights
- pending needs
- opportunity matches
- campaign fit
- obligations vs modelled possibilities clearly separated

### Learning / Insights
Current route: `/app/learning`.

Purpose: close the loop after execution.

Primary blocks:
- outcome vs expectation
- measured impact
- what worked / did not
- reusable learning
- confidence calibration
- future recommendation adjustments

### Season — Calendar & context
Current route: `/app/season`.

Purpose: expose future windows and collisions.

Primary blocks:
- fixtures
- international windows
- city / cultural events
- club campaigns
- player availability pressure
- operational conflicts
- opportunity windows

### Signals & sources
Current route: `/app/sources`.

Purpose: make provenance and integration state visible.

Primary blocks:
- source health
- freshness
- evidence state
- permissions
- connected tools
- explicit “requires access” boundaries

### Configuration
Current route: `/app/setup`.

Purpose: club-specific operating context.

Primary blocks:
- objectives
- channels
- brand rules
- approval defaults
- team capacity
- integration preferences

### Team & access
Current route: `/app/access`.

Purpose: permissions and club workspace governance.

## Visual tokens

- Navy: `#102742`
- Teal: `#2F8F83`
- Coral: `#EF8B6C`
- Sand: `#E8DCCB`
- Off-white: `#F8F6F1`
- White cards: `#FFFFFF`

Use teal for evidence/context. Use coral for opportunity/action. Use semantic green/amber/red only for status and risk.

## Rollout order

1. Shared navigation + product tokens
2. Home / Decision Center
3. Radar + match workspace
4. Campaigns
5. Player assets
6. Sponsors
7. Learning
8. Season
9. Sources / setup / access
10. Responsive QA + accessibility + regression tests

## Acceptance criteria

- A marketing user can identify the top action in under 10 seconds.
- Each recommendation explains why it exists.
- Existing specialist tools are represented as inputs/provenance, not duplicated workflows.
- No page requires interpreting more than one primary chart before a decision can be made.
- Mobile retains priority, recommendation, deadline and CTA above secondary analytics.
- Build, typecheck, lint and product-UX tests pass before production promotion.
