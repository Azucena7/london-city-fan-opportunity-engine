import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const nav = read("src/components/NavTabs.tsx");
const layout = read("src/app/layout.tsx");
const today = read("src/components/LocalizedToday.tsx");

for (const route of ["/access", "/measurement", "/partners", "/sources"]) {
  if (!nav.includes(`\"${route}\"`)) throw new Error(`Operational navigation is missing ${route}`);
}

if (!layout.includes('className="skipLink"') || !layout.includes("lang={initialLang}")) {
  throw new Error("Root layout must keep the skip link and server-selected document language");
}

if (today.includes("{fixture.targetTerritory} + compradores del opener</strong>")) {
  throw new Error("Today contains the previous untranslated audience label");
}

console.log("Product content checks passed");
