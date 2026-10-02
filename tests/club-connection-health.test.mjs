import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/lib/clubConnectionHealth.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { checkClubConnection: check, getSupabaseConfiguration: configuration } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const jwt = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
const env = { SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co", SUPABASE_ANON_KEY: jwt("anon") };
test("missing config does not make a request", async () => {
  const value = await check({}, () => { throw Error("must not request"); });
  assert.equal(value.authService, "missing_configuration");
});
test("rejects privileged keys and arbitrary request destinations before sending anything", async () => {
  const variants = [
    { SUPABASE_ANON_KEY: jwt("service_role") }, { SUPABASE_ANON_KEY: "sb_secret_secret" },
    { SUPABASE_ANON_KEY: "invalid" }, { SUPABASE_URL: "http://abcdefghijklmnopqrst.supabase.co" },
    { SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co.evil.test" },
    { SUPABASE_URL: "https://user:password@abcdefghijklmnopqrst.supabase.co" },
    { SUPABASE_URL: `${env.SUPABASE_URL}/rest/v1/clients` },
    { SUPABASE_URL: `${env.SUPABASE_URL}?secret=value` },
    { SUPABASE_URL: "https://127.0.0.1" },
  ];
  for (const patch of variants) assert.equal((await check({ ...env, ...patch }, () => { throw Error("must not request"); })).authService, "invalid_configuration");
});
test("health request is bounded, fixed and never establishes workspace or database readiness", async () => {
  const value = await check(env, async (url, options) => {
    assert.equal(String(url), `${env.SUPABASE_URL}/auth/v1/health`);
    assert.equal(options.headers.apikey, env.SUPABASE_ANON_KEY);
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response("provider details", { status: 200 });
  });
  assert.deepEqual(value, { authService: "available", privateWorkspaceReady: false, databaseAccess: "not_verified", clubIsolation: "not_verified" });
  assert.ok(!JSON.stringify(value).includes("provider"));
});
test("publishable keys are accepted; bad configured publishable key does not silently fall back", async () => {
  assert.equal((await check({ ...env, SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(24)}` }, async () => new Response(null, { status: 200 }))).authService, "available");
  assert.equal((await check({ ...env, SUPABASE_PUBLISHABLE_KEY: "sb_secret_secret" })).authService, "invalid_configuration");
});
test("credential, provider and transport failures expose no raw errors", async () => {
  for (const [status, expected] of [[401, "credentials_rejected"], [403, "credentials_rejected"], [302, "unavailable"], [500, "unavailable"]]) {
    assert.equal((await check(env, async () => new Response("private error", { status }))).authService, expected);
  }
  assert.equal((await check(env, async () => { throw Error("key and URL must stay private"); })).authService, "unavailable");
});
test("CLUB integration namespace takes precedence as a complete pair", async () => {
  const club = { CLUB_SUPABASE_URL: env.SUPABASE_URL, CLUB_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"c".repeat(24)}` };
  const settings = { ...env, SUPABASE_URL: "https://wrong.invalid", ...club };
  const selected = configuration(settings);
  assert.equal(selected.status, "configured");
  assert.equal(selected.origin.origin, club.CLUB_SUPABASE_URL);
  assert.equal(selected.key, club.CLUB_SUPABASE_PUBLISHABLE_KEY);
  assert.equal((await check(settings, async () => new Response(null, { status: 200 }))).authService, "available");
});
test("incomplete or privileged CLUB configuration cannot fall back or mix projects", async () => {
  for (const patch of [{ CLUB_SUPABASE_URL: env.SUPABASE_URL }, { CLUB_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY }, { CLUB_SUPABASE_URL: "" }]) {
    assert.equal(configuration({ ...env, ...patch }).status, "missing_configuration");
  }
  assert.equal(configuration({ ...env, CLUB_SUPABASE_URL: env.SUPABASE_URL, CLUB_SUPABASE_PUBLISHABLE_KEY: "sb_secret_secret", CLUB_SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY }).status, "invalid_configuration");
});
