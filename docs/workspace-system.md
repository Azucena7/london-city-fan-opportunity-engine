# AVELA Workspace System

AVELA is an application workspace, not a collection of landing pages.

## Core frame

Every migrated surface should use the same persistent structure:

- fixed AVELA sidebar
- top context bar with club, time window, search, calendar, notifications and profile
- compact page bar with title, subtitle, views and filters
- full-width working canvas
- details open in drawers before navigating away when possible

## Density rules

- Page title: 20–26px
- Section title: 14–18px
- Functional body: 12–14px
- Metadata: 10–11px
- Avoid application copy below 9px
- Avoid marketing-style hero typography inside the product
- Use 4 / 8 / 12 / 16 / 20 / 24 spacing increments
- Default card padding: 12–16px
- Default card radius: 8–10px

## Common interaction patterns

### View switcher
Use the same data in the most useful representation:
- Overview
- List
- Board
- Calendar

Not every surface needs every view.

### Filters
Keep filters in the page bar or a compact toolbar. Do not create a separate large filter section.

### Drawers
Use a side/detailed disclosure for:
- signal detail
- opportunity detail
- campaign detail
- player detail
- sponsor detail
- calendar event detail
- contract detail
- evidence/provenance

The user should keep their place in the workspace.

### Cards
Cards are compact units, not editorial sections.

Use cards for:
- KPI/status
- recommendation
- opportunity preview
- next event
- small visualisation

Use rows/tables for repeated comparable records.

## Colour semantics

- Navy: navigation, primary decision surfaces
- Teal: evidence, healthy state, context
- Coral: opportunity, primary action, attention
- Amber: review / pending
- Red: blocker / risk
- Neutral grey: unknown / missing / secondary

Do not create new section-specific palettes.

## Home pilot

The Decision Center is the reference implementation.

It should answer in one screen:
1. What needs attention?
2. What does AVELA recommend?
3. What changed?
4. What is coming next?
5. Can the club execute?

The user should not need to scroll through multiple editorial sections to understand today's state.

## Migration order

1. Home / Decision Center
2. Radar
3. Campaigns
4. Player Assets
5. Sponsors
6. Calendar
7. Learning
8. Sources
9. Contracts
10. Team / Setup / Executive

Each migrated surface must reuse the shared shell and UI primitives before any page-specific styling is added.

## CSS ownership

Keep each visual concern owned by one canonical layer. Page modules may extend the system, but they should not restate shared shell, navigation or readability rules.

- `ProductJourneyNav.module.css`: internal app sidebar and mobile app navigation.
- `AppWorkspaceShell.module.css`: internal app topbar, pagebar and workspace chrome.
- `WorkspaceUI.module.css`: shared cards, badges, section headers and drawers.
- `product-system.css`: app-wide accessibility, focus, interaction and application-shell baseline.
- `navigation-v2.css`: public/case-study navigation refinements. Do not add new app-sidebar rules here.
- `workspace-structure.css`: legacy/public workspace structures and case-study navigation foundations.
- `product-ux.css`: shared public-product interaction surfaces; avoid redefining navigation unless a legacy surface still depends on it.
- `readability.css`: reading-surface adjustments only; do not use it as a generic override layer.
- `case-study.css`: shared case-study foundation.
- `case-study-technical.css`: technical case-study-only rules.
- `case-study-commercial.css`: commercial/evidence case-study-only rules.
- page/component CSS modules: only local layout and component-specific presentation.

When changing a shared visual rule, edit the canonical owner rather than appending a new "pass", "cleanup" or "refinement" block at the end of another stylesheet. If an override is genuinely required, document why the canonical owner cannot express it.

## Regression rule

Before merging CSS refactors:

1. verify every class referenced by the component still exists;
2. keep mobile breakpoints and focus states intact;
3. preserve evidence/truth-state semantics;
4. run the full Quality Gate, including production build;
5. treat visual browser verification as required when browser automation is available.

