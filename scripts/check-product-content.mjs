import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const layout = read("src/app/layout.tsx");
const nav = read("src/components/ProductJourneyNav.tsx");
const home = read("src/app/app/page.tsx");
const radar = read("src/app/app/matches/page.tsx");
const learning = read("src/app/app/learning/page.tsx");
const sources = read("src/components/IntelligenceSources.tsx");
const londonCity = read("src/components/LondonCityCase.tsx");

for (const route of ["/app", "/app/matches", "/app/campaigns", "/app/players", "/app/learning", "/app/season"]) {
  if (!nav.includes(`"${route}"`)) throw new Error(`Canonical product navigation is missing ${route}`);
}

if (!layout.includes('className="skipLink"') || !layout.includes("lang={initialLang}")) {
  throw new Error("Root layout must keep the skip link and server-selected document language");
}

if (!home.includes("What needs attention today?")) {
  throw new Error("Operational Home must remain decision-first");
}

if (!radar.includes("Where should the club act next?") || !radar.includes("The ranking is a decision aid, not an attendance forecast.")) {
  throw new Error("Radar must preserve decision-first and forecast guardrail copy");
}

if (!learning.includes("Attribution ≠ incremental impact") || !learning.includes("Not established")) {
  throw new Error("Learning must preserve attribution and causality guardrails");
}

if (!sources.includes("Public demo evidence") || !sources.includes("Requires access")) {
  throw new Error("Sources must keep permission and evidence-state boundaries explicit");
}

if (!londonCity.includes("PUBLIC DEMO") || !londonCity.includes("Alignment never implies the club saw or used this product.")) {
  throw new Error("London City public demo must preserve independent-proof framing");
}

console.log("Product content checks passed");
