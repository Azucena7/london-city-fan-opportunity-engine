// Turns a manual Google Trends CSV export ("Download CSV" on an Explore chart) into a measured
// snapshot of one search-demand comparison set. Trends values are a 0–100 index relative to
// the terms, market and window of that export; they are never search volumes.

const MARKET_GEO = { GB: /united kingdom|reino unido/i, ES: /spain|españa/i };
const TIME_HEADER = /^(week|day|month|time|date|semana|día|dia|mes|fecha)$/i;

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

function normaliseDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  const instant = /^\d{4}-\d{2}-\d{2}T/.test(value) ? value.slice(0, 10) : null;
  if (instant) return instant;
  throw new Error(`Unrecognised date "${value}"; expected YYYY-MM-DD or YYYY-MM`);
}

function parseValue(raw) {
  if (raw === "<1") return { value: 0, belowOne: true };
  if (!/^\d{1,3}$/.test(raw) || Number(raw) > 100) throw new Error(`Index value "${raw}" is outside 0–100`);
  return { value: Number(raw), belowOne: false };
}

/** Parses a Trends "multiTimeline" CSV into column queries and dated values. */
export function parseTrendsCsv(text) {
  const rows = text.replace(/^﻿/, "").split(/\r?\n/).map(splitCsvLine).filter((row) => row.some(Boolean));
  const headerIndex = rows.findIndex((row) => row.length >= 2 && TIME_HEADER.test(row[0]));
  if (headerIndex < 0) throw new Error("No time-series header found: the first column must be Week, Day, Month or Time");
  const columns = rows[headerIndex].slice(1).map((header) => {
    const match = header.match(/^(.*?)(?::\s*\((.*)\))?$/);
    return { query: match[1].trim(), geo: match[2]?.trim() ?? null };
  });
  const points = rows.slice(headerIndex + 1).map((row) => {
    if (row.length !== columns.length + 1) throw new Error(`Row "${row.join(",")}" does not have ${columns.length} values`);
    return { date: normaliseDate(row[0]), values: row.slice(1).map(parseValue) };
  });
  if (!points.length) throw new Error("The export has no data rows");
  return { columns, points };
}

/**
 * Appends a measured snapshot to the comparison set. Every term of the set must appear in the
 * export, and nothing else, so values stay comparable only within their own comparison set.
 */
export function applyTrendsExport(data, setId, parsed, observedAt) {
  const market = data.markets.find((item) => item.comparisonSets.some((set) => set.id === setId));
  if (!market) throw new Error(`Unknown comparison set: ${setId}`);
  const set = market.comparisonSets.find((item) => item.id === setId);

  for (const column of parsed.columns) {
    if (column.geo && !MARKET_GEO[market.code].test(column.geo)) {
      throw new Error(`"${column.query}" was exported for ${column.geo}, but ${setId} is the ${market.code} market`);
    }
  }
  const columnOf = new Map(parsed.columns.map((column, index) => [column.query.toLowerCase(), index]));
  const missing = set.terms.filter((term) => !columnOf.has(term.query.toLowerCase()));
  if (missing.length) throw new Error(`The export is missing ${missing.map((term) => `"${term.query}"`).join(", ")} for ${setId}`);
  if (parsed.columns.length !== set.terms.length) {
    throw new Error(`The export compares ${parsed.columns.length} terms; ${setId} compares exactly ${set.terms.length}`);
  }

  let belowOne = false;
  const series = parsed.points.flatMap((point) => set.terms.map((term) => {
    const cell = point.values[columnOf.get(term.query.toLowerCase())];
    belowOne ||= cell.belowOne;
    return { date: point.date, termId: term.id, value: cell.value };
  }));
  const from = parsed.points[0].date;
  const to = parsed.points[parsed.points.length - 1].date;
  const lowNote = belowOne
    ? { en: " Cells Trends reports as \"<1\" are stored as 0: below 1, not zero searches.", es: " Las celdas que Trends marca como \"<1\" se guardan como 0: inferior a 1, no cero búsquedas." }
    : { en: "", es: "" };

  set.snapshots.push({
    observedAt,
    state: "measured",
    series,
    note: {
      en: `Manual Google Trends export, ${from} to ${to}. A 0–100 index relative to this comparison set and market, not search volume.${lowNote.en}`,
      es: `Exportación manual de Google Trends, ${from} a ${to}. Índice 0–100 relativo a este grupo de comparación y mercado, no volumen de búsqueda.${lowNote.es}`
    }
  });

  data.checkedAt = observedAt;
  const everySetMeasured = data.markets.every((item) => item.comparisonSets.every((entry) => entry.snapshots.some((snapshot) => snapshot.state === "measured")));
  if (everySetMeasured) data.status = "baseline-ready";
  return { market: market.code, setId, points: parsed.points.length, from, to, status: data.status };
}

/** Records the successful manual capture in the source register; the access path is unchanged. */
export function markTrendsCaptured(health, observedAt) {
  return {
    ...health,
    sources: health.sources.map((source) => source.id !== "google-trends" ? source : {
      ...source,
      state: "operational",
      lastSuccessfulAt: observedAt,
      lastAttemptAt: observedAt,
      note: {
        en: "Measured from manual Explore exports until official API access is granted. Each index is relative to its own comparison set.",
        es: "Medido con exportaciones manuales de Explore hasta tener acceso a la API oficial. Cada índice es relativo a su propio grupo de comparación."
      }
    })
  };
}
