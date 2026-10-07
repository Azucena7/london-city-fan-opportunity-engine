import { cookies } from "next/headers";

const ACCESS_COOKIE = "avela-sb-access";
function resolveSupabaseUrl() {
  return process.env.CLUB_SUPABASE_URL
    || process.env.NEXT_PUBLIC_CLUB_SUPABASE_URL;
}

function resolveSupabaseKey() {
  return process.env.CLUB_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_CLUB_SUPABASE_PUBLISHABLE_KEY;
}

function resolveSupabaseServerKey() {
  return process.env.CLUB_SUPABASE_SECRET_KEY
    || process.env.CLUB_SUPABASE_SERVICE_ROLE_KEY;
}

export function supabaseConfigured() {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseKey());
}

export function supabaseServerConfigured() {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseServerKey());
}

export function supabasePublicConfig() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function setSessionCookie(accessToken: string, expiresIn = 3600) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: expiresIn
  });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
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

export async function supabaseServerRequest(path: string, init: RequestInit = {}) {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseServerKey();
  if (!url || !key) throw new Error("Supabase server credentials are not configured.");
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");

  return fetch(`${url.replace(/\/$/, "")}${path}`, {
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
