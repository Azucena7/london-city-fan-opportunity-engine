export function currentProductDate(referenceIso?: string) {
  const londonToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const referenceDate = referenceIso?.slice(0, 10);
  return [referenceDate, londonToday].filter((value): value is string => Boolean(value)).sort().at(-1) ?? londonToday;
}
