const HOME_GROUND = { latitude: 51.3911137, longitude: 0.0182409 };
const WSL_FIXTURES_URL = "https://womensleagues.thefa.com/fixtures/";

const PERMANENT_ATTRACTION = /(standard (entry|experience|admission)|all day entry|london eye|madame tussauds|london dungeon|tower of london|kensington palace|hampton court|sea life|view from the shard|twist museum|frameless|paddington bear experience|ramses (and|&) the (gold|pharaohs))/i;
const MAJOR_VENUE = /(wembley|the o2|tottenham hotspur|emirates|london stadium|stamford bridge|twickenham|royal albert hall|lord'?s|the oval|all england|centre court|copper box)/i;
const LARGE_VENUE = /(ovo arena|eventim apollo|alexandra palace|roundhouse|battersea power station|the valley|selhurst park|loftus road|craven cottage|indigo at the o2)/i;
const HIGH_OVERLAP_SPORT = /(football|soccer|rugby|tennis|basketball|cricket|athletics|boxing|netball|hockey)/i;

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
  if (score >= 65) return "high";
  if (score >= 45) return "medium";
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
  if (timeGap !== null && timeGap <= 30) {
    timeScore = 30;
    reasons.push(localised("Same kick-off window", "Misma franja de inicio"));
  } else if (timeGap !== null && timeGap <= 90) {
    timeScore = 26;
    reasons.push(localised("Overlapping matchday window", "Ventana de partido solapada"));
  } else if (sameDate) {
    timeScore = 20;
    reasons.push(localised("Same matchday", "Mismo día de partido"));
  } else {
    timeScore = 6;
  }

  const isSameLeague = event.kind === "same-league-fixture";
  const distanceKm = isSameLeague ? null : haversineKm(
    event.latitude === null || event.longitude === null ? null : { latitude: event.latitude, longitude: event.longitude },
    HOME_GROUND
  );
  let proximityScore = 0;
  if (distanceKm !== null && distanceKm <= 5) {
    proximityScore = 20;
    reasons.push(localised("Within 5 km of the home ground", "A menos de 5 km del estadio"));
  } else if (distanceKm !== null && distanceKm <= 12) {
    proximityScore = 16;
    reasons.push(localised("Close to the home-ground catchment", "Cerca del área de influencia del estadio"));
  } else if (distanceKm !== null && distanceKm <= 25) {
    proximityScore = 10;
  } else if (!isSameLeague) {
    proximityScore = 4;
  }

  let audienceScore = 0;
  if (isSameLeague) {
    audienceScore = 25;
    reasons.push(localised("Direct Barclays WSL attention competition", "Competencia directa de atención en Barclays WSL"));
  } else if (event.category === "Sports") {
    audienceScore = HIGH_OVERLAP_SPORT.test(`${event.genre ?? ""} ${event.name}`) ? 23 : 18;
    reasons.push(localised("Competing sports audience", "Audiencia deportiva coincidente"));
  } else if (event.category === "Music") {
    audienceScore = 14;
    reasons.push(localised("Competing live-entertainment audience", "Audiencia de entretenimiento en directo"));
  } else if (event.genre === "Family") {
    audienceScore = 12;
    reasons.push(localised("Competing family audience", "Audiencia familiar coincidente"));
  } else if (event.category === "Arts & Theatre") {
    audienceScore = 8;
  } else {
    audienceScore = 4;
  }

  const venueText = `${event.venue} ${event.name}`;
  let scaleScore = isSameLeague ? 10 : 5;
  if (MAJOR_VENUE.test(venueText)) {
    scaleScore = 15;
    reasons.push(localised("Major venue", "Recinto de gran escala"));
  } else if (LARGE_VENUE.test(venueText)) {
    scaleScore = 10;
  } else if (event.category === "Sports") {
    scaleScore = 8;
  }

  let distinctivenessScore = 10;
  if (event.slotCount >= 10) distinctivenessScore = 1;
  else if (event.slotCount >= 4) distinctivenessScore = 4;
  else if (event.slotCount >= 2) distinctivenessScore = 7;
  if (distinctivenessScore >= 7) reasons.push(localised("Limited-run or one-off event", "Evento único o de pocas sesiones"));

  const score = Math.min(100, timeScore + proximityScore + audienceScore + scaleScore + distinctivenessScore);
  return {
    fixtureId: fixture.id,
    score,
    level: levelFor(score),
    timeGapMinutes: timeGap,
    distanceKm,
    reasons: reasons.slice(0, 3)
  };
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
    if (event.kind !== "same-league-fixture" && PERMANENT_ATTRACTION.test(event.name)) continue;
    const key = event.kind === "same-league-fixture"
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
    // Ticketmaster can expose every admission window as an individual event.
    // Repeated miscellaneous listings are inventory, not scarce attention competitors.
    if (event.kind !== "same-league-fixture" && event.category === "Miscellaneous" && event.slotCount >= 6) return [];
    const fixtureScores = event.fixtureIds.flatMap((fixtureId) => {
      const fixture = fixtures.find((item) => item.id === fixtureId);
      return fixture ? [competitionForFixture(event, fixture)] : [];
    });
    if (!fixtureScores.length) return [];
    const strongest = [...fixtureScores].sort((a, b) => b.score - a.score)[0];
    if (strongest.score < 30) return [];
    return [{ ...event, score: strongest.score, level: strongest.level, reasons: strongest.reasons, fixtureScores }];
  }).sort((a, b) => b.score - a.score || `${a.date}-${a.time ?? ""}`.localeCompare(`${b.date}-${b.time ?? ""}`));
}
