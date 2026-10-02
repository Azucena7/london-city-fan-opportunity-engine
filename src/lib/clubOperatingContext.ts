import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

export type ClubOperatingContext = {
  clubId: string;
  clubName: string;
  role: string;
  connectedChannels: string[];
  priorityObjectives: string[];
  fixtureSource: string;
  approvalOwner?: string;
  approvalRequired?: boolean;
  brandTone?: string;
  brandMustAvoid?: string;
};

export async function getCurrentClubOperatingContext(): Promise<ClubOperatingContext | null> {
  if (!supabaseConfigured()) return null;

  const user = await currentSupabaseUser();
  if (!user) return null;

  const membershipResponse = await supabaseRequest(
    `/rest/v1/club_memberships?user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=club_id,role&order=created_at.asc&limit=1`
  );
  if (!membershipResponse.ok) return null;

  const memberships = await membershipResponse.json() as Array<{ club_id: string; role: string }>;
  const membership = memberships[0];
  if (!membership) return null;

  const [clubResponse, setupResponse] = await Promise.all([
    supabaseRequest(
      `/rest/v1/clubs?id=eq.${encodeURIComponent(membership.club_id)}&select=id,name&limit=1`
    ),
    supabaseRequest(
      `/rest/v1/club_setup?club_id=eq.${encodeURIComponent(membership.club_id)}&select=fixture_source,connected_channels,priority_objectives,approval_rules,brand_rules&limit=1`
    )
  ]);

  if (!clubResponse.ok) return null;

  const clubs = await clubResponse.json() as Array<{ id: string; name: string }>;
  const club = clubs[0];
  if (!club) return null;

  const setups = setupResponse.ok
    ? await setupResponse.json() as Array<{
        fixture_source?: string;
        connected_channels?: string[];
        priority_objectives?: string[];
        approval_rules?: { owner?: string; required?: boolean };
        brand_rules?: { tone?: string; mustAvoid?: string };
      }>
    : [];
  const setup = setups[0];

  return {
    clubId: club.id,
    clubName: club.name,
    role: membership.role,
    connectedChannels: setup?.connected_channels ?? [],
    priorityObjectives: setup?.priority_objectives ?? [],
    fixtureSource: setup?.fixture_source ?? "manual",
    approvalOwner: setup?.approval_rules?.owner,
    approvalRequired: setup?.approval_rules?.required,
    brandTone: setup?.brand_rules?.tone,
    brandMustAvoid: setup?.brand_rules?.mustAvoid
  };
}
