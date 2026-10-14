# AVELA Design System Direction

## Design objective

AVELA should feel like a premium, serious, modern operational workspace used every day by football club marketing and commercial teams.

The visual system should communicate:

- intelligence,
- control,
- speed,
- trust,
- clarity,
- commercial sophistication.

It should not look like:
- a fan website,
- a generic AI landing page,
- a collection of disconnected dashboards,
- a slide deck rendered as a web page,
- an over-decorated sports product.

## Interaction references

Use interaction principles — not brand imitation — from:

- **Linear** — fast navigation, hierarchy, compact density
- **Attio** — modern enterprise records and data surfaces
- **Notion** — progressive disclosure
- **Stripe Dashboard** — operational clarity and status
- **Asana / Monday** — planning, ownership and workflow

## Current palette

Primary direction:

| Token | Value | Role |
|---|---|---|
| Navy | `#102742` | primary brand / navigation / high-trust surfaces |
| Navy 2 | `#173653` | secondary dark surface |
| Teal | `#2F8F83` | positive/action/intelligence accent |
| Coral | `#EF8B6C` | attention / opportunity / warm accent |
| Sand | `#E8DCCB` | supporting neutral |
| Paper | `#F8F6F1` | warm page background |

The palette may be refined, but AVELA should preserve the navy + teal + warm neutral identity.

## Colour principles

- Use colour to encode meaning, not decoration.
- Keep default surfaces quiet.
- Reserve coral for attention/opportunity, not every CTA.
- Use teal for positive/active/intelligence states where appropriate.
- Status should not rely on colour alone.
- Maintain accessible contrast.

## Typography

Typography inside the app should be restrained.

Principles:
- one clear page title,
- compact section titles,
- strong labels,
- readable body copy,
- small metadata only where appropriate.

Avoid:
- landing-page hero sizes inside workspaces,
- too many type scales,
- tiny 7–10 px text,
- long paragraphs in operational cards.

Typical internal hierarchy direction:
- page title: approx. 28–36 px depending on viewport/context
- major workspace section: approx. 22–30 px
- card title: approx. 15–19 px
- body: approx. 13–16 px
- metadata: approx. 11–13 px

These are guidelines, not hard tokens.

## Spacing

Prefer a small, repeatable spacing scale rather than page-specific values.

Suggested rhythm:
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40

Operational cards should usually feel compact:
- typical card padding: 14–18 px
- larger cockpit/summary cards: 20–28 px when hierarchy warrants it

Avoid excessive vertical air inside the app.

## Application shell

Desktop should feel like a persistent workspace.

Expected structure:
- persistent left navigation,
- compact topbar / context layer,
- page header,
- main working area,
- drawers/panels where useful.

Current sidebar direction is compact rather than oversized.

Primary workflow groups:

### Decide
- Home
- Radar

### Plan & execute
- Campaigns
- Players
- Sponsors
- Calendar

### Learn
- Learning

Secondary club-system areas:
- Executive
- Contracts
- Sources
- Setup
- Team
- Help
- Demo

## Mobile shell

Primary mobile destinations:
- Home
- Radar
- Campaigns
- Players

Overflow:
- Sponsors
- Calendar
- Learning
- club-system destinations

The overflow control must show active context when the current page is inside it.

Targets should be touch-friendly; 44 px is the preferred minimum target size where practical.

Avoid horizontal navigation that requires users to guess there is hidden content.

## Page headers

A page header should answer:
- where am I,
- what is this page for,
- what is the most important action/state.

Do not turn every page header into a marketing hero.

Use subtitles sparingly and keep them operational.

## Cards

Every card should have a job.

Good card purposes:
- decision,
- blocker,
- status,
- evidence,
- owner/action,
- comparison,
- source health,
- recommendation,
- learning.

Challenge cards that only decorate or repeat nearby copy.

Card hierarchy:
1. decision / priority
2. operational work
3. evidence / detail
4. secondary reference

Use elevation/borders subtly.

## Tables and structured data

Use tables when users need:
- comparison,
- sorting,
- scanning across repeated records,
- status + owner + timing in one view.

Avoid replacing a useful table with dozens of cards.

Tables should support:
- sticky header when long,
- readable row height,
- clear status,
- row action,
- mobile fallback.

## Drawers and progressive disclosure

Use drawers/panels for:
- evidence detail,
- source detail,
- rights/contract truth,
- decision explanation,
- editing supporting context.

Keep the main workspace focused on the current decision.

Do not force every supporting detail into the primary scroll.

## Status language

Prefer explicit operational states.

Examples:
- observed
- active
- next
- planned
- configured
- verifying
- healthy
- degraded
- unavailable
- blocked
- needs review
- approved
- measured
- pending evidence

Avoid ambiguous colour-only dots.

## Decision presentation

Recommendations should make visible:

- recommendation,
- why now,
- expected objective,
- confidence,
- evidence,
- assumptions,
- blockers,
- rights/availability constraints,
- owner,
- timing,
- measure,
- human decision.

The user should not need to reverse-engineer a recommendation from multiple dashboards.

## Confidence vs opportunity

Opportunity potential and decision confidence are separate concepts.

A high-potential opportunity can still have low confidence.

The UI should not collapse them into one score.

## Evidence treatment

Clearly distinguish:
- measured,
- observed,
- confirmed,
- reported,
- forecast,
- modelled,
- inferred,
- missing.

Source/freshness should be available when it materially affects trust.

## Player Assets UX

Player planning should make swaps and constraints visually obvious.

When a player is:
- added,
- removed,
- unavailable,
- injured,
- internationally unavailable,
- rights-blocked,
- over capacity,

the recommendation should update clearly.

Pack selection should feel like an optimisation workspace, not a static player gallery.

## Campaign UX

Campaign planning should support:
- calendar/timeline context,
- status,
- objective,
- audience,
- owner,
- key assets,
- next milestone,
- evidence/measurement.

Non-fixture campaigns must feel first-class.

## Source UX

Sources should feel like a connection centre rather than a technical admin list.

Each source should communicate:
- what decisions it improves,
- connection mode,
- current state,
- freshness/verification,
- required next action.

## Learning UX

Learning should feel like the final step of the operating loop.

Each learning surface should foreground:

**What AVELA learned**

Then:
- Repeat
- Change
- Measure next

Avoid burying learning inside retrospective prose.

## Commercial website

The commercial site can be more expressive than the app, but should still feel intelligent and intentional.

Desired commercial flow:

**problem → decision gap → AVELA → differentiation → proof → pilot → lead**

Motion can be used to show:
- signals becoming context,
- context becoming decisions,
- decisions moving into execution,
- outcomes feeding the next decision.

Avoid decorative motion with no explanatory value.

## For Clubs / Pilot

These surfaces should feel credible to a club buyer.

Prioritise:
- bounded scope,
- low integration burden,
- clear inputs,
- clear outputs,
- measurement,
- honest proof,
- obvious CTA.

Do not oversell proof.

## Responsive rules

At minimum, validate:
- wide desktop
- standard laptop
- tablet
- narrow mobile

Key checks:
- no clipped cards,
- no fixed-width overflow,
- navigation remains understandable,
- primary CTA stays reachable,
- tables degrade intentionally,
- drawers/modals remain usable,
- sticky elements do not overlap.

## Accessibility

Preserve:
- semantic headings,
- keyboard navigation,
- visible focus,
- `aria-current` for active navigation,
- sufficient target sizes,
- text alternatives where needed,
- no colour-only meaning.

## Anti-patterns

Avoid:
- giant headings inside app pages,
- 3+ competing card styles on one screen,
- random border radii,
- page-specific typography systems,
- tiny labels,
- excessive centred layouts,
- marketing copy where a status/action would do,
- repeated CTAs,
- duplicated source truth,
- infinite vertical dashboards,
- broad CSS overrides that are hard to reason about.

## Frontend V2 success criteria

A V2 is only better if it improves real product use.

Evaluate against:

1. comprehension within seconds,
2. speed to next decision,
3. hierarchy,
4. navigation,
5. density,
6. trust in evidence,
7. visibility of blockers,
8. ownership/next action,
9. mobile usability,
10. visual quality,
11. consistency,
12. capability preservation.

A prettier screen that removes decision context or product capability is not an improvement.
