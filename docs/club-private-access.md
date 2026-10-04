# Private club access foundation

Canonical routes: `/app/access` for sign-in and club-access requests, and `/app` for the authenticated club workspace.
The guided public product demo is `/app/demo` and contains only synthetic/demo-safe data.

## Supabase namespace

The installed Vercel Supabase integration uses the required custom prefix `CLUB`.
The server prefers `CLUB_SUPABASE_URL` plus `CLUB_SUPABASE_PUBLISHABLE_KEY` and accepts the integration-provided `NEXT_PUBLIC_CLUB_*` equivalents. `CLUB_SUPABASE_ANON_KEY` remains supported only as an older key name inside the same CLUB namespace.

Namespace selection is atomic: if any CLUB Supabase variable exists, the server uses only CLUB / NEXT_PUBLIC_CLUB variables and never mixes in unprefixed `SUPABASE_*` values. Unprefixed variables are retained only as a compatibility fallback for environments where no CLUB namespace exists at all. The app does not use provider secret keys or Postgres credentials for login.

## Current access and persistence flow

Supabase Auth handles identity. Authentication alone does not grant club access: active membership and row-level security determine the clubs and actions available to a user.

The current product includes:
- sign-in and account creation through the Supabase Auth endpoints;
- club access requests and admin approval through `club_access_requests`;
- membership and permission checks through `club_memberships` and `club_has_permission`;
- persistent campaign workspaces in `campaign_workspaces`;
- a persistent credit ledger in `credit_ledger`;
- club setup context protected by the same membership boundary.

The server validates the current access token against `/auth/v1/user` and all private domain data remains subject to RLS. Application inputs and user metadata cannot self-grant club membership or elevate permissions.

Session state persists only the short-lived Supabase access token in an HttpOnly, SameSite=Lax cookie. The cookie is marked Secure in production and expires with the access token. Refresh tokens are not stored because the current server does not implement token refresh; an expired session requires sign-in again. Private requests are uncached and revalidate the authenticated user before accessing club-scoped data.

## Operational checks before a real club pilot

1. Keep the installed `CLUB_SUPABASE_URL` and `CLUB_SUPABASE_PUBLISHABLE_KEY` variables in Vercel.
2. Apply only migrations that have not already been applied to the target Supabase project. Never rewrite an applied migration.
3. Keep public signup policy aligned with the pilot model and validate the intended invite / account-creation path.
4. Test at least two clubs and two roles for cross-club isolation, revocation, expiry and permission denial.
5. Validate sign-in, access requests, approval, campaign persistence and credit-ledger writes in Preview before relying on the workflow in Production.

The public guided demo at `/app/demo` cannot grant private club access.

References:
- https://github.com/supabase/auth/blob/master/openapi.yaml
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://nextjs.org/docs/app/guides/data-security
