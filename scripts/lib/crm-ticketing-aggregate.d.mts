import type { CrmTicketingLiveDataset } from "../../src/lib/models";

export const SMALL_CELL: number;
export function validateCrmRecords(records: unknown): string[];
export function aggregateCrmRecords(
  records: unknown[],
  options?: { kickoffs?: Record<string, { date: string; kickoff: string }>; upcomingFixtureIds?: string[] }
): CrmTicketingLiveDataset & { datasetState: "club-aggregate" };
