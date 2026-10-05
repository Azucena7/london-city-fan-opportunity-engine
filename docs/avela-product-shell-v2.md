# AVELA Product Shell V2

## Goal

Apply the commercial AVELA identity to the club workspace without turning the product into a marketing site and without changing product logic.

## Identity mapping

- Navy #102742: shell, navigation, decision anchors.
- Teal #2F8F83: intelligence, evidence, selected states, Ask AVELA.
- Coral #EF8B6C: action and opportunity emphasis only.
- Sand #E8DCCB / Paper #F8F6F1: quiet backgrounds and supporting surfaces.
- Semantic risk colours remain independent:
  - danger #D94A4A
  - warning #D78A1E
  - success #16845B
  - monitor / missing #8A909B

Coral must never replace the danger colour.

## Shell principles

1. Product first, brand second.
2. Navy sidebar creates a stable workspace frame.
3. Main canvas stays light and quiet.
4. One dominant decision per screen.
5. Evidence and operational context use progressive disclosure.
6. Avoid decorative photography inside the workspace.
7. Motion only explains state changes or signal-to-decision flow.

## Decision Center hierarchy

1. What needs attention.
2. Highest current priority.
3. What changed.
4. Decision queue.
5. Operational / club state.
6. Learning and history.

Do not add KPI tiles unless they help a decision.

## Opportunity Brief hierarchy

The visual order should become:

1. Decision header
   - state
   - recommendation
   - why now
   - urgency / confidence / feasibility

2. What could block it
   - approvals
   - availability
   - calendar
   - capacity

3. What AVELA recommends doing
   - campaign / action
   - owner
   - deadline
   - operational handoffs

4. Why AVELA thinks this
   - sourced signals
   - evidence / assumptions / missing
   - what would change the recommendation

5. Human decision
   - approve / modify / reject
   - commit
   - confirm what went live

6. Learning
   - measurement
   - outcome
   - decision history

## Ask AVELA

Ask AVELA remains persistent and contextual.

Visual rules:
- launcher uses navy shell + teal intelligence cue;
- answers stay visually secondary to the decision itself;
- internal context candidates must remain visibly unconfirmed until accepted;
- generated explanations must never visually outrank confirmed evidence.

## Future screen rollout

After shell approval:
1. Decision Center
2. Opportunity Brief
3. Radar
4. Campaigns
5. Players
6. Sponsors
7. Learning
8. Season
9. Contracts / Sources / Setup

Do not restyle every screen in one merge.


## Prepared PR integration order

When production deploy capacity is available again, validate and merge in this order:

1. **#262 · Commercial identity and positioning**
   - public website only;
   - verify desktop/tablet/mobile;
   - verify final CTA and published lead-form URL before exposing it.

2. **#263 · Product shell identity**
   - shared product tokens + navigation shell + Decision Center + Ask AVELA styling;
   - rebase on main after #262 if necessary.

3. **#264 · Decision-first Opportunity Brief**
   - rebase on the new product shell so the hierarchy inherits the approved tokens;
   - visually verify Decision → Readiness → Execute → Evidence → Human decision → Memory.

4. **#265 · Sponsor Intelligence**
   - rebase after #263 because both touch ProductJourneyNav;
   - keep Sponsors as a primary workspace.

5. **#266 · Contract Intelligence**
   - rebase after #265 because both touch ProductJourneyNav;
   - keep Contracts secondary until verified legal sources exist.

Do not merge #265 and #266 independently without rebasing after the first navigation change; otherwise the navigation type/item edits may conflict.

After each merge:
- require green Quality Gate;
- deploy one coherent layer at a time;
- visually verify before advancing;
- do not batch all five into one production release.
