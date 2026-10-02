import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const config = compile(await readFile(new URL("../src/lib/clubConnectionHealth.ts", import.meta.url), "utf8"));
const source = (await readFile(new URL("../src/lib/clubAuth.ts", import.meta.url), "utf8")).replace('"./clubConnectionHealth"', JSON.stringify(config));
const auth = await import(compile(source));
const user = "10000000-0000-0000-0000-000000000001";
const club = "20000000-0000-0000-0000-000000000001";
const token = "header.payload.signature";
const env = { SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co", SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(24)}`, CLUB_PRIVATE_ACCESS_ENABLED: "true" };
const membership = { club_id: club, role: "operator", clubs: { name: "Test club" } };
function provider({ users = { id: user }, rows = [membership], session = { access_token: token, expires_in: 7200 }, status = 200 } = {}) {
  return async (url, options) => {
    const u = new URL(url);
    assert.equal(u.origin, env.SUPABASE_URL);
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    if (u.pathname === "/auth/v1/token") {
      assert.equal(u.searchParams.get("grant_type"), "password");
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), { email: "test@example.test", password: "test password" });
      return Response.json(session, { status });
    }
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    if (u.pathname === "/auth/v1/user") return Response.json(users, { status });
    assert.equal(u.pathname, "/rest/v1/club_memberships");
    assert.equal(u.searchParams.get("user_id"), `eq.${user}`);
    assert.equal(u.searchParams.get("active"), "eq.true");
    return Response.json(rows, { status });
  };
}
test("private login is off by default and rejects unsafe provider config without requests", async () => {
  for (const patch of [{ CLUB_PRIVATE_ACCESS_ENABLED: undefined }, { SUPABASE_URL: "https://evil.test" }, { SUPABASE_PUBLISHABLE_KEY: "sb_secret_secret" }]) {
    const e = { ...env, ...patch };
    assert.equal(auth.privateAccessConfigured(e), false);
    assert.equal(await auth.signInClub(e, "test@example.test", "test password", () => { throw Error("no request"); }), null);
  }
});
test("server-verified session plus current membership are required; expiry is bounded", async () => {
  assert.deepEqual(await auth.signInClub(env, "test@example.test", "test password", provider()), { token, maxAge: 3600 });
  assert.deepEqual(await auth.verifyClubIdentity(env, token, provider()), { userId: user, memberships: [{ clubId: club, clubName: "Test club", role: "operator" }] });
});
test("JWT claims and user metadata cannot grant club access", async () => {
  assert.equal(await auth.verifyClubIdentity(env, token, provider({ users: { id: user, user_metadata: { role: "admin", club_id: club } }, rows: [] })), null);
  assert.equal(await auth.verifyClubIdentity(env, token, provider({ users: { id: "unverified" } })), null);
  assert.equal(await auth.verifyClubIdentity(env, "malformed", () => { throw Error("no request"); }), null);
});
test("revoked membership, unreadable schema and provider failure deny access", async () => {
  assert.equal(await auth.signInClub(env, "test@example.test", "test password", provider({ rows: [] })), null);
  for (const status of [401, 403, 429, 500]) assert.equal(await auth.verifyClubIdentity(env, token, provider({ status })), null);
  assert.equal(await auth.verifyClubIdentity(env, token, async () => { throw Error("private provider details"); }), null);
});
test("invalid roles, club IDs, hidden clubs and malformed memberships deny access", async () => {
  for (const row of [{ ...membership, role: "superadmin" }, { ...membership, club_id: "wrong" }, { ...membership, clubs: null }]) {
    assert.equal(await auth.verifyClubIdentity(env, token, provider({ rows: [row] })), null);
  }
  assert.equal(await auth.verifyClubIdentity(env, token, provider({ rows: { role: "admin" } })), null);
});
test("invalid provider sessions never produce an app cookie", async () => {
  for (const session of [{ access_token: "invalid", expires_in: 100 }, { access_token: token, expires_in: -1 }, { access_token: token, expires_in: null }]) {
    assert.equal(await auth.signInClub(env, "test@example.test", "test password", provider({ session })), null);
  }
});
