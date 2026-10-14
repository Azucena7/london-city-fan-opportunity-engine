// National Rail line status through the TfL Unified API: Southeastern and Thameslink serve
// Hayes, Bromley South and Bromley North. TfL answers anonymous requests and accepts a date
// range, so each upcoming home fixture day is read on its own. Only disruption is kept.

export const RAIL_LINES = ["southeastern", "thameslink"];
export const RAIL_STATIONS = ["Hayes", "Bromley South", "Bromley North"];

// Statuses that are not disruption: normal running or a general notice.
const FINE = /^(good service|no issues|information)$/i;

export function parseRailStatus(payload) {
  if (!Array.isArray(payload)) throw new Error("TfL payload is not a list of lines");
  return payload.flatMap((line) => (line?.lineStatuses ?? [])
    .filter((status) => status?.statusSeverityDescription && !FINE.test(status.statusSeverityDescription.trim()))
    .map((status) => ({
      line: line?.name ?? line?.id ?? "Unknown line",
      status: status.statusSeverityDescription.trim(),
      reason: typeof status.reason === "string" ? status.reason.replace(/\s+/g, " ").trim().slice(0, 280) : null
    })))
    // One entry per line and status: TfL repeats a status for each validity period.
    .filter((item, index, all) => all.findIndex((other) => other.line === item.line && other.status === item.status && other.reason === item.reason) === index);
}

export function railStatusUrl(date, appKey) {
  const url = new URL(`https://api.tfl.gov.uk/Line/${RAIL_LINES.join(",")}/Status/${date}T00:00:00/to/${date}T23:59:59`);
  if (appKey) url.searchParams.set("app_key", appKey);
  return url;
}
