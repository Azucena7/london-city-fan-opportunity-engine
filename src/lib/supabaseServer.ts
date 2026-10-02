import { cookies } from "next/headers";

const ACCESS_COOKIE = "fge-sb-access";
const REFRESH_COOKIE = "fge-sb-refresh";

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY));
}

export function supabasePublicConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function setSessionCookies(accessToken: string, refreshToken: string, expiresIn = 3600) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: expiresIn
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key } = supabasePublicConfig();
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${token || key}`);
  headers.set("Content-Type", "application/json");

  return fetch(`${url}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}

export async function currentSupabaseUser() {
  if (!supabaseConfigured()) return null;
  const token = await getAccessToken();
  if (!token) return null;
  const response = await supabaseRequest("/auth/v1/user");
  if (!response.ok) return null;
  return response.json() as Promise<{ id: string; email?: string }>;
}
