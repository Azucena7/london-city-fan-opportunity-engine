import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("source register uses unique ids and declared states", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const states = new Set(["operational", "degraded", "blocked", "not-configured", "requires-access"]);
  assert.equal(new Set(data.sources.map((source) => source.id)).size, data.sources.length);
  assert.ok(data.sources.every((source) => states.has(source.state)));
});

test("actionable source failures name the next owner action", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const actionable = data.sources.filter((source) => ["blocked", "not-configured"].includes(source.state));
  assert.ok(actionable.length > 0);
  assert.ok(actionable.every((source) => source.ownerAction?.en && source.ownerAction?.es));
});

test("operational modules are reachable from global navigation", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const route of ["/access", "/measurement", "/partners", "/sources"]) {
    assert.ok(nav.includes(`"${route}"`), `${route} should be visible in global navigation`);
  }
});

test("navigation names describe the internal product and fan-facing output", () => {
  const nav = read("src/components/NavTabs.tsx");
  for (const label of ["Fan Experience", "Matchday Access", "Partnerships", "Data & Sources"]) {
    assert.ok(nav.includes(label), `${label} should be visible in English navigation`);
  }
  for (const label of ["Experiencia del aficionado", "Acceso al partido", "Alianzas", "Datos y fuentes"]) {
    assert.ok(nav.includes(label), `${label} should be visible in Spanish navigation`);
  }
  assert.match(nav, /Product evaluation/);
  assert.match(nav, /Operational tools/);
});

test("document language and keyboard bypass are part of the root shell", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /lang=\{initialLang\}/);
  assert.match(layout, /className="skipLink"/);
  assert.match(layout, /href="#main-content"/);
});

test("Today is a progressive executive cockpit", () => {
  const today = read("src/components/LocalizedToday.tsx");
  assert.match(today, /Three actions before the next home fixture/);
  assert.match(today, /Three signals that change the action/);
  assert.match(today, /Why \$\{fixture\.planningScore\}/);
  assert.match(today, /timeZoneName: "short"/);
  assert.doesNotMatch(today, /<CampaignPlan/);
  assert.doesNotMatch(today, /<SourceHealthCenter/);
  assert.doesNotMatch(today, /<PostMatchScorecard/);
});

test("Calendar leads with fixture decisions and defers supporting evidence", () => {
  const calendar = read("src/components/LocalizedCalendarPage.tsx");
  assert.match(calendar, /FIXTURE-LED PLANNING/);
  assert.match(calendar, /NEXT HOME FIXTURE/);
  assert.match(calendar, /Operating actions/);
  assert.match(calendar, /className="calendarEvidence"/);
  assert.match(calendar, /scope === "home"/);
  assert.match(calendar, /scope === "results"/);
  assert.ok(calendar.indexOf("seasonTimeline") < calendar.indexOf("<DemandHistory"));
});

test("Territories flow into aggregated access before the fan preview", () => {
  const territories = read("src/components/LocalizedTerritoriesPage.tsx");
  const access = read("src/components/LocalizedAccessPage.tsx");
  assert.match(territories, /\/access\?territory=/);
  assert.match(territories, /Validate & acquire/);
  assert.match(access, /useState<View>\("territory"\)/);
  assert.match(access, /INTERNAL DECISION/);
  assert.match(access, /FAN PREVIEW/);
  assert.match(access, /initialTerritoryId=/);
});

test("Fan Experience separates internal control from the supporter preview", () => {
  const experience = read("src/components/ExperienceDemandValidation.tsx");
  assert.match(experience, /useState<ExperienceView>\("internal"\)/);
  assert.match(experience, /INTERNAL PRODUCT LAB/);
  assert.match(experience, /FAN-FACING PREVIEW/);
  assert.match(experience, /Concept portfolio to test/);
  assert.match(experience, /From interaction to decision/);
  assert.match(experience, /This is the test surface, not a commercial offer/);
});


test("Measurement is a decision control room before it is a technical dashboard", () => {
  const measurement = read("src/components/MeasurementDashboard.tsx");
  assert.match(measurement, /EVIDENCE CONTROL ROOM/);
  assert.match(measurement, /Fixture decision queue/);
  assert.match(measurement, /NEXT DECISION/);
  assert.match(measurement, /Keep measuring/);
  assert.match(measurement, /Instrument before deciding/);
  assert.match(measurement, /View technical instrumentation detail/);
});


test("Measurement compares prior engine hypotheses with observable club action without claiming causation", () => {
  const measurement = read("src/components/MeasurementDashboard.tsx");
  const validation = JSON.parse(read("data/live/decision-validation.json"));
  assert.match(measurement, /Engine hypothesis vs observable reality/);
  assert.match(measurement, /INTERPRETATION LIMIT/);
  assert.equal(validation.cases[0].hypothesisGeneratedAt.slice(0, 10), "2026-09-15");
  assert.equal(validation.cases[0].observedAt, "2026-09-18");
  assert.equal(validation.cases[0].observedSource.url, "https://www.londoncitylionesses.com/post/ldn-city-england-v-spain-watchalong");
  assert.match(validation.cases[0].caveat.en, /does not imply causation/i);
  assert.ok(validation.cases[0].dimensions.some((item) => item.state === "partial"));
});


test("Partnerships leads with an evidence-gated commercial decision queue", () => {
  const partners = read("src/components/PartnerCommercialPack.tsx");
  assert.match(partners, /PARTNERSHIP DECISION WORKSPACE/);
  assert.match(partners, /Commercial decision queue/);
  assert.match(partners, /ADVANCE TO REVIEW/);
  assert.match(partners, /BLOCKED GATES/);
  assert.match(partners, /Evidence and blockers first/);
  assert.ok(partners.indexOf("Commercial decision queue") < partners.indexOf("Open opportunity dossier"));
  assert.ok(partners.indexOf("Open opportunity dossier") < partners.indexOf("Evidence ledger"));
  assert.match(partners, /Export dossier/);
});


test("Data & Sources translates technical source health into business decision reliability", () => {
  const component = read("src/components/SourceHealthCenter.tsx");
  const page = read("src/components/LocalizedSourcesPage.tsx");
  const data = JSON.parse(read("data/live/source-health.json"));
  assert.match(component, /DECISION RELIABILITY/);
  assert.match(component, /Technical source register/);
  assert.match(component, /Open decision/);
  assert.match(page, /Which decisions can we trust today/);
  assert.ok(data.decisions.length >= 5);
  assert.ok(data.decisions.some((item) => item.id === "conversion-retention" && item.requiredSourceIds.includes("crm-ticketing")));
  assert.ok(data.decisions.some((item) => item.id === "attendance-benchmark" && item.requiredSourceIds.includes("wsl-attendance")));
});


test("production traffic is instrumented with private Vercel Web Analytics", () => {
  const layout = read("src/app/layout.tsx");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.dependencies["@vercel/analytics"], "^2.0.1");
  assert.match(layout, /@vercel\/analytics\/next/);
  assert.match(layout, /<Analytics \/>/);
});


test("Case study separates built product, observed alignment and unproven impact", () => {
  const page = read("src/app/case-study/page.tsx");
  const story = read("src/components/LocalizedStoryPage.tsx");
  const technical = read("src/components/LocalizedTechnicalCaseStudy.tsx");
  assert.match(page, /decisionValidation/);
  assert.match(story, /WHAT IS ACTUALLY DEMONSTRATED/);
  assert.match(story, /ENGINE HYPOTHESIS/);
  assert.match(story, /OBSERVED CLUB ACTION/);
  assert.match(story, /causation claimed/);
  assert.match(story, /FROM PROTOTYPE TO PILOT/);
  assert.match(story, /Six operating questions\. One system/);
  assert.match(technical, /V2\.0/);
  assert.match(technical, /Decision validation/);
  assert.match(technical, /Decision reliability/);
  assert.match(technical, /never implies causation/);
});


test("How it works leads with the decision lifecycle and keeps scoring secondary", () => {
  const method = read("src/components/LocalizedMethodPage.tsx");
  assert.match(method, /DECISION LIFECYCLE/);
  assert.match(method, /Six stages\. Three chances to stop/);
  assert.match(method, /Missing data ≠ zero/);
  assert.match(method, /Score ≠ permission/);
  assert.match(method, /Alignment ≠ causation/);
  assert.match(method, /SCORING & PRIORITISATION/);
  assert.ok(method.indexOf("DECISION LIFECYCLE") < method.indexOf("SCORING & PRIORITISATION"));
  assert.match(method, /Observe reality/);
});


test("global evidence claims stay consistent with current source availability", () => {
  const technical = read("src/components/LocalizedTechnicalCaseStudy.tsx");
  const executive = read("src/components/ExecutiveOverview.tsx");
  assert.doesNotMatch(technical, /Google Trends connected/);
  assert.doesNotMatch(technical, /proves the full path/);
  assert.match(technical, /benchmark only when its source is available/);
  assert.match(executive, /decisionReliabilityCounts/);
  assert.match(executive, /Decision reliability/);
  assert.match(executive, /Review confidence/);
});


test("social sharing matches the current Fan Growth Engine product story", () => {
  const layout = read("src/app/layout.tsx");
  const card = read("src/app/linkedin-card/route.tsx");
  const og = read("src/app/opengraph-image.tsx");
  assert.match(layout, /AVELA · Growth Intelligence for Women’s Football/);
  assert.match(layout, /Turn every fixture into a growth opportunity/);
  assert.match(card, /DECISION INTELLIGENCE FOR FOOTBALL CLUBS/);
  assert.match(card, /Matches/);
  assert.match(card, /Match plan/);
  assert.match(card, /Review/);
  assert.match(card, /Learning/);
  assert.match(og, /Live · Modelled · Missing/);
  assert.doesNotMatch(card, /\+280/);
});


test("Brighton club activation intelligence includes the observed England v Spain watchalong", () => {
  const activations = JSON.parse(read("data/seed/club-activations.json"));
  const watchalong = activations.observations.find((item) => item.id === "brighton-england-spain-watchalong");
  const alignment = activations.alignment.find((item) => item.id === "double-header");
  assert.ok(watchalong);
  assert.equal(watchalong.observedAt, "2026-09-18");
  assert.equal(watchalong.evidenceState, "observed");
  assert.equal(watchalong.sourceUrl, "https://www.londoncitylionesses.com/post/ldn-city-england-v-spain-watchalong");
  assert.equal(alignment.status, "partially-observed");
  assert.match(alignment.observed.en, /publicly announced/);
  assert.match(alignment.observed.en, /not yet verified/);
});


test("Today surfaces a compact engine-versus-reality check for the current fixture", () => {
  const page = read("src/app/today/page.tsx");
  const today = read("src/components/LocalizedToday.tsx");
  assert.match(page, /decisionValidation/);
  assert.match(today, /REALITY CHECK/);
  assert.match(today, /comparable public club action/);
  assert.match(today, /not influence on the club/);
  assert.match(today, /causation claimed/);
  assert.match(today, /\/measurement#decision-validation-title/);
  assert.ok(today.indexOf("REALITY CHECK") < today.indexOf("Three actions before the next home fixture"));
});



test("club app includes a guided demo that uses the real fixture workflow", () => {
  const demo = read("src/components/DemoTour.tsx");
  const page = read("src/app/app/demo/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(demo, /3-minute guided demo/);
  assert.match(demo, /Fixture detected/);
  assert.match(demo, /Engine recommends/);
  assert.match(demo, /Campaign built/);
  assert.match(demo, /Review & launch/);
  assert.match(demo, /same live product data/);
  assert.match(demo, /Open campaign builder/);
  assert.match(page, /getCurrentProductOpportunity/);
  assert.match(page, /campaignPlans/);
  assert.match(nav, /Guided demo/);
  assert.match(nav, /\/app\/demo/);
});

test("club campaign workspace supports authenticated multi-user persistence with RLS", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");
  const server = read("src/lib/supabaseServer.ts");
  const session = read("src/app/api/auth/session/route.ts");
  const login = read("src/app/api/auth/login/route.ts");
  const workspace = read("src/app/api/campaign-workspace/[fixtureId]/route.ts");
  const ledger = read("src/app/api/credit-ledger/route.ts");
  const migration = read("supabase/migrations/20261002_campaign_workspace.sql");

  assert.match(builder, /Connect club workspace/);
  assert.match(builder, /Pilot account sign-in/);
  assert.match(builder, /Saved to \$\{clubs/);
  assert.match(builder, /\/api\/campaign-workspace/);
  assert.match(builder, /\/api\/credit-ledger/);
  assert.match(builder, /eventKey/);
  assert.match(builder, /Remote persistence is protected by club membership and row-level security/);

  assert.match(server, /httpOnly: true/);
  assert.match(server, /sameSite: "lax"/);
  assert.match(server, /SUPABASE_PUBLISHABLE_KEY/);
  assert.match(session, /club_memberships/);
  assert.match(login, /grant_type=password/);
  assert.match(workspace, /on_conflict=club_id,fixture_id/);
  assert.match(ledger, /on_conflict=event_key/);

  assert.match(migration, /enable row level security/);
  assert.match(migration, /club_has_permission/);
  assert.match(migration, /'campaigns', 'edit'/);
  assert.match(migration, /'campaigns', 'approve'/);
  assert.match(migration, /campaign_workspaces/);
  assert.match(migration, /credit_ledger/);
  assert.match(migration, /event_key text unique/);
  assert.match(migration, /auth\.uid\(\)/);
});

test("club app exposes an auditable Credit Center from the persistent ledger", () => {
  const center = read("src/components/CreditCenter.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  const page = read("src/app/app/credits/page.tsx");

  assert.match(center, /Credit Center/);
  assert.match(center, /Committed/);
  assert.match(center, /Outstanding/);
  assert.match(center, /Consumed/);
  assert.match(center, /Released/);
  assert.match(center, /\/api\/credit-ledger/);
  assert.match(center, /\/api\/auth\/session/);
  assert.match(center, /No credit events yet/);
  assert.match(nav, /href: "\/app\/credits"/);
  assert.match(nav, /label: "Credits"/);
  assert.match(page, /CreditCenter/);
});

test("campaign builder can generate real CRM and vertical-video drafts through a server route", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");
  const route = read("src/app/api/campaign-draft/route.ts");
  const env = read(".env.example");

  assert.match(builder, /Generate draft/);
  assert.match(builder, /Generative production/);
  assert.match(builder, /credits committed/);
  assert.match(builder, /Saved on this device/);
  assert.match(builder, /localStorage/);
  assert.match(builder, /campaign-workspace/);
  assert.match(builder, /Review campaign/);
  assert.match(builder, /\/api\/campaign-draft/);

  assert.match(route, /AI_GATEWAY_API_KEY/);
  assert.match(route, /VERCEL_OIDC_TOKEN/);
  assert.match(route, /https:\/\/ai-gateway\.vercel\.sh\/v1\/chat\/completions/);
  assert.match(route, /openai\/gpt-5\.6-sol/);
  assert.match(route, /crm-email/);
  assert.match(route, /vertical-video/);
  assert.match(route, /Never invent ticket prices/);
  assert.match(route, /creditsCommitted/);
  assert.match(route, /persistence: "device-workspace"/);

  assert.match(env, /AI_GATEWAY_API_KEY=/);
  assert.match(env, /AI_GATEWAY_MODEL=/);
});

test("Opportunity Brief explains execution fit without letting club setup rewrite evidence", () => {
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  const context = read("src/lib/clubOperatingContext.ts");

  assert.match(page, /getCurrentClubOperatingContext/);
  assert.match(page, /buildOpportunityRadar\(\[fixtureId\], clubContext\)/);
  assert.match(page, /How this play fits the club&apos;s real operating setup/);
  assert.match(page, /Evidence still determines the opportunity/);
  assert.match(page, /Does not change rank or confidence/);
  assert.match(page, /Connected execution/);
  assert.match(page, /Manual \/ connector handoff/);
  assert.match(page, /Approval default/);
  assert.match(page, /Brand guardrail/);
  assert.match(page, /Evidence-only brief/);
  assert.match(page, /\/app\/setup/);

  assert.match(context, /brandTone/);
  assert.match(context, /brandMustAvoid/);
  assert.match(context, /brand_rules/);
});

test("Opportunity Radar applies club context as advisory fit without changing evidence rank", () => {
  const radar = read("src/lib/opportunityRadar.ts");
  const matches = read("src/app/matches/page.tsx");
  const context = read("src/lib/clubOperatingContext.ts");

  assert.match(radar, /clubContext: ClubOperatingContext \| null = null/);
  assert.match(radar, /affectsRank: false/);
  assert.match(radar, /matchedObjectives/);
  assert.match(radar, /activationChannels/);
  assert.match(radar, /No direct club-priority match detected yet/);
  assert.match(radar, /const rank = priorityRank/);
  const rankFn = radar.slice(radar.indexOf("function priorityRank"), radar.indexOf("const objectiveMatchers"));
  assert.doesNotMatch(rankFn, /ClubOperatingContext|priorityObjectives|connectedChannels|clubContext/);
  assert.match(radar, /const rank = priorityRank\(\s*item\.score,\s*item\.confidence\.label,\s*item\.daysToFixture,\s*materialSignalCount,\s*item\.decisionState === "READY FOR REVIEW"\s*\)/s);

  assert.match(matches, /getCurrentClubOperatingContext/);
  assert.match(matches, /Context explains fit\. Evidence still sets the priority/);
  assert.match(matches, /This context never changes the radar rank, confidence or evidence state/);
  assert.match(matches, /Club fit · advisory only/);
  assert.match(matches, /Club fit does not affect rank/);
  assert.match(matches, /Evidence-only mode/);
  assert.match(matches, /\/app\/setup/);

  assert.match(context, /club_memberships/);
  assert.match(context, /club_setup/);
  assert.match(context, /currentSupabaseUser/);
  assert.match(context, /return null/);
});

test("club setup context differentiates the engine from replacement CRM and generic campaign tools", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");
  const draftRoute = read("src/app/api/campaign-draft/route.ts");
  const home = read("src/app/page.tsx");

  assert.match(builder, /Built above the club&apos;s existing stack — not instead of it/);
  assert.match(builder, /Connected stack/);
  assert.match(builder, /Handoff/);
  assert.match(builder, /clubId: activeClubId/);
  assert.match(builder, /\/api\/club-setup/);

  assert.match(draftRoute, /club_setup/);
  assert.match(draftRoute, /connected_channels/);
  assert.match(draftRoute, /priority_objectives/);
  assert.match(draftRoute, /brand_rules/);
  assert.match(draftRoute, /Follow this club tone/);
  assert.match(draftRoute, /Respect this club must-avoid rule/);

  assert.match(home, /Growth intelligence for women’s football/);
  assert.match(home, /Works with your existing stack/);
  assert.match(home, /Women’s-football signal layer/);
  assert.match(home, /growth-intelligence layer/);
});

test("club setup persists reusable fixture, channel, objective, brand and approval context", () => {
  const setup = read("src/components/ClubSetup.tsx");
  const route = read("src/app/api/club-setup/route.ts");
  const nav = read("src/components/ProductJourneyNav.tsx");
  const page = read("src/app/app/setup/page.tsx");
  const migration = read("supabase/migrations/20261002_campaign_workspace.sql");

  assert.match(setup, /Configure once\. Let every fixture start with context/);
  assert.match(setup, /Fixture source/);
  assert.match(setup, /connectedChannels/);
  assert.match(setup, /priorityObjectives/);
  assert.match(setup, /Brand rules/);
  assert.match(setup, /Require campaign approval before reservation/);
  assert.match(setup, /Admin role required/);
  assert.match(setup, /Setup completeness/);

  assert.match(route, /club_setup/);
  assert.match(route, /on_conflict=club_id/);
  assert.match(route, /Authentication required/);

  assert.match(nav, /href: "\/app\/setup"/);
  assert.match(nav, /label: "Setup"/);
  assert.match(page, /ClubSetup/);

  assert.match(migration, /create table if not exists public\.club_setup/);
  assert.match(migration, /'campaigns', 'administer'/);
  assert.match(migration, /connected_channels/);
  assert.match(migration, /priority_objectives/);
  assert.match(migration, /brand_rules/);
  assert.match(migration, /approval_rules/);
});

test("Learning turns measured evidence into a bounded next-fixture adjustment", () => {
  const page = read("src/app/results/page.tsx");
  const component = read("src/components/NextFixtureLearning.tsx");
  const model = read("src/lib/learningRecommendation.ts");

  assert.match(page, /deriveNextFixtureLearning/);
  assert.match(page, /NextFixtureLearning/);
  assert.match(page, /nextFixtureId=\{nextFixture\?\.id\}/);

  assert.match(component, /Next fixture adjustment/);
  assert.match(component, /Repeat/);
  assert.match(component, /Change/);
  assert.match(component, /Measure next/);
  assert.match(component, /No confidence uplift is applied automatically/);

  assert.match(model, /Requires a randomized holdout|credible comparison group|counterfactual/i);
  assert.match(model, /does not treat attributed tickets as causal lift/);
  assert.match(model, /Do not increase campaign scope or spend based on unmeasured outcomes/);
  assert.match(component, /Learning confidence/);
});

test("Learning compares recorded campaign workflow with measured outcomes without implying causation", () => {
  const learning = read("src/app/results/page.tsx");
  const trace = read("src/components/LearningCampaignTrace.tsx");

  assert.match(learning, /LearningCampaignTrace/);
  assert.match(learning, /fixtureId=\{selectedId\}/);

  assert.match(trace, /Execution trace/);
  assert.match(trace, /What actually happened inside the campaign workspace/);
  assert.match(trace, /operational evidence, not outcome evidence/);
  assert.match(trace, /No shared execution events for this fixture/);
  assert.match(trace, /Learning should not assume a campaign was executed/);
  assert.match(trace, /Use ticketing, CRM, scan and revenue evidence to assess outcomes/);
  assert.match(trace, /credible counterfactual/);
  assert.match(trace, /\/api\/campaign-history/);
  assert.match(trace, /\/api\/auth\/session/);
});

test("campaign history records shared fixture milestones without conflating them with the credit ledger", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");
  const route = read("src/app/api/campaign-history/[fixtureId]/route.ts");
  const migration = read("supabase/migrations/20261002_campaign_workspace.sql");

  assert.match(builder, /Campaign history/);
  assert.match(builder, /One timeline from review to launch handoff/);
  assert.match(builder, /\/api\/campaign-history/);
  assert.match(builder, /draft-generated/);
  assert.match(builder, /Campaign moved to review/);
  assert.match(builder, /Campaign credits reserved/);
  assert.match(builder, /Campaign reopened/);
  assert.match(builder, /Launch handoff prepared/);

  assert.match(route, /campaign_activity/);
  assert.match(route, /on_conflict=event_key/);
  assert.match(route, /launch-handoff/);
  assert.match(route, /Authentication required/);

  assert.match(migration, /create table if not exists public\.campaign_activity/);
  assert.match(migration, /campaign viewers can read activity/);
  assert.match(migration, /campaign editors can add activity/);
  assert.match(migration, /club_has_permission\(club_id, 'campaigns', 'view'\)/);
});

test("campaign flow reviews scope before reserving credits and never simulates launch", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");

  assert.match(builder, /Estimate/);
  assert.match(builder, /Review/);
  assert.match(builder, /Reserve/);
  assert.match(builder, /Launch/);
  assert.match(builder, /Reserve \$\{reservationRequired\} credits/);
  assert.match(builder, /campaign:reserve/);
  assert.match(builder, /campaign:release/);
  assert.match(builder, /Existing generated-draft commitments are excluded/);
  assert.match(builder, /Scope locked by reservation/);
  assert.match(builder, /Reopen campaign and release reservation/);
  assert.match(builder, /Prepare launch handoff/);
  assert.match(builder, /Launch campaign · connector required/);
  assert.match(builder, /Launch is not simulated/);
  assert.match(builder, /No CRM send, social publish or media spend happens/);
});

test("match plan includes campaign proposal credit budgeting and gated launch", () => {
  const builder = read("src/components/CampaignCreditBuilder.tsx");
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(builder, /Campaign proposal/);
  assert.match(builder, /Explorer · preview only/);
  assert.match(builder, /Club · 60 included credits/);
  assert.match(builder, /Club Pro · 160 included credits/);
  assert.match(builder, /Proposed campaign/);
  assert.match(builder, /Campaign workflow coverage/);
  assert.match(builder, /Channel coverage/);
  assert.match(builder, /Campaign quality/);
  assert.match(builder, /Campaign channels/);
  assert.match(builder, /channelActive/);
  assert.match(builder, /channelInactive/);
  assert.match(builder, /If removed:/);
  assert.match(builder, /Full recommended scope/);
  assert.match(builder, /Reduced scope/);
  assert.match(builder, /Thin campaign/);
  assert.match(builder, /Estimated campaign budget/);
  assert.match(builder, /Creation/);
  assert.match(builder, /Adaptation/);
  assert.match(builder, /Automation/);
  assert.match(builder, /Deployment/);
  assert.match(builder, /Extra variants cost less/);
  assert.match(builder, /\+25 credits/);
  assert.match(builder, /\+75 credits/);
  assert.match(builder, /\+200 credits/);
  assert.match(builder, /additional credits|additional credit|add a credit pack/i);
  assert.match(builder, /Prepare launch handoff/);
  assert.match(builder, /Launch campaign · connector required/);
  assert.match(builder, /Launch is not simulated/);
  assert.match(builder, /specific campaign recipe is locked/);
  assert.match(page, /CampaignCreditBuilder/);
  assert.match(page, /fixtureId=\{fixture\.id\}/);
  assert.match(nav, /60/);
  assert.match(nav, /credits/);
});

test("match plan closes with a simple review and handoff gate", () => {
  const decision = read("src/components/MatchPlanDecision.tsx");
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  assert.match(decision, /Review required/);
  assert.match(decision, /Approve draft for handoff/);
  assert.match(decision, /does not send campaigns, commit spend or execute club actions automatically/);
  assert.match(page, /MatchPlanDecision/);
  assert.match(page, /id="approval-gates"/);
});

test("match plan exposes a review-ready activation draft", () => {
  const draft = read("src/components/ActivationDraft.tsx");
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  for (const label of ["Audience", "Channel", "Message", "Timing", "Owner", "Measurement", "Next approval"]) {
    assert.match(draft, new RegExp(label));
  }
  assert.match(draft, /Review all drafted activations/);
  assert.match(page, /ActivationDraft/);
  assert.match(page, /Review the draft, then execute the next actions/);
});

test("match signals can be excluded without mutating engine data", () => {
  const controls = read("src/components/MatchSignalControls.tsx");
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  assert.match(controls, /Signals used/);
  assert.match(controls, /Confidence with this selection/);
  assert.match(controls, /Recommendation/);
  assert.match(controls, /The recommendation is unchanged/);
  assert.match(controls, /Needs review/);
  assert.match(controls, /does not delete the source or change the underlying engine data/);
  assert.match(page, /MatchSignalControls/);
});

test("single match workspace absorbs plan evidence signals and impact", () => {
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  assert.match(page, /Recommended play/);
  assert.match(page, /Review the draft, then execute the next actions/);
  assert.match(page, /signals · \{live\.confidence\.label\} confidence/);
  assert.match(page, /Inspect evidence, assumptions and missing inputs/);
  assert.match(page, /Open editable impact scenario/);
  assert.match(page, /Open measurement & learning/);
  assert.doesNotMatch(page, /href="\/decision-room"/);
  assert.doesNotMatch(page, /href="\/impact"/);
});

test("London City Live reads like an editorial case journal", () => {
  const overview = read("src/components/LondonCityCase.tsx");
  const detail = read("src/components/CommercialCaseStory.tsx");
  assert.match(overview, /What the engine saw before the match/);
  assert.match(overview, /WHAT THE ENGINE SAW/);
  assert.match(overview, /WHAT IT RECOMMENDED/);
  assert.match(overview, /CASE JOURNAL/);
  assert.match(overview, /\/live\/london-city\/brighton/);
  assert.match(detail, /MarketingNav/);
  assert.match(detail, /\/live\/london-city/);
});

test("marketing app and live case have distinct canonical surfaces", () => {
  const home = read("src/app/page.tsx");
  const marketingNav = read("src/components/MarketingNav.tsx");
  const appNav = read("src/components/ProductJourneyNav.tsx");
  const config = read("next.config.mjs");
  const liveCase = read("src/components/LondonCityCase.tsx");
  assert.match(home, /MarketingNav/);
  assert.match(home, /See the live case/);
  assert.match(home, /href="\/live\/london-city"/);
  assert.match(marketingNav, /Open app/);
  assert.match(marketingNav, /\/app\/matches/);
  assert.match(appNav, /Product site/);
  assert.match(appNav, /\/app\/learning/);
  assert.match(config, /source: "\/london-city", destination: "\/live\/london-city"/);
  assert.match(liveCase, /MarketingNav/);
});

test("Learning keeps deep interpretation secondary to observed outcomes", () => {
  const page = read("src/app/results/page.tsx");
  const css = read("src/app/results/results.module.css");
  assert.match(page, /How to read this evidence/);
  assert.match(page, /Attribution ≠ incremental impact/);
  assert.match(page, /fixturePicker/);
  assert.match(page, /fixtureFacts/);
  assert.match(css, /interpretation>summary/);
});

test("matches behaves like a decision inbox with one priority fixture", () => {
  const page = read("src/app/matches/page.tsx");
  const css = read("src/app/matches/matches.module.css");
  assert.match(page, /Current engine priority/);
  assert.match(page, /Next opportunities/);
  assert.match(page, /Ranked by what deserves attention now/);
  assert.match(page, /Open opportunity brief/);
  assert.match(css, /priorityMatch/);
  assert.match(css, /futureFixture/);
});

test("match plan prioritises one executive campaign decision before deep evidence", () => {
  const page = read("src/app/matches/[fixtureId]/page.tsx");
  const css = read("src/app/matches/[fixtureId]/match-plan.module.css");
  assert.match(page, /Recommended play/);
  assert.match(page, /Opportunity/);
  assert.match(page, /Audience/);
  assert.match(page, /Confidence/);
  assert.match(page, /Next action/);
  assert.match(page, /Build this campaign/);
  assert.match(page, /reasoningDetails/);
  assert.match(css, /decisionCockpit/);
  assert.match(css, /decisionFacts/);
});

test("legacy club routes redirect into the fixture-first workspace", () => {
  const config = read("next.config.mjs");
  for (const route of ["/brief", "/opportunity", "/decision-room", "/impact"]) {
    assert.match(config, new RegExp(route.replace("/", "\\/")));
  }
  assert.match(config, /destination: "\/app\/matches"/);
  assert.match(config, /permanent: true/);
});

test("commercial surfaces route users into the simplified club journey", () => {
  const cases = read("src/app/cases/page.tsx");
  const pilot = read("src/app/pilot/page.tsx");
  const demo = read("src/app/demo/page.tsx");
  const operatingPack = read("src/app/pilot/operating-pack/page.tsx");
  const caseOverview = read("src/components/LondonCityCase.tsx");
  for (const source of [cases, pilot, demo, operatingPack, caseOverview]) {
    assert.doesNotMatch(source, /href="\/brief"/);
    assert.doesNotMatch(source, /href="\/opportunity"/);
    assert.doesNotMatch(source, /href="\/decision-room"/);
  }
  assert.match(pilot, /\/app\/matches/);
  assert.match(demo, /\/app\/matches\/\$\{live\.fixtureId\}/);
  assert.match(caseOverview, /\/app\/matches\/\$\{opportunity\.fixtureId\}/);
});

test("club product starts from fixtures instead of requiring a plan first", () => {
  const matches = read("src/app/matches/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(matches, /AVELA · Opportunity Radar/);
  assert.match(matches, /The club does not create a plan first/);
  assert.match(matches, /Fixture → signals → opportunity → recommended play → human review → activation → learning/);
  assert.match(matches, /Monitoring/);
  assert.match(matches, /\/app\/matches\/\$\{currentFixture\.id\}/);
  assert.match(nav, /href: "\/app\/matches"/);
  assert.match(nav, /label: "Learning"/);
});

test("product and analyst branding are intentionally separated", () => {
  const productNav = read("src/components/ProductJourneyNav.tsx");
  const analystNav = read("src/components/NavTabs.tsx");
  assert.match(productNav, /AVELA/);
  assert.match(productNav, /Matches/);
  assert.match(productNav, /Learning/);
  assert.match(productNav, /Product site/);
  assert.doesNotMatch(productNav, /Morning brief/);
  assert.doesNotMatch(productNav, /Decision Room/);
  assert.match(analystNav, /LONDON CITY \/ CASE/);
  assert.match(analystNav, /Evidence environment/);
  assert.match(analystNav, /Back to product/);
  assert.doesNotMatch(analystNav, /FAN OPPORTUNITY LAB/);
});


test("Brighton live validation preserves future phases as waiting evidence", () => {
  const validation = JSON.parse(read("data/live/decision-validation.json"));
  const item = validation.cases.find((entry) => entry.id === "brighton-england-spain-2026-09");
  assert.equal(item.liveValidation.state, "post-match-active");
  assert.deepEqual(item.liveValidation.phases.map((phase) => phase.state), ["complete","complete","complete","waiting","active"]);
  assert.ok(item.liveValidation.postMatchChecklist.some((entry) => entry.state === "requires-club-access"));
  assert.match(item.liveValidation.principle.en, /Future phases stay waiting/);
});

test("Today Calendar and Measurement share the same Brighton live validation lifecycle", () => {
  const today = read("src/components/LocalizedToday.tsx");
  const calendar = read("src/components/LocalizedCalendarPage.tsx");
  const measurement = read("src/components/MeasurementDashboard.tsx");
  assert.match(today, /todayValidationRail/);
  assert.match(calendar, /fixtureValidationLifecycle/);
  assert.match(measurement, /BRIGHTON LIVE VALIDATION/);
  assert.match(measurement, /postMatchChecklist/);
});


test("commercial product routes opt into the full-width product shell", () => {
  const routes = [
    "src/app/brief/page.tsx",
    "src/app/opportunity/page.tsx",
    "src/app/decision-room/page.tsx",
    "src/app/results/page.tsx",
    "src/app/impact/page.tsx",
    "src/app/pilot/page.tsx",
    "src/app/pilot/operating-pack/page.tsx",
    "src/app/demo/page.tsx",
    "src/app/cases/page.tsx"
  ];
  for (const route of routes) {
    assert.match(read(route), /productAppShell/, route + " should use the product app shell");
  }
  const system = read("src/app/product-system.css");
  assert.match(system, /\.productAppShell\{/);
  assert.match(system, /width:100%/);
  assert.match(system, /max-width:none/);
  assert.match(system, /padding-bottom:0/);
});

test("core product surfaces expose a shared Live Modelled Missing trust language", () => {
  const legend = read("src/components/ProductDataStateLegend.tsx");
  assert.match(legend, />Live</);
  assert.match(legend, />Modelled</);
  assert.match(legend, />Missing</);

  for (const route of [
    "src/app/opportunity/page.tsx",
    "src/app/decision-room/page.tsx",
    "src/app/impact/page.tsx",
    "src/app/results/page.tsx"
  ]) {
    assert.match(read(route), /ProductDataStateLegend/, route + " should show the shared data-state legend");
  }
});

test("mobile product flow keeps a contextual next action", () => {
  const brief = read("src/app/brief/page.tsx");
  const opportunity = read("src/app/opportunity/page.tsx");
  const briefCss = read("src/app/brief/brief.module.css");
  const opportunityCss = read("src/app/opportunity/opportunity.module.css");
  assert.match(brief, /Open Opportunity/);
  assert.match(opportunity, /Review Decision/);
  assert.match(briefCss, /position:fixed/);
  assert.match(opportunityCss, /position:fixed/);
});


test("Results switches from missing to measured only through the live CRM slot", () => {
  const page = read("src/app/results/page.tsx");
  const adapter = read("src/lib/productResults.ts");
  const live = JSON.parse(read("data/live/crm-ticketing.json"));

  assert.match(page, /getCurrentProductResults/);
  assert.match(page, /Club ticketing data connected/);
  assert.match(page, /Awaiting club conversion data/);
  assert.match(adapter, /datasetState !== "club-aggregate"/);
  assert.match(adapter, /campaignAttributedTickets/);
  assert.match(adapter, /repeatPurchaseRate/);
  assert.equal(live.datasetState, "requires-access");
  assert.deepEqual(live.fixtureSummaries, []);
  assert.deepEqual(live.repeatCohorts, []);
  assert.equal("records" in live, false);
});


test("decision confidence requires measured conversion evidence before it can become high", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  assert.match(opportunity, /conversionEvidenceConnected/);
  assert.match(opportunity, /state: "outcome-measured"/);
  assert.match(opportunity, /state: "audience-measured"/);
  assert.match(opportunity, /state: "missing"/);
  assert.match(opportunity, /strongEvidence >= 3 && !accessGap/);
  assert.match(opportunity, /campaignAttributedTickets > 0/);
});


test("repository CRM evidence is aggregate-only and importer never stores supporter hashes", () => {
  const live = JSON.parse(read("data/live/crm-ticketing.json"));
  const importer = read("scripts/import-crm-ticketing.mjs");
  const validator = read("scripts/validate-crm-ticketing-live.mjs");
  const pkg = JSON.parse(read("package.json"));

  assert.equal(live.scope, "club-crm-ticketing-aggregate");
  assert.equal("records" in live, false);
  assert.equal(pkg.scripts["import:crm"], "node scripts/import-crm-ticketing.mjs");
  assert.match(importer, /must stay outside the repository/);
  assert.match(importer, /rawRecordsStoredInRepository: false/);
  assert.match(importer, /fixtureSummaries/);
  assert.match(importer, /repeatCohorts/);
  assert.match(validator, /forbidden repository field/);
  assert.match(validator, /supporter_id_hash/);
  assert.match(validator, /ticket_id_hash/);
});


test("strategy and operational next action stay separate", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const brief = read("src/app/brief/page.tsx");
  const decision = read("src/app/decision-room/page.tsx");

  assert.match(opportunity, /recommendedAction/);
  assert.match(opportunity, /nextRequiredAction/);
  assert.match(opportunity, /campaign\?\.nextApproval\.en/);
  assert.match(opportunity, /OVERDUE/);
  assert.match(brief, /nextAction\.label/);
  assert.match(brief, /Strategic recommendation/);
  assert.match(decision, /nextAction\.label/);
});


test("fixture lifecycle keeps pre-match and post-match UX distinct", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const results = read("src/app/results/page.tsx");
  assert.match(opportunity, /fixturePhase: "pre-match" \| "matchday" \| "post-match"/);
  assert.match(opportunity, /timingLabel/);
  assert.match(opportunity, /T-\$\{daysToFixture\}/);
  assert.match(results, /Measurement starts after matchday/);
  assert.match(results, /Pre-match · outcome not available yet/);
});


test("pilot operating pack explains aggregate-only club data handling", () => {
  const page = read("src/app/pilot/operating-pack/page.tsx");
  assert.match(page, /Data trust/);
  assert.match(page, /Club-controlled export/);
  assert.match(page, /Pseudonymous local processing/);
  assert.match(page, /Aggregate evidence only/);
  assert.match(page, /crmTicketingLive\.datasetState/);
});


test("Impact model seeds from measured club history only when aggregate evidence exists", () => {
  const defaults = read("src/lib/productImpactDefaults.ts");
  const impact = read("src/components/ImpactScenario.tsx");
  assert.match(defaults, /datasetState !== "club-aggregate"/);
  assert.match(defaults, /repeatCohorts/);
  assert.match(defaults, /averageTicketValue/);
  assert.match(impact, /observedConversionRate/);
  assert.match(impact, /observedTicketValue/);
  assert.match(impact, /Measured historical seed · editable/);
  assert.match(impact, /Scenario, not forecast/);
});


test("Results never equates campaign attribution with incrementality", () => {
  const results = read("src/app/results/page.tsx");
  const adapter = read("src/lib/productResults.ts");
  assert.match(results, /Attribution ≠ incremental impact/);
  assert.match(results, /What do we know after matchday/);
  assert.match(results, /Not established/);
  assert.match(adapter, /incrementality: "not-established"/);
  assert.match(adapter, /causalClaim: false/);
  assert.match(adapter, /randomized holdout, credible control group, or pre-agreed counterfactual baseline/);
});


test("current product opportunity uses declared campaign evidence instead of Brighton-specific signal wiring", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const campaigns = JSON.parse(read("data/live/campaign-plans.json"));
  const brighton = campaigns.campaigns.find((item) => item.fixtureId === "2026-09-26-bha-h");

  assert.doesNotMatch(opportunity, /signal\.id === "attendance-mun-5402"/);
  assert.doesNotMatch(opportunity, /attention-england-spain/);
  assert.doesNotMatch(opportunity, /weather-brighton-waiting/);
  assert.match(opportunity, /signals\.map\(\(signal\) => signal\.summary\.en\)/);
  assert.match(opportunity, /strategicActivation/);
  assert.ok(brighton.contextSignalIds.includes("attendance-mun-5402"));
});


test("pilot rehearsal exercises aggregate audience, results and causal guardrails", () => {
  const rehearsal = read("scripts/run-pilot-rehearsal.mjs");
  const helper = read("scripts/lib/crm-ticketing-aggregate.mjs");
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.scripts["rehearse:pilot"], "node scripts/run-pilot-rehearsal.mjs");
  assert.match(rehearsal, /synthetic-rehearsal/);
  assert.match(rehearsal, /productionClaim: false/);
  assert.match(rehearsal, /addressableRepeatCohort/);
  assert.match(rehearsal, /campaignAttributedTickets/);
  assert.match(rehearsal, /incrementality: "not-established"/);
  assert.match(helper, /raw supporter|supporter_id_hash/i);
  assert.match(helper, /fixtureSummaries/);
  assert.match(helper, /repeatCohorts/);
});


test("pilot rehearsal is clearly synthetic and reachable from the operating pack", () => {
  const rehearsal = read("src/app/pilot/rehearsal/page.tsx");
  const pack = read("src/app/pilot/operating-pack/page.tsx");
  assert.match(rehearsal, /Synthetic rehearsal/);
  assert.match(rehearsal, /No production claim/);
  assert.match(rehearsal, /Attribution is visible; incrementality remains unproven/);
  assert.match(rehearsal, /Raw supporter rows stored/);
  assert.match(pack, /\/pilot\/rehearsal/);
});


test("product cases keep composite score in the analyst layer", () => {
  const page = read("src/app/cases/page.tsx");
  assert.doesNotMatch(page, />Score</);
  assert.doesNotMatch(page, /planningScore/);
  assert.match(page, /Decision posture/);
  assert.match(page, /composite score in the analyst layer/);
});


test("pilot weekly example reads the current product opportunity", () => {
  const page = read("src/app/pilot/page.tsx");
  assert.match(page, /getCurrentProductOpportunity/);
  assert.match(page, /live\?\.nextAction\.label/);
  assert.match(page, /live\?\.decisionState/);
  assert.match(page, /Requires club data/);
  assert.match(page, /\/pilot\/rehearsal/);
  assert.doesNotMatch(page, /Go with conditions/);
});


test("homepage sells the product with demo conversion and transparent packages", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /Request a demo/);
  assert.match(page, /Pricing/);
  assert.match(page, /£4,500/);
  assert.match(page, /£1,500/);
  assert.match(page, /£3,000/);
  assert.match(page, /Indicative starting prices/);
  assert.match(page, /live\?\.nextAction\.label/);
  assert.match(page, /London City Live/);
});

test("National Rail RDM is registered as approved access awaiting a data product", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const rdm = data.sources.find((source) => source.id === "national-rail-rdm");
  assert.ok(rdm);
  assert.equal(rdm.label.en, "National Rail / Rail Data Marketplace");
  assert.equal(rdm.access, "account-approved-product-pending");
  assert.equal(rdm.state, "not-configured");
  assert.match(rdm.note.en, /TransportAPI remains the temporary national-routing fallback/);

  const env = read(".env.example");
  assert.match(env, /RDM_DATA_PRODUCT_ID=/);
  assert.match(env, /RDM_DELIVERY_ENDPOINT=/);
  assert.match(env, /RDM_AUTH_MODE=/);
});

