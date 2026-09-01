import territoriesRaw from "../../data/seed/territories.json";
import fixturesRaw from "../../data/seed/fixtures.json";
import competitorsRaw from "../../data/seed/competitors.json";
import grassrootsRaw from "../../data/seed/grassroots.json";
import ticketingRaw from "../../data/seed/ticketing.json";
import type { Fixture, Territory } from "./models";

export const territories = territoriesRaw as Territory[];
export const fixtures = fixturesRaw as Fixture[];
export const competitors = competitorsRaw;
export const grassroots = grassrootsRaw;
export const ticketing = ticketingRaw;
