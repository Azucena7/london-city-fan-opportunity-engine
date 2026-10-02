import type { LiveSignal } from "@/lib/models";

export type WomensFootballSignalLens =
  | "Player momentum"
  | "Family / grassroots"
  | "City / culture"
  | "Fixture overlap"
  | "Attendance demand"
  | "Access / matchday"
  | "Partner fit"
  | "General context";

const rules: Array<{ lens: WomensFootballSignalLens; pattern: RegExp }> = [
  { lens: "Player momentum", pattern: /player|alexia|putellas|lioness|international|selection|national team|goal|result|search|social/i },
  { lens: "Family / grassroots", pattern: /family|families|grassroots|academy|girls|youth|school|sister-club/i },
  { lens: "City / culture", pattern: /event|city|culture|music|festival|tourism|local|watchalong|fan zone/i },
  { lens: "Fixture overlap", pattern: /competing|competition|overlap|clash|postponed|men.?s fixture|women.?s fixture/i },
  { lens: "Attendance demand", pattern: /ticket|attendance|demand|buyer|repeat|conversion|inventory|sold out|price|hospitality/i },
  { lens: "Access / matchday", pattern: /weather|transport|travel|venue|kickoff|parking|access|mobility|turnstile/i },
  { lens: "Partner fit", pattern: /partner|sponsor|commercial|brand|nike/i }
];

export function classifyWomensFootballSignal(signal: LiveSignal): WomensFootballSignalLens {
  const haystack = [
    signal.title.en,
    signal.summary.en,
    signal.marketingAction?.en ?? "",
    signal.sourceName,
    signal.category
  ].join(" ");

  const matched = rules.find((rule) => rule.pattern.test(haystack));
  if (matched) return matched.lens;

  if (signal.category === "sponsorship") return "Partner fit";
  if (signal.category === "access" || signal.category === "weather") return "Access / matchday";
  if (signal.category === "demand") return "Attendance demand";

  return "General context";
}

export function womenSignalCoverage(signals: LiveSignal[]) {
  const lenses = signals.map(classifyWomensFootballSignal);
  const unique = Array.from(new Set(lenses));
  return {
    lenses: unique,
    specificLensCount: unique.filter((lens) => lens !== "General context").length,
    signalCount: signals.length
  };
}
