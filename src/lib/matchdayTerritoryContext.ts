import { grassroots, territories, crmTicketingLive } from "@/lib/data";

export function getMatchdayTerritoryContext() {
  const priorityTerritories = [...territories]
    .sort((a,b) => (Number(b.opportunityScore ?? 0) - Number(a.opportunityScore ?? 0)))
    .slice(0, 6)
    .map((item) => ({
      id: String(item.lsoaCode ?? item.name ?? ""),
      name: String(item.name ?? item.lsoaName ?? "Unknown territory"),
      borough: String(item.borough ?? ""),
      opportunityScore: Number(item.opportunityScore ?? 0),
      familyDensity: typeof item.familyDensity === "number" ? item.familyDensity : null,
      girlsNetworkScore: typeof item.girlsNetworkScore === "number" ? item.girlsNetworkScore : null,
      sundayTravelMinutes: typeof item.sundayTravelMinutes === "number" ? item.sundayTravelMinutes : null,
      transfers: typeof item.transfers === "number" ? item.transfers : null
    }));

  const publicCommunityNodes = grassroots.map((item: any) => ({
    name: String(item.name ?? "Community node"),
    operator: String(item.operator ?? ""),
    postcode: String(item.postcode ?? ""),
    lat: typeof item.lat === "number" ? item.lat : null,
    lon: typeof item.lon === "number" ? item.lon : null,
    strength: typeof item.strength === "number" ? item.strength : null,
    sourceUrl: String(item.sourceUrl ?? "")
  }));

  return {
    geographySource: "ONS Census 2021 / Census geographies / LSOA public sources",
    priorityTerritories,
    publicCommunityNodes,
    authorisedPostcodeState: crmTicketingLive.datasetState,
    authorisedPostcodeNote: crmTicketingLive.note.en,
    privacyRule: "Supporter postcode sectors are used only from authorised club aggregates; exact supporter postcodes are not exposed in Matchday Companion."
  };
}
