# Private match drafts — first persistence increment

Status: implementation ready; migration not yet applied to the connected database.
The private login feature remains disabled. This change does not invite users,
activate memberships, grant new role overrides or send campaigns.

## Scope

Authenticated members with `matchplan:view` can retrieve their club's most recent
20 drafts. Members with `matchplan:edit` can create a draft with opponent, date
and one objective (attendance, repeat visits or partners). Successful saving is
reported only after the provider returns a validated row. No public demo state
is imported, and no failure falls back to synthetic rows.

Drafts are immutable in this increment: no update/delete endpoint or database
grant, no approvals, tasks, generated assets, launches or exports. This is not
the complete operational workspace.

## Deployment gate

1. Apply `supabase/migrations/20261002_club_match_drafts.sql` after membership schema.
2. In a rollback-only database test, verify two clubs cannot see each other's
   drafts, a read-only profile cannot insert, and inactive membership is denied.
3. Confirm creation/retrieval with an explicitly authorized test account. Do not
   enable private login or invite a user implicitly.
4. Then add revision-safe editing, action/task persistence and auditable reviews.

Application tests cover identity verification, permission restrictions,
cross-club responses, provider failures and input validation. They do not replace
live database isolation tests or an authenticated browser walkthrough.
