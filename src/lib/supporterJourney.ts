import { calendar, crmTicketingLive } from "@/lib/data";
import { supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";
import { validateAggregate } from "../../scripts/lib/crm-aggregate-validate.mjs";
import type { CrmAudienceDefinition, CrmTicketingFixtureAggregate, CrmTicketingLiveDataset } from "@/lib/models";

// The one place the product reads the club's supporter-journey aggregates from. A signed-in club
// reads its own latest upload (club-scoped, RLS-protected); everyone else, and any club without an
// upload, reads the repository dataset, which in the public build says club data is required.
export async function getSupporterAggregate(clubId?: string | null): Promise<CrmTicketingLiveDataset> {
  if (!clubId || !supabaseConfigured()) return crmTicketingLive;
  try {
    const response = await supabaseRequest(
      `/rest/v1/club_journey_aggregates?club_id=eq.${encodeURIComponent(clubId)}&select=dataset&order=uploaded_at.desc&limit=1`
    );
    if (!response.ok) return crmTicketingLive;
    const rows = await response.json() as Array<{ dataset: unknown }>;
    const dataset = rows[0]?.dataset as CrmTicketingLiveDataset | undefined;
    // Re-check on read: a stored row that breaks the privacy rules is never shown.
    return dataset && dataset.datasetState === "club-aggregate" && validateAggregate(dataset).length === 0 ? dataset : crmTicketingLive;
  } catch {
    return crmTicketingLive;
  }
}

export function journeyForFixture(dataset: CrmTicketingLiveDataset, fixtureId: string | null | undefined): CrmTicketingFixtureAggregate | null {
  if (dataset.datasetState !== "club-aggregate" || !fixtureId) return null;
  return dataset.fixtureSummaries.find((item) => item.fixtureId === fixtureId) ?? null;
}

const fixtureLabel = (fixtureId: string | undefined) => {
  const fixture = calendar.find((item) => item.id === fixtureId);
  return fixture ? `${fixture.opponent} (${fixture.date})` : fixtureId ?? "";
};

/**
 * Audiences worth sending before a fixture: buyers of an earlier fixture who have not bought this
 * one, plus season-ticket no-shows and first-time buyers from the latest earlier fixture.
 */
export function audiencesForFixture(dataset: CrmTicketingLiveDataset, fixtureId: string): CrmAudienceDefinition[] {
  if (dataset.datasetState !== "club-aggregate") return [];
  const definitions = dataset.audienceDefinitions ?? [];
  const earlier = [...new Set(definitions.map((item) => item.criteria.fixture).filter((id): id is string => Boolean(id) && (id as string) < fixtureId))].sort();
  const latest = earlier.at(-1);
  return definitions.filter((item) => item.criteria.notBoughtFixture === fixtureId || (latest && item.criteria.fixture === latest));
}

/** Plain-language criteria a CRM user can rebuild the segment from. */
export function describeAudience(audience: CrmAudienceDefinition) {
  const { criteria } = audience;
  const parts: string[] = [];
  if (criteria.boughtFixture) parts.push(`bought ${fixtureLabel(criteria.boughtFixture)}`);
  if (criteria.notBoughtFixture) parts.push(`has not bought ${fixtureLabel(criteria.notBoughtFixture)}`);
  if (criteria.ticketType === "season") parts.push("holds a season ticket");
  if (criteria.fixture && criteria.scanStatus === "not_scanned") parts.push(`did not scan in at ${fixtureLabel(criteria.fixture)}`);
  if (criteria.fixture && criteria.firstTimeBuyer) parts.push(`first purchase was ${fixtureLabel(criteria.fixture)}`);
  parts.push("has consented to contact");
  return parts.join(" · ");
}

export const AUDIENCE_PURPOSE: Record<CrmAudienceDefinition["purpose"], string> = {
  "repeat-attendance": "Bring last fixture's buyers back",
  "season-ticket-retention": "Re-engage season-ticket holders who missed a match",
  "second-visit": "Turn first-time buyers into a second visit"
};

export function audienceSizeLabel(size: number | null) {
  return size === null ? "Under 10 · size withheld" : `About ${size.toLocaleString("en-GB")}`;
}
