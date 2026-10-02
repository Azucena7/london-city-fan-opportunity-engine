# Club private workspace readiness

`GET /api/club/connection-health` checks Supabase Auth health using existing server
environment variables. Prefer `SUPABASE_PUBLISHABLE_KEY`; `SUPABASE_ANON_KEY` is
supported for existing installations. Only the legacy `anon` role is accepted.
Secret and service-role keys are rejected. Do not paste credentials into chat.

The only outgoing request is GET to the configured hosted Supabase project's
`/auth/v1/health`. No customer records, tables, sign-in messages or database
connection strings are accessed. The route returns generic statuses, rejects
redirects, times out after five seconds, and caches results for one minute.

`available` means the Auth health endpoint responded with HTTP 200. It does not
prove that login, club membership, RLS, database access or audit persistence works.
The workspace remains explicitly not ready. The existing club operations demo
still runs with synthetic data and simulated roles.

Next implementation gates:

1. Validate an authorised Supabase project and its current Auth configuration.
2. Implement invitation-only login, server-validated sessions and club membership.
3. Apply club-scoped tables and default-deny RLS, with role-based write checks.
4. Verify cross-club denial and append-only server audit records using test clubs.
5. Persist approved plans and creatives before connecting external launch channels.

References: https://supabase.com/docs/guides/getting-started/api-keys and
https://supabase.com/docs/guides/troubleshooting/how-do-i-check-gotrueapi-version-of-a-supabase-project-lQAnOR
