# Private club access foundation

Canonical routes: `/app/access` for sign-in/access setup and `/app` for the club workspace.
The guided public product demo is `/app/demo` and contains only synthetic/demo-safe data.

Access is OFF by default. Enable only after completing these steps in the approved
Supabase test project:

The installed Vercel integration uses the required custom prefix `CLUB`.
The server reads `CLUB_SUPABASE_URL`, `CLUB_SUPABASE_PUBLISHABLE_KEY` (preferred)
or `CLUB_SUPABASE_ANON_KEY`. If any CLUB variable exists, the entire CLUB
namespace is selected; old unprefixed variables are not mixed or used as fallback.
The app does not read provider secret keys or Postgres credentials for login.

1. Keep the installed `CLUB_SUPABASE_URL` and `CLUB_SUPABASE_PUBLISHABLE_KEY` (or legacy CLUB anon key) in Vercel.
2. Review and apply `supabase/migrations/20261002_club_membership.sql` only to a database that has not already received it.
3. Disable public signup in Supabase. Invite test accounts using trusted project administration; users must finish the provider's invitation/password setup.
4. Create two test clubs, assign active memberships, and run the SQL isolation check. The app cannot invite users or assign/escalate roles.
5. Set `CLUB_PRIVATE_ACCESS_ENABLED=true` in PREVIEW only and redeploy. Validate actual invited-user login, membership revocation, expiry and cross-club denial. Keep production disabled until these checks pass.

The app uses Supabase Auth's password token endpoint and validates the returned token through `/auth/v1/user`, then fetches only that user's active memberships through the Data API with the user's token. Both an explicit user filter and RLS apply. User metadata and form inputs cannot grant access. Provider redirects, arbitrary endpoints and privileged keys are rejected.

Session cookie: `__Host-club-session`, Secure, HttpOnly, SameSite=Lax, Path=/,
no Domain, maximum one hour. No refresh token, password or email is retained in
app storage or returned to client components. Expiry requires another login.
Private pages revalidate the user and membership without shared caching. Provider failure
denies access.

Not yet implemented: private campaign persistence, member administration UI,
password recovery UI, MFA/SSO, immutable audit and external campaign execution.
On 2026-10-02 the fresh schema was applied to the configured Supabase test project.
Live SQL tests passed for isolation, read-only access, role escalation prevention,
individual grants/denials, view-deny precedence and revocation. Synthetic accounts
and clubs were rolled back after testing. No real invited-user login has been
validated for production, and production private access remains disabled.

Profiles: admin, marketing, communications, ticketing, business, compliance,
direction and viewer. No baseline grants launch/export. Application users cannot
write membership roles, overrides or role templates. Private identity verification
gets effective permissions from club_permission_matrix using the user token.
New domain tables must enforce club_has_permission in their RLS; application
endpoints must also use requireClubPermission. Helpers do not replace domain RLS.

The public guided demo at `/app/demo` cannot grant access. Regenerate an unapplied
schema with `node scripts/generate-club-permissions-migration.mjs`; use `--check`
to detect drift. The 20261002 migration must not be overwritten for deployed
databases; future changes require a new migration.

References:
- https://github.com/supabase/auth/blob/master/openapi.yaml
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://nextjs.org/docs/app/guides/data-security
