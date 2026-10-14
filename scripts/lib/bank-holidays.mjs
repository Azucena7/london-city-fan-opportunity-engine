// GOV.UK publishes bank holidays per division. AVELA keeps England and Wales (the London
// division) from a little before today, so recent and upcoming moments stay readable.

export function parseBankHolidays(payload, division = "england-and-wales", fromDate = "0000-00-00") {
  const events = payload?.[division]?.events;
  if (!Array.isArray(events)) throw new Error(`GOV.UK payload has no ${division} events`);
  return events
    .filter((event) => typeof event?.title === "string" && /^\d{4}-\d{2}-\d{2}$/.test(event?.date ?? "") && event.date >= fromDate)
    .map((event) => ({ date: event.date, title: event.title.replace(/’/g, "'") }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
