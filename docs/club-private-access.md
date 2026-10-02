# Private club access foundation

Routes: `/club/sign-in` (entry) and `/club` (server-protected memberships).
The public operations demo stays separate and contains only synthetic data.

Access is OFF by default. Enable only after completing these steps in the approved
Supabase test project:

The installed Vercel integration uses the required custom prefix `CLUB`.
The server reads `CLUB_SUPABASE_URL`, `CLUB_SUPABASE_PUBLISHABLE_KEY` (preferred)
or `CLUB_SUPABASE_ANON_KEY`. If any CLUB variable exists, the entire CLUB
namespace is selected; old unprefixed variables are not mixed or used as fallback.
The app does not read provider secret keys or Postgres credentials for login or health.

1. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (or legacy anon key) in Vercel.
2. Review and apply `supabase/migrations/20261002_club_membership.sql`.
3. Disable public signup in Supabase. Invite test accounts using trusted project
   administration; users must finish the provider's invitation/password setup.
4. Create two test clubs, assign active memberships, and run the SQL isolation
   check. The app cannot invite users or assign/escalate roles.
5. Set `CLUB_PRIVATE_ACCESS_ENABLED=true` in PREVIEW only and redeploy. Validate
   actual invited-user login, membership revocation, expiry and cross-club denial.
   Keep production disabled until these checks pass.

The app uses Supabase Auth's password token endpoint and validates the returned
token through `/auth/v1/user`, then fetches only that user's active memberships
through the Data API with the user's token. Both an explicit user filter and RLS
apply. User metadata, form inputs and simulated demo roles cannot grant access.
Provider redirects, arbitrary endpoints and privileged keys are rejected.

Session cookie: `__Host-club-session`, Secure, HttpOnly, SameSite=Lax, Path=/,
no Domain, maximum one hour. No refresh token, password or email is retained in
app storage or returned to client components. Expiry requires another login.
Next Server Actions provide same-origin submission checks. Every private page
revalidates the user and membership without shared caching. Provider failure
denies access. Sign-out clears the app cookie; already issued JWTs can remain
valid until expiry. Provider rate limits must remain enabled; CAPTCHA-enabled
projects need a future CAPTCHA flow and fail closed with this form.

Not yet implemented: private campaign persistence, member administration UI,
password recovery UI, MFA/SSO, immutable audit, external campaign execution.
No real user login or SQL test has been run while production configuration is
missing. Unit tests with mocked provider responses do not prove database RLS.

References:
- https://github.com/supabase/auth/blob/master/openapi.yaml
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://nextjs.org/docs/app/guides/data-security
