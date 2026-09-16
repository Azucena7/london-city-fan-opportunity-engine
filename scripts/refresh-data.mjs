import { readFile, writeFile } from "node:fs/promises";

const FIXTURES_URL = "https://www.londoncitylionesses.com/fixtures";
const CALENDAR_PATH = new URL("../data/seed/calendar.json", import.meta.url);
const CURRENT_PATH = new URL("../data/live/current.json", import.meta.url);
const SIGNALS_PATH = new URL("../data/live/signals.json", import.meta.url);
const DRY_RUN = process.env.REFRESH_DRY_RUN === "1";

function londonParts(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(value);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function londonIsoDate(value = new Date()) {
  const p = londonParts(value);
  return `${p.year}-${p.month}-${p.day}`;
}

function londonKickoff(date, utcTime) {
  if (!utcTime) return undefined;
  const instant = new Date(`${date}T${utcTime.replace(/\.\d+$/, "")}Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).format(instant);
}

function findCollections(value, name, matches = []) {
  if (!value || typeof value !== "object") return matches;
  if (value[name] && typeof value[name] === "object") matches.push(value[name]);
  for (const child of Object.values(value)) {
    findCollections(child, name, matches);
  }
  return matches;
}

function slug(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 12);
}

function parseWarmup(html) {
  const match = html.match(/<script[^>]+id="wix-warmup-data"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Wix warmup data was not found");
  return JSON.parse(match[1]);
}

function normaliseFixtures(warmup, existing) {
  const fixtures = findCollections(warmup, "Import2")
    .find((collection) => Object.values(collection).some((item) => item?.homeTeam?.title_fld));
  const results = findCollections(warmup, "Import4")
    .find((collection) => Object.values(collection).some((item) => item?.homeTeam?.title_fld)) ?? {};
  if (!fixtures) throw new Error("Official fixture collection was not found");
  const currentByKey = new Map(existing.map((item) => [`${item.date}-${item.opponent}-${item.homeAway}`, item]));
  const resultByKey = new Map();

  for (const result of Object.values(results)) {
    const home = result?.homeTeam?.title_fld;
    const away = result?.awayTeam?.title_fld;
    const rawDate = result?.date?.$date;
    if (!home || !away || !rawDate) continue;
    const date = new Date(rawDate).toISOString().slice(0, 10);
    const homeAway = home === "London City Lionesses" ? "home" : "away";
    const opponent = homeAway === "home" ? away : home;
    resultByKey.set(`${date}-${opponent}-${homeAway}`, {
      for: Number(homeAway === "home" ? result.homeTeamScore : result.awayTeamScore),
      against: Number(homeAway === "home" ? result.awayTeamScore : result.homeTeamScore)
    });
  }

  const today = londonIsoDate();
  const rows = [];
  for (const item of Object.values(fixtures)) {
    const home = item?.homeTeam?.title_fld;
    const away = item?.awayTeam?.title_fld;
    const rawDate = item?.date?.$date;
    if (!home || !away || !rawDate || (home !== "London City Lionesses" && away !== "London City Lionesses")) continue;
    const date = new Date(rawDate).toISOString().slice(0, 10);
    const homeAway = home === "London City Lionesses" ? "home" : "away";
    const opponent = homeAway === "home" ? away : home;
    const key = `${date}-${opponent}-${homeAway}`;
    const previous = currentByKey.get(key) ?? {};
    const result = resultByKey.get(key) ?? previous.result;
    const fetchedKickoff = londonKickoff(date, item.time);
    const unresolvedKickoff = previous.sourceDiscrepancies?.find(
      (discrepancy) => discrepancy.field === "kickoff" && discrepancy.state === "unresolved"
    );
    const kickoff = unresolvedKickoff?.values?.some((value) => value.value === previous.kickoff)
      ? previous.kickoff
      : fetchedKickoff;
    rows.push({
      id: previous.id ?? `${date}-${slug(opponent)}-${homeAway[0]}`,
      date,
      kickoff,
      opponent,
      homeAway,
      competition: item.leagueStageTitle ?? previous.competition ?? "Competition TBC",
      venue: item.location ?? previous.venue ?? "Venue TBC",
      status: result ? "final" : date < today ? "completed-pending-data" : "scheduled",
      ...(result ? { result } : {}),
      ...(previous.attendance ? { attendance: previous.attendance, attendanceState: previous.attendanceState } : {}),
      ...(previous.sourceDiscrepancies?.length ? { sourceDiscrepancies: previous.sourceDiscrepancies } : {})
    });
  }

  for (const [key, result] of resultByKey) {
    if (rows.some((row) => `${row.date}-${row.opponent}-${row.homeAway}` === key)) continue;
    const previous = currentByKey.get(key);
    if (previous) rows.push({ ...previous, status: "final", result });
  }
  for (const previous of existing) {
    const key = `${previous.date}-${previous.opponent}-${previous.homeAway}`;
    const alreadyPresent = rows.some((row) => `${row.date}-${row.opponent}-${row.homeAway}` === key);
    if (!alreadyPresent && previous.date < today) rows.push(previous);
  }
  return rows.sort((a, b) => `${a.date}-${a.kickoff}`.localeCompare(`${b.date}-${b.kickoff}`));
}

function materialChangeCount(before, after) {
  const previous = new Map(before.map((item) => [item.id, item]));
  return after.filter((item) => JSON.stringify(previous.get(item.id)) !== JSON.stringify(item)).length;
}

async function fetchWeather(nextHome) {
  if (!nextHome) return { status: "waiting", reason: "No upcoming home fixture" };
  const days = Math.ceil((new Date(`${nextHome.date}T12:00:00Z`) - new Date()) / 86400000);
  if (days > 16) return { status: "waiting", reason: "Operational forecast window not yet reliable" };
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "51.3908", longitude: "0.0183", timezone: "Europe/London", forecast_days: "16",
    daily: "precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max"
  }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
  const data = await response.json();
  const index = data.daily?.time?.indexOf(nextHome.date) ?? -1;
  if (index < 0) return { status: "waiting", reason: "Fixture date not present in forecast" };
  return {
    status: "forecast", valid_for: nextHome.date, generated_at: new Date().toISOString(),
    precipitation_probability_max: data.daily.precipitation_probability_max?.[index] ?? null,
    precipitation_sum: data.daily.precipitation_sum?.[index] ?? null,
    temperature_max: data.daily.temperature_2m_max?.[index] ?? null,
    temperature_min: data.daily.temperature_2m_min?.[index] ?? null,
    wind_speed_max: data.daily.wind_speed_10m_max?.[index] ?? null,
    source: "Open-Meteo"
  };
}

async function main() {
  const london = londonParts();
  if (process.env.GITHUB_EVENT_NAME === "schedule" && london.hour !== "06") {
    console.log("Not the 06:30 Europe/London run; exiting without changes.");
    return;
  }
  const [existing, current, signals] = await Promise.all([
    readFile(CALENDAR_PATH, "utf8").then(JSON.parse),
    readFile(CURRENT_PATH, "utf8").then(JSON.parse),
    readFile(SIGNALS_PATH, "utf8").then(JSON.parse)
  ]);
  const response = await fetch(FIXTURES_URL, { headers: { "user-agent": "LondonCityFanOpportunityLab/1.0" } });
  if (!response.ok) throw new Error(`Official fixtures page returned ${response.status}`);
  const calendar = normaliseFixtures(parseWarmup(await response.text()), existing);
  const today = londonIsoDate();
  const scheduled = calendar.filter((item) => item.status === "scheduled" && item.date >= today);
  const nextHome = scheduled.find((item) => item.homeAway === "home") ?? null;
  const completedHome = [...calendar].reverse().find((item) => item.homeAway === "home" && item.status !== "scheduled") ?? null;
  let weather;
  try { weather = await fetchWeather(nextHome); }
  catch (error) { weather = { status: "waiting", reason: error instanceof Error ? error.message : "Weather refresh failed" }; }
  const nextCurrent = {
    ...current,
    updated_at: new Date().toISOString(),
    status: "active",
    next_home_fixture_id: nextHome?.id ?? null,
    last_completed_home_fixture_id: completedHome?.id ?? null,
    weather,
    material_changes: materialChangeCount(existing, calendar),
    source_failures: []
  };
  const nextSignals = signals.map((signal) => {
    if (signal.category !== "weather" || signal.fixtureId !== nextHome?.id) return signal;
    if (weather.status !== "forecast") return { ...signal, state: "waiting", observedAt: nextCurrent.updated_at };
    const adverse = (weather.precipitation_probability_max ?? 0) >= 60 || (weather.wind_speed_max ?? 0) >= 45;
    return {
      ...signal,
      state: "forecast",
      direction: adverse ? "negative" : "positive",
      materiality: adverse ? "high" : "low",
      observedAt: weather.generated_at,
      title: adverse
        ? { en: "Weather risk has entered the action threshold", es: "El riesgo meteorológico ha entrado en el umbral de acción" }
        : { en: "Matchday weather is currently low risk", es: "El riesgo meteorológico actual para el matchday es bajo" },
      summary: {
        en: `${weather.precipitation_probability_max}% maximum rain probability, ${weather.precipitation_sum} mm and ${weather.wind_speed_max} km/h maximum wind. Forecast, not measured weather.`,
        es: `${weather.precipitation_probability_max}% de probabilidad máxima de lluvia, ${weather.precipitation_sum} mm y viento máximo de ${weather.wind_speed_max} km/h. Es forecast, no tiempo medido.`
      },
      marketingAction: adverse
        ? { en: "Prioritise access, covered arrival and service messaging; review outdoor activations.", es: "Priorizar acceso, llegada cubierta y mensajes de servicio; revisar activaciones exteriores." }
        : { en: "Keep normal acquisition active and retain service messaging as a contingency.", es: "Mantener activa la captación normal y conservar mensajes de servicio como contingencia." },
      sourceName: "Open-Meteo",
      sourceUrl: "https://open-meteo.com/"
    };
  });
  if (DRY_RUN) {
    console.log(JSON.stringify({ fixtures: calendar.length, nextHome, weather, materialChanges: nextCurrent.material_changes }, null, 2));
    return;
  }
  await Promise.all([
    writeFile(CALENDAR_PATH, `${JSON.stringify(calendar, null, 2)}\n`),
    writeFile(CURRENT_PATH, `${JSON.stringify(nextCurrent, null, 2)}\n`),
    writeFile(SIGNALS_PATH, `${JSON.stringify(nextSignals, null, 2)}\n`)
  ]);
  console.log(`Updated ${calendar.length} fixtures; ${nextCurrent.material_changes} material calendar changes.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
