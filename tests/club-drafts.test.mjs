import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const config = compile(await readFile(new URL("../src/lib/clubConnectionHealth.ts", import.meta.url), "utf8"));
const permissions = compile((await readFile(new URL("../src/lib/clubPermissions.ts", import.meta.url), "utf8")).replace(/import raw from [^;]+;/, `const raw = ${await readFile(new URL("../data/seed/club-permission-profiles.json", import.meta.url), "utf8")};`));
const auth = compile((await readFile(new URL("../src/lib/clubAuth.ts", import.meta.url), "utf8")).replace('"./clubConnectionHealth"', JSON.stringify(config)).replace('"./clubPermissions"', JSON.stringify(permissions)));
const api = await import(compile((await readFile(new URL("../src/lib/clubDrafts.ts", import.meta.url), "utf8")).replace('"./clubAuth"', JSON.stringify(auth)).replace('"./clubConnectionHealth"', JSON.stringify(config)).replace('"./clubPermissions"', JSON.stringify(permissions))));
const club = "20000000-0000-0000-0000-000000000001";
const other = "20000000-0000-0000-0000-000000000002";
const user = "10000000-0000-0000-0000-000000000001";
const token = "header.payload.signature";
const env = { SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co", SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(24)}`, CLUB_PRIVATE_ACCESS_ENABLED: "true" };
const input = { opponent: "Test opponent", match_date: "2026-10-18", objective: "repeat" };
const row = { ...input, id: other, club_id: club, created_at: "2026-10-02T12:00:00Z" };
function provider({ edit = true, rows = [row], failure = false, active = true } = {}) {
  let calls = 0;
  const request = async (url, options) => {
    const u = new URL(url);
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    if (u.pathname === "/auth/v1/user") return Response.json({ id: user });
    if (u.pathname === "/rest/v1/club_memberships") return Response.json(active ? [{ club_id: club, role: "marketing", clubs: { name: "Test" } }] : []);
    if (u.pathname === "/rest/v1/rpc/club_permission_matrix") return Response.json(["view", ...(edit ? ["edit"] : [])].map(action => ({ club_id: club, area: "matchplan", action })));
    assert.equal(u.pathname, "/rest/v1/club_match_drafts");
    calls++;
    if (options.method === "POST") assert.deepEqual(JSON.parse(options.body), { ...input, club_id: club, created_by: user });
    else { assert.equal(u.searchParams.get("club_id"), `eq.${club}`); assert.equal(u.searchParams.get("limit"), "20"); }
    return Response.json(rows, { status: failure ? 503 : 200 });
  };
  return { request, calls: () => calls };
}
test("drafts validate dates, size, objectives and reject injected approval fields", () => {
  assert.equal(api.validDraft(input), true);
  for (const patch of [{ opponent: " " }, { opponent: "a".repeat(121) }, { match_date: "2026-02-30" }, { objective: "launch" }, { approved: true }, { club_id: other }]) assert.equal(api.validDraft({ ...input, ...patch }), false);
});
test("private drafts use current identity and filter by the authorized club", async () => {
  const p = provider();
  assert.deepEqual(await api.accessMatchDrafts(env, token, club, undefined, p.request), [row]);
  assert.deepEqual(await api.accessMatchDrafts(env, token, club, input, p.request), [row]);
  assert.equal(p.calls(), 2);
});
test("read-only, revoked membership, foreign club and disabled login cannot write", async () => {
  for (const setup of [{ edit: false }, { active: false }]) {
    const p = provider(setup);
    assert.equal(await api.accessMatchDrafts(env, token, club, input, p.request), null);
    assert.equal(p.calls(), 0);
  }
  const p = provider();
  assert.equal(await api.accessMatchDrafts(env, token, other, input, p.request), null);
  assert.equal(await api.accessMatchDrafts({ ...env, CLUB_PRIVATE_ACCESS_ENABLED: "false" }, token, club, input, p.request), null);
  assert.equal(p.calls(), 0);
});
test("provider errors, malformed results and foreign rows never become success or demo fallback", async () => {
  for (const setup of [{ failure: true }, { rows: [{ ...row, club_id: other }] }, { rows: [] }, { rows: [{ ...row, created_at: "invalid" }] }]) assert.equal(await api.accessMatchDrafts(env, token, club, input, provider(setup).request), null);
});
test("draft SQL enforces RLS and immutable scoped writes without service credentials", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20261002_club_match_drafts.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /created_by = \(select auth.uid\(\)\)/);
  assert.match(sql, /club_has_permission\(club_id, 'matchplan', 'edit'\)/);
  assert.doesNotMatch(sql, /grant (update|delete|all)/i);
  const action = await readFile(new URL("../src/app/club/drafts/actions.ts", import.meta.url), "utf8");
  assert.match(action, /"use server"/);
  assert.match(action, /accessMatchDrafts/);
  assert.doesNotMatch(action, /service_role|localStorage/);
});
