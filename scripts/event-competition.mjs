const HOME_GROUND = { latitude: 51.3911137, longitude: 0.0182409 };
const WSL_FIXTURES_URL = "https://womensleagues.thefa.com/fixtures/";

const MAJOR_VENUE = /(wembley|the o2|tottenham hotspur|emirates|london stadium|stamford bridge|twickenham|royal albert hall|lord'?s|the oval|all england|centre court|copper box)/i;
const MAJOR_SPORT_EVENT = /(final|international|world cup|euro cup|six nations|wimbledon|laver cup|nfl london|test match|the ashes|grand slam|championship)/i;
const LONDON_PREMIER_LEAGUE = new Set(["Arsenal", "Brentford", "Chelsea", "Crystal Palace", "Fulham", "Spurs"]);
const LONDON_EFL = new Set(["AFC Wimbledon", "Bromley", "Charlton Athletic", "Leyton Orient", "Millwall", "Queens Park Rangers", "West Ham United"]);
const LONDON_MENS_CLUBS = new Set([...LONDON_PREMIER_LEAGUE, ...LONDON_EFL]);
const NATIONAL_MARQUEE = new Set(["Arsenal", "Chelsea", "Liverpool", "Man City", "Man Utd", "Newcastle", "Spurs"]);
const VENUES = new Map([
  ["Emirates Stadium", [51.5549, -0.1084]],
  ["Gtech Community Stadium", [51.4908, -0.2887]],
  ["Stamford Bridge", [51.4817, -0.1910]],
  ["Selhurst Park", [51.3983, -0.0859]],
  ["Craven Cottage", [51.4749, -0.2216]],
  ["Tottenham Hotspur Stadium", [51.6043, -0.0664]],
  ["London Stadium", [51.5386, -0.0165]],
  ["The Valley", [51.4865, 0.0365]],
  ["The Den", [51.4861, -0.0508]],
  ["MATRADE Loftus Road Stadium", [51.5093, -0.2321]],
  ["Loftus Road", [51.5093, -0.2321]],
  ["Cherry Red Records Stadium", [51.4316, -0.1866]],
  ["CopperJax Community Stadium", [51.3911, 0.0182]],
  ["Hayes Lane", [51.3911, 0.0182]],
  ["Gaughan Group Stadium", [51.5601, -0.0127]],
  ["Wembley Stadium", [51.5560, -0.2795]]
]);

function decodeHtml(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function normalise(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function minutes(value) {
  if (!value || !/^\d{2}:\d{2}/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function haversineKm(left, right) {
  if (!left || !right) return null;
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(right.latitude - left.latitude);
  const dLon = radians(right.longitude - left.longitude);
  const lat1 = radians(left.latitude);
  const lat2 = radians(right.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(6_371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function levelFor(score) {
  if (score >= 75) return "high";
  if (score >= 60) return "medium";
  return "context";
}

function localised(en, es) {
  return { en, es };
}

function nextFlightText(html) {
  return [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)<\/script>/g)]
    .flatMap((match) => {
      try {
        return [JSON.parse(`"${match[1]}"`)];
      } catch {
        return [];
      }
    })
    .join("");
}

function jsonObjectAt(text, start) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return text.slice(start, index + 1);
  }
  return null;
}

function embeddedLeagueMatches(html) {
  const text = nextFlightText(html);
  const matches = new Map();
  let cursor = 0;
  while ((cursor = text.indexOf('"matchDateLocal":"', cursor)) !== -1) {
    const start = text.lastIndexOf('{"providerId":', cursor);
    cursor += 18;
    if (start === -1) continue;
    const raw = jsonObjectAt(text, start);
    if (!raw) continue;
    try {
      const match = JSON.parse(raw);
      if (!match.matchUrl?.includes("/match/barclays-wsl/") || !match.matchDateLocal || !match.home?.officialName || !match.away?.officialName) continue;
      matches.set(match.matchId ?? match.matchUrl, match);
    } catch {
      // Ignore unrelated or partially streamed objects; rendered cards remain a fallback.
    }
  }
  return [...matches.values()];
}

function competitionForFixture(event, fixture) {
  const reasons = [];
  const sameDate = event.date === fixture.date;
  const eventMinutes = minutes(event.time);
  const fixtureMinutes = minutes(fixture.kickoff);
  const timeGap = sameDate && eventMinutes !== null && fixtureMinutes !== null
    ? Math.abs(eventMinutes - fixtureMinutes)
    : null;

  let timeScore = 0;
  if (!sameDate) return null;
  if (timeGap !== null && timeGap <= 30) {
    timeScore = 35;
    reasons.push(localised("Same kick-off window", "Misma franja de inicio"));
  } else if (timeGap !== null && timeGap <= 90) {
    timeScore = 30;
    reasons.push(localised("Overlapping matchday window", "Ventana de partido solapada"));
  } else if (timeGap !== null && timeGap <= 180) {
    timeScore = 20;
    reasons.push(localised("Adjacent matchday window", "Franja próxima en el mismo día"));
  } else {
    timeScore = 12;
    reasons.push(localised("Same matchday", "Mismo día de partido"));
  }

  const distanceKm = haversineKm(
    !Number.isFinite(event.latitude) || !Number.isFinite(event.longitude) ? null : { latitude: event.latitude, longitude: event.longitude },
    HOME_GROUND
  );
  let proximityScore = 0;
  if (distanceKm !== null && distanceKm <= 5) {
    proximityScore = 10;
    reasons.push(localised("Within 5 km of the home ground", "A menos de 5 km del estadio"));
  } else if (distanceKm !== null && distanceKm <= 12) {
    proximityScore = 8;
    reasons.push(localised("Close to the home-ground catchment", "Cerca del área de influencia del estadio"));
  } else if (distanceKm !== null && distanceKm <= 25) {
    proximityScore = 5;
  }

  let audienceScore;
  let scaleScore;
  if (event.kind === "same-league-fixture") {
    audienceScore = 35;
    scaleScore = 14;
    reasons.push(localised("Direct Barclays WSL attention competition", "Competencia directa de atención en Barclays WSL"));
  } else if (event.kind === "england-men-fixture") {
    audienceScore = 35;
    scaleScore = 20;
    reasons.push(localised("England men's national attention", "Atención nacional de la selección masculina"));
  } else if (event.kind === "london-premier-league-fixture") {
    audienceScore = 30;
    scaleScore = 18;
    reasons.push(localised("London Premier League audience", "Audiencia de Premier League en Londres"));
  } else if (event.kind === "london-europe-fixture") {
    audienceScore = 32;
    scaleScore = 20;
    reasons.push(localised("London club in European competition", "Club londinense en competición europea"));
  } else if (event.kind === "london-efl-fixture") {
    audienceScore = 24;
    scaleScore = 12;
    reasons.push(localised("Overlapping London football catchment", "Área de afición futbolística londinense coincidente"));
  } else if (event.kind === "national-marquee-fixture") {
    audienceScore = 28;
    scaleScore = 18;
    reasons.push(localised("Nationally prominent men's fixture", "Partido masculino de atención nacional"));
  } else {
    audienceScore = 20;
    scaleScore = MAJOR_VENUE.test(`${event.venue} ${event.name}`) ? 16 : 10;
    reasons.push(localised("Major sports occasion", "Gran cita deportiva"));
  }

  const score = Math.min(100, timeScore + proximityScore + audienceScore + scaleScore);
  return {
    fixtureId: fixture.id,
    score,
    level: levelFor(score),
    timeGapMinutes: timeGap,
    distanceKm,
    reasons: reasons.slice(0, 3)
  };
}

function londonDateTime(value) {
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.valueOf())) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(parsed).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}:${parts.second}` };
}

export function parseMensFootballFixtures(feedSets, fixtures) {
  return feedSets.flatMap(({ competition, sourceUrl, matches }) => matches.flatMap((match) => {
    const local = londonDateTime(match.DateUtc);
    if (!local || !match.HomeTeam || !match.AwayTeam) return [];
    const fixtureIds = fixtures.filter((fixture) => fixture.date === local.date).map((fixture) => fixture.id);
    if (!fixtureIds.length) return [];
    const england = competition === "UEFA Nations League" && [match.HomeTeam, match.AwayTeam].includes("England");
    const londonPremierLeague = competition === "Premier League" && (LONDON_PREMIER_LEAGUE.has(match.HomeTeam) || LONDON_PREMIER_LEAGUE.has(match.AwayTeam));
    const europeanClubCompetition = /Champions League|Europa League|Conference League/.test(competition);
    const londonEurope = europeanClubCompetition && (LONDON_MENS_CLUBS.has(match.HomeTeam) || LONDON_MENS_CLUBS.has(match.AwayTeam));
    const londonEfl = /EFL/.test(competition) && (LONDON_EFL.has(match.HomeTeam) || LONDON_EFL.has(match.AwayTeam));
    const nationalMarquee = competition === "Premier League" && NATIONAL_MARQUEE.has(match.HomeTeam) && NATIONAL_MARQUEE.has(match.AwayTeam);
    if (!england && !londonPremierLeague && !londonEurope && !londonEfl && !nationalMarquee) return [];
    const coordinates = VENUES.get(match.Location);
    const kind = england ? "england-men-fixture"
      : londonPremierLeague ? "london-premier-league-fixture"
        : londonEurope ? "london-europe-fixture"
          : londonEfl ? "london-efl-fixture"
            : "national-marquee-fixture";
    return [{
      id: `mens-${normalise(competition)}-${match.MatchNumber}-${local.date}`,
      name: `${match.HomeTeam} v ${match.AwayTeam}`,
      date: local.date,
      time: local.time,
      venue: match.Location ?? "Venue TBC",
      city: coordinates ? "London" : "United Kingdom",
      category: "Sports",
      genre: "Football",
      competition,
      url: sourceUrl,
      fixtureIds,
      kind,
      sourceName: "Fixture Download",
      sourceUrl,
      latitude: coordinates?.[0] ?? null,
      longitude: coordinates?.[1] ?? null,
      slotCount: 1
    }];
  }));
}

export function parseOfficialLeagueFixtures(html, fixtures) {
  const matches = new Map();
  for (const match of embeddedLeagueMatches(html)) {
    const home = match.home.officialName;
    const away = match.away.officialName;
    if (/London City Lionesses/i.test(`${home} ${away}`)) continue;
    const date = match.matchDateLocal.slice(0, 10);
    const fixtureIds = fixtures.filter((fixture) => fixture.date === date && /Barclays Women'?s Super League/i.test(fixture.competition)).map((fixture) => fixture.id);
    if (!fixtureIds.length) continue;
    const matchId = match.matchId?.split("::").at(-1) ?? match.matchUrl.match(/\/match\/barclays-wsl\/([^/]+)\//)?.[1] ?? normalise(`${home}-${away}-${date}`);
    matches.set(matchId, {
      id: `wsl-${matchId}`,
      name: `${home} v ${away}`,
      date,
      time: match.matchDateLocal.slice(11, 19),
      venue: match.stadiumName ?? "WSL venue",
      city: match.cityName ?? "United Kingdom",
      category: "Sports",
      genre: "Football",
      competition: "Barclays WSL",
      url: match.matchUrl,
      fixtureIds,
      kind: "same-league-fixture",
      sourceName: "WSL Football",
      sourceUrl: WSL_FIXTURES_URL,
      latitude: null,
      longitude: null,
      slotCount: 1
    });
  }

  const cardPattern = /<a[^>]+href="(https:\/\/www\.wslfootball\.com\/match\/[^\"]+)"[^>]+aria-label="([^\"]+?) - ([^\"]+?)"[^>]*>[\s\S]*?<time dateTime="([^\"]+)"[\s\S]*?<img alt="([^\"]+)"[\s\S]*?<div[^>]*text-grey-on-light-500[^>]*>([^<]+)<\/div>/g;
  for (const match of html.matchAll(cardPattern)) {
    const [, url, rawHome, rawAway, dateTime, rawCompetition, rawVenue] = match;
    const home = decodeHtml(rawHome);
    const away = decodeHtml(rawAway);
    const competition = decodeHtml(rawCompetition);
    if (competition !== "Barclays WSL" || /London City Lionesses/i.test(`${home} ${away}`)) continue;
    const date = dateTime.slice(0, 10);
    const fixtureIds = fixtures.filter((fixture) => fixture.date === date && /Barclays Women'?s Super League/i.test(fixture.competition)).map((fixture) => fixture.id);
    if (!fixtureIds.length) continue;
    const matchId = url.match(/\/match\/[^/]+\/([^/]+)\//)?.[1] ?? normalise(`${home}-${away}-${date}`);
    if (matches.has(matchId)) continue;
    matches.set(matchId, {
      id: `wsl-${matchId}`,
      name: `${home} v ${away}`,
      date,
      time: dateTime.slice(11, 19),
      venue: decodeHtml(rawVenue),
      city: "United Kingdom",
      category: "Sports",
      genre: "Football",
      competition,
      url,
      fixtureIds,
      kind: "same-league-fixture",
      sourceName: "WSL Football",
      sourceUrl: WSL_FIXTURES_URL,
      latitude: null,
      longitude: null,
      slotCount: 1
    });
  }
  return [...matches.values()];
}

export function rankEventCompetition(rawEvents, fixtures) {
  const grouped = new Map();
  for (const event of rawEvents) {
    const isStructuredFixture = event.kind && event.kind !== "public-event";
    const isMajorSport = event.kind === "public-event"
      && event.category === "Sports"
      && MAJOR_SPORT_EVENT.test(`${event.name} ${event.genre ?? ""}`)
      && MAJOR_VENUE.test(`${event.venue} ${event.name}`);
    if (!isStructuredFixture && !isMajorSport) continue;
    const key = isStructuredFixture
      ? event.id
      : `${normalise(event.name)}|${normalise(event.venue)}|${event.date}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...event, slotCount: event.slotCount ?? 1 });
      continue;
    }
    const times = [existing.time, event.time].filter(Boolean).sort();
    grouped.set(key, {
      ...existing,
      time: times[0] ?? null,
      fixtureIds: [...new Set([...existing.fixtureIds, ...event.fixtureIds])],
      slotCount: existing.slotCount + (event.slotCount ?? 1)
    });
  }

  return [...grouped.values()].flatMap((event) => {
    const fixtureScores = event.fixtureIds.flatMap((fixtureId) => {
      const fixture = fixtures.find((item) => item.id === fixtureId);
      const assessment = fixture ? competitionForFixture(event, fixture) : null;
      return assessment ? [assessment] : [];
    });
    if (!fixtureScores.length) return [];
    const strongest = [...fixtureScores].sort((a, b) => b.score - a.score)[0];
    if (strongest.score < 50) return [];
    return [{ ...event, score: strongest.score, level: strongest.level, reasons: strongest.reasons, fixtureScores }];
  }).sort((a, b) => b.score - a.score || `${a.date}-${a.time ?? ""}`.localeCompare(`${b.date}-${b.time ?? ""}`));
}
