/**
 * The product's "today" in Europe/London. AVELA_PRODUCT_DATE (YYYY-MM-DD) pins it, so browser
 * tests can run against a frozen data snapshot whatever the real date is.
 */
export function productToday() {
  const pinned = process.env.AVELA_PRODUCT_DATE;
  if (pinned && /^\d{4}-\d{2}-\d{2}$/.test(pinned)) return pinned;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function currentProductDate(referenceIso?: string) {
  const londonToday = productToday();
  const referenceDate = referenceIso?.slice(0, 10);
  return [referenceDate, londonToday].filter((value): value is string => Boolean(value)).sort().at(-1) ?? londonToday;
}
