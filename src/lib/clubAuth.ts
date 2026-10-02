import { getSupabaseConfiguration } from "./clubConnectionHealth";

type Environment = Parameters<typeof getSupabaseConfiguration>[0] & { CLUB_PRIVATE_ACCESS_ENABLED?: string };
export type ClubMembership = { clubId: string; clubName: string; role: "admin" | "operator" | "approver" | "viewer" };
export type ClubIdentity = { userId: string; memberships: ClubMembership[] };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const roles = new Set(["admin", "operator", "approver", "viewer"]);
const tokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function privateAccessConfigured(env: Environment): boolean {
  return env.CLUB_PRIVATE_ACCESS_ENABLED === "true" && getSupabaseConfiguration(env).status === "configured";
}

function provider(env: Environment, request: typeof fetch) {
  const config = getSupabaseConfiguration(env);
  if (!privateAccessConfigured(env) || config.status !== "configured") return null;
  return async (path: string, token?: string, body?: object): Promise<unknown> => {
    try {
      const response = await request(new URL(path, config.origin), {
        method: body ? "POST" : "GET", redirect: "error", cache: "no-store",
        signal: AbortSignal.timeout(5000), headers: {
          apikey: config.key, "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }, ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) { await response.body?.cancel(); return null; }
      return await response.json();
    } catch { return null; }
  };
}

export async function verifyClubIdentity(env: Environment, token: string, request: typeof fetch = fetch): Promise<ClubIdentity | null> {
  const call = provider(env, request);
  if (!call || token.length > 3500 || !tokenPattern.test(token)) return null;
  const user = await call("/auth/v1/user", token) as { id?: unknown } | null;
  if (!user || typeof user.id !== "string" || !uuid.test(user.id)) return null;
  // Provider-verified identity, explicit user filter AND database RLS.
  // Never trust user_metadata, a role selector or a club supplied by the browser.
  const rows = await call(`/rest/v1/club_memberships?select=club_id,role,clubs(name)&user_id=eq.${user.id}&active=eq.true&limit=101`, token);
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 100) return null;
  const memberships: ClubMembership[] = [];
  for (const row of rows) {
    if (!row || !uuid.test(row.club_id) || !roles.has(row.role)
      || !row.clubs || typeof row.clubs.name !== "string" || row.clubs.name.length > 120) return null;
    memberships.push({ clubId: row.club_id, clubName: row.clubs.name, role: row.role });
  }
  return { userId: user.id, memberships };
}

export async function signInClub(env: Environment, email: string, password: string, request: typeof fetch = fetch): Promise<{ token: string; maxAge: number } | null> {
  const call = provider(env, request);
  if (!call || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !password || password.length > 1024) return null;
  const session = await call("/auth/v1/token?grant_type=password", undefined, { email, password }) as { access_token?: unknown; expires_in?: unknown } | null;
  if (!session || typeof session.access_token !== "string" || typeof session.expires_in !== "number"
    || !Number.isFinite(session.expires_in) || session.expires_in < 1) return null;
  if (!await verifyClubIdentity(env, session.access_token, request)) return null;
  // Refresh tokens and passwords are never retained. Reauthentication on expiry.
  return { token: session.access_token, maxAge: Math.min(3600, Math.floor(session.expires_in)) };
}
