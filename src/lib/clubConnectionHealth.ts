type Environment = { SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string; SUPABASE_ANON_KEY?: string };
type HealthState = "missing_configuration" | "invalid_configuration" | "available" | "credentials_rejected" | "unavailable";

export type ClubConnectionHealth = {
  authService: HealthState;
  privateWorkspaceReady: false;
  databaseAccess: "not_verified";
  clubIsolation: "not_verified";
};

function result(authService: HealthState): ClubConnectionHealth {
  return { authService, privateWorkspaceReady: false, databaseAccess: "not_verified", clubIsolation: "not_verified" };
}

// Only low-privilege keys may be used. Decoding the legacy role is a filter,
// not JWT verification: Supabase verifies the credential on the request.
function lowPrivilegeKey(key: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) return true;
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return false;
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    return payload.role === "anon";
  } catch { return false; }
}

export async function checkClubConnection(env: Environment, request: typeof fetch = fetch): Promise<ClubConnectionHealth> {
  const url = env.SUPABASE_URL?.trim();
  const key = (env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY)?.trim();
  if (!url || !key) return result("missing_configuration");
  if (key.length > 4096 || !lowPrivilegeKey(key)) return result("invalid_configuration");
  let origin: URL;
  try { origin = new URL(url); } catch { return result("invalid_configuration"); }
  // Fixed provider, HTTPS, no credentials, ports, redirects or user input.
  if (origin.protocol !== "https:" || !/^[a-z0-9]{20}\.supabase\.co$/.test(origin.hostname)
    || origin.port || origin.username || origin.password || origin.pathname !== "/"
    || origin.search || origin.hash) return result("invalid_configuration");
  try {
    const response = await request(new URL("/auth/v1/health", origin), {
      method: "GET", headers: { apikey: key }, redirect: "error",
      cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    // No provider bodies, versions, error messages, URLs or keys leave the server.
    await response.body?.cancel();
    if (response.status === 401 || response.status === 403) return result("credentials_rejected");
    return result(response.status === 200 ? "available" : "unavailable");
  } catch { return result("unavailable"); }
}
