import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const profiles = JSON.parse(await readFile(new URL("data/seed/club-permission-profiles.json", root), "utf8"));
const areas = ["overview", "matchplan", "campaigns", "calendar", "brand", "studio", "audiences", "intelligence", "partners", "talent", "connections", "governance", "results", "users", "licence"];
const actions = ["view", "edit", "approve", "launch", "export", "administer"];
const q = value => { if (!/^[a-z]+$/.test(value)) throw Error("Unsafe permission identifier"); return `'${value}'`; };
const tuples = [];
for (const [role, profile] of Object.entries(profiles)) for (const [area, allowed] of Object.entries(profile.permissions)) {
  if (!areas.includes(area) || !allowed.includes("view")) throw Error("Invalid permission area or missing view");
  for (const action of allowed) {
    if (!actions.includes(action) || ["launch", "export"].includes(action)) throw Error("Invalid baseline action");
    tuples.push(` (${[role, area, action].map(q).join(", ")})`);
  }
}
let sql = await readFile(new URL("supabase/templates/club_access.sql", root), "utf8");
for (const [marker, value] of Object.entries({ ROLES: Object.keys(profiles).map(q).join(", "), AREAS: areas.map(q).join(", "), ACTIONS: actions.map(q).join(", "), DEFAULTS: tuples.join(",\n"), AREA_VALUES: areas.map(x => `(${q(x)})`).join(", "), ACTION_VALUES: actions.map(x => `(${q(x)})`).join(", ") })) sql = sql.replaceAll(`/*${marker}*/`, value);
const path = new URL("supabase/migrations/20261002_club_membership.sql", root);
if (process.argv.includes("--check")) { if (await readFile(path, "utf8") !== sql) throw Error("Permission migration needs regeneration"); }
else await writeFile(path, sql);
