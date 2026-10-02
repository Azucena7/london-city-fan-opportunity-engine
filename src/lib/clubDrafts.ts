import { verifyClubIdentity, privateAccessConfigured } from "./clubAuth";
import { getSupabaseConfiguration } from "./clubConnectionHealth";
import { permits } from "./clubPermissions";

type Environment = Parameters<typeof verifyClubIdentity>[0];
export type MatchDraft = { id: string; club_id: string; opponent: string; match_date: string; objective: string; created_at: string };
export type DraftInput = Pick<MatchDraft, "opponent" | "match_date" | "objective">;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validDraft(input: unknown): input is DraftInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const d = input as Record<string, unknown>;
  return Object.keys(d).length === 3 && typeof d.opponent === "string" && d.opponent === d.opponent.trim()
    && d.opponent.length >= 1 && d.opponent.length <= 120 && typeof d.objective === "string"
    && ["attendance", "repeat", "partners"].includes(d.objective) && typeof d.match_date === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(d.match_date)
    && Number.isFinite(Date.parse(d.match_date)) && new Date(d.match_date).toISOString().slice(0, 10) === d.match_date;
}
// User token, never service-role credentials. Database RLS independently repeats authorization.
export async function accessMatchDrafts(env: Environment, token: string, clubId: string, input?: DraftInput, request: typeof fetch = fetch): Promise<MatchDraft[] | null> {
  if (!uuid.test(clubId) || !privateAccessConfigured(env) || (input !== undefined && !validDraft(input))) return null;
  const identity = await verifyClubIdentity(env, token, request);
  const member = identity?.memberships.find(m => m.clubId === clubId);
  if (!member || !permits(member.permissions, "matchplan", input ? "edit" : "view")) return null;
  const config = getSupabaseConfiguration(env);
  if (config.status !== "configured") return null;
  const url = new URL("/rest/v1/club_match_drafts", config.origin);
  url.searchParams.set("select", "id,club_id,opponent,match_date,objective,created_at");
  if (!input) {
    url.searchParams.set("club_id", `eq.${clubId}`);
    url.searchParams.set("order", "created_at.desc,id.desc");
    url.searchParams.set("limit", "20");
  }
  try {
    const response = await request(url, {
      method: input ? "POST" : "GET", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000),
      headers: { apikey: config.key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      ...(input ? { body: JSON.stringify({ ...input, club_id: clubId, created_by: identity!.userId }) } : {}),
    });
    if (!response.ok) { await response.body?.cancel(); return null; }
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length > (input ? 1 : 20) || (input && rows.length !== 1)) return null;
    for (const r of rows) {
      if (!r || !uuid.test(r.id) || r.club_id !== clubId || !validDraft({ opponent: r.opponent, match_date: r.match_date, objective: r.objective })
        || typeof r.created_at !== "string" || !Number.isFinite(Date.parse(r.created_at))) return null;
    }
    return rows;
  } catch { return null; }
}
