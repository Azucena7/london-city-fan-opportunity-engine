import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

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

test("canonical AVELA navigation exposes the decision workflow", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  for (const route of ["/app", "/app/matches", "/app/campaigns", "/app/players", "/app/learning", "/app/season"]) {
    assert.ok(nav.includes(`"${route}"`), `${route} should be visible in product navigation`);
  }
  for (const label of ["Home", "Radar", "Campaigns", "Player assets", "Learning", "Season"]) {
    assert.ok(nav.includes(label), `${label} should be visible in product navigation`);
  }
});

test("document language and keyboard bypass are part of the root shell", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /lang=\{initialLang\}/);
  assert.match(layout, /className="skipLink"/);
  assert.match(layout, /href="#main-content"/);
});

test("canonical Sources keeps permission boundaries explicit", () => {
  const page = read("src/app/app/sources/page.tsx");
  const component = read("src/components/IntelligenceSources.tsx");
  assert.match(page, /IntelligenceSources/);
  assert.match(component, /Public demo evidence/);
  assert.match(component, /Requires access/);
  assert.match(component, /active Blinkfire licence/);
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
  assert.match(technical, /Decision validation/);
  assert.match(technical, /never implies causation/);
});

test("social sharing matches the current AVELA product story", () => {
  const layout = read("src/app/layout.tsx");
  const card = read("src/app/linkedin-card/route.tsx");
  const og = read("src/app/opengraph-image.tsx");
  assert.match(layout, /AVELA · Decision Intelligence for Football Clubs/);
  assert.match(layout, /Connect signals, club context and operational constraints/);
  assert.match(card, /DECISION INTELLIGENCE FOR FOOTBALL CLUBS/);
  assert.match(card, /Radar/);
  assert.match(card, /Opportunity brief/);
  assert.match(card, /Campaign/);
  assert.match(card, /Learning/);
  assert.match(og, /READ THE SIGNALS\. MOVE THE CLUB\./);
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


test("retired analyst routes redirect into canonical AVELA surfaces", () => {
  const config = read("next.config.mjs");
  for (const route of ["/today", "/this-week", "/calendar", "/fixtures", "/opportunities", "/signals"]) {
    assert.match(config, new RegExp(`source: "${route.replace("/", "\\/")}"`));
  }
  assert.match(config, /source: "\/measurement", destination: "\/app\/learning"/);
  assert.match(config, /source: "\/sources", destination: "\/app\/sources"/);
  assert.match(config, /source: "\/club-demo\/:path\*", destination: "\/app\/demo"/);
});



test("club app includes a guided demo that uses the real fixture workflow", () => {
  const demo = read("src/components/DemoTour.tsx");
  const page = read("src/app/app/demo/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(demo, /3-minute guided demo/);
  assert.match(demo, /Fixture detected/);
  assert.match(demo, /Engine recommends/);
  assert.match(demo, /Campaign built/);
  assert.match(demo, /Review & handoff/);
  assert.match(demo, /same product logic and current public evidence/);
  assert.match(demo, /Open campaign builder/);
  assert.match(page, /getCurrentProductOpportunity/);
  assert.match(page, /campaignPlans/);
  assert.match(nav, />Product demo</);
  assert.match(nav, /\/app\/demo/);
});

test("club campaign workspace supports authenticated multi-user persistence with RLS", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const server = read("src/lib/supabaseServer.ts");
  const session = read("src/app/api/auth/session/route.ts");
  const login = read("src/app/api/auth/login/route.ts");
  const workspace = read("src/app/api/campaign-workspace/[fixtureId]/route.ts");
  const effort = read("src/app/api/delivery-effort/route.ts");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");
  const effortMigration = read("supabase/migrations/20261004193752_create_delivery_effort_events.sql");

  assert.match(builder, /Connect club workspace/);
  assert.match(builder, /Pilot account sign-in/);
  assert.match(builder, /Synced to \$\{clubs/);
  assert.match(builder, /\/api\/campaign-record\//);
  assert.match(builder, /\/api\/delivery-effort/);
  assert.match(builder, /eventKey/);
  assert.match(builder, /Remote persistence is protected by club membership and row-level security/);

  assert.match(server, /httpOnly: true/);
  assert.match(server, /sameSite: "lax"/);
  assert.match(server, /SUPABASE_PUBLISHABLE_KEY/);
  assert.match(session, /club_memberships/);
  assert.match(login, /grant_type=password/);
  assert.match(workspace, /on_conflict=club_id,fixture_id/);
  assert.match(effort, /on_conflict=event_key/);

  assert.match(migration, /enable row level security/);
  assert.match(migration, /club_has_permission/);
  assert.match(migration, /'campaigns', 'edit'/);
  assert.match(migration, /'campaigns', 'approve'/);
  assert.match(migration, /campaign_workspaces/);
  assert.match(effortMigration, /delivery_effort_events/);
  assert.match(effortMigration, /units integer not null/);
  assert.match(effortMigration, /event_key text unique/);
  assert.match(effortMigration, /enable row level security/);
  assert.match(effortMigration, /auth\.uid\(\)/);
});

test("retired Credit Center no longer appears as a product surface", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const config = read("next.config.mjs");

  assert.doesNotMatch(nav, /href: "\/app\/credits"/);
  assert.doesNotMatch(nav, /label: "Credits"/);
  assert.match(config, /source: "\/app\/credits", destination: "\/app\/campaigns"/);
  assert.equal(existsSync("src/components/CreditCenter.tsx"), false);
  assert.equal(existsSync("src/components/CreditCenter.module.css"), false);
  assert.equal(existsSync("src/app/app/credits/page.tsx"), false);
  assert.equal(existsSync("src/app/app/credits/credits.module.css"), false);
});


test("delivery planner uses effort naming while preserving legacy persisted state compatibility", () => {
  const planner = read("src/components/CampaignDeliveryPlanner.tsx");
  assert.match(planner, /EffortCategory/);
  assert.match(planner, /baseEffort/);
  assert.match(planner, /generatedEffort/);
  assert.match(planner, /lockedCampaignEffort/);
  assert.match(planner, /effortToLock/);
  assert.doesNotMatch(planner, /type CreditCategory/);
  assert.doesNotMatch(planner, /baseCredits/);
  assert.doesNotMatch(planner, /totalCredits/);
  assert.match(planner, /reservedCampaignCredits/);
  assert.match(planner, /else if \(typeof workspace\.reservedCampaignCredits === "number"\)/);
  assert.doesNotMatch(planner, /reservedCampaignCredits: lockedCampaignEffort/);
});


test("delivery effort API uses canonical unit storage", () => {
  const route = read("src/app/api/delivery-effort/route.ts");
  assert.match(route, /units\?: number/);
  assert.match(route, /delivery_effort_events/);
  assert.match(route, /select=id,fixture_id,item_id,event_type,units,note,created_at/);
  assert.doesNotMatch(route, /credit_ledger|credits/);
});

test("active campaign surfaces no longer expose credit purchase language", () => {
  const setup = read("src/components/ClubSetup.tsx");
  const trace = read("src/components/LearningCampaignTrace.tsx");
  const route = read("src/app/api/campaign-draft/route.ts");
  assert.match(setup, /campaign scope is locked/);
  assert.match(setup, /approval before scope lock/);
  assert.doesNotMatch(setup, /credits are reserved|approval before reservation/);
  assert.match(trace, /Scope lock/);
  assert.doesNotMatch(trace, /Credits reserved/);
  assert.match(route, /draftEffort/);
  assert.match(route, /effortUnits/);
  assert.doesNotMatch(route, /creditsCommitted|draftCredits/);
});

test("campaign builder can generate real CRM and vertical-video drafts through a server route", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const route = read("src/app/api/campaign-draft/route.ts");
  const env = read(".env.example");

  assert.match(builder, /Generate draft/);
  assert.match(builder, /Generative production/);
  assert.match(builder, /effort units already generated/);
  assert.match(builder, /Local on this device/);
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
  assert.match(route, /effortUnits/);
  assert.match(route, /persistence: "device-workspace"/);

  assert.match(env, /AI_GATEWAY_API_KEY=/);
  assert.match(env, /AI_GATEWAY_MODEL=/);
});

test("Opportunity Brief explains execution fit without letting club setup rewrite evidence", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
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
  const matches = read("src/app/app/matches/page.tsx");
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

test("first club admin is bootstrapped only by a confirmed private email invite", () => {
  const migration = read("supabase/bootstrap/campaign_workspace.sql");

  assert.match(migration, /private\.club_admin_invites/);
  assert.match(migration, /email_confirmed_at is null/);
  assert.match(migration, /lower\(email\)=lower\(new\.email\)/);
  assert.match(migration, /role='admin'/);
  assert.match(migration, /security definer/);
  assert.match(migration, /revoke all on function private\.apply_confirmed_admin_invite/);
  assert.match(migration, /after insert or update of email_confirmed_at, email on auth\.users/);
});

test("Supabase server config requires the canonical CLUB namespace", () => {
  const helper = read("src/lib/supabaseServer.ts");
  const env = read(".env.example");
  assert.match(helper, /CLUB_SUPABASE_URL/);
  assert.match(helper, /NEXT_PUBLIC_CLUB_SUPABASE_URL/);
  assert.match(helper, /CLUB_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(helper, /NEXT_PUBLIC_CLUB_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(helper, /process\.env\.SUPABASE_URL/);
  assert.doesNotMatch(helper, /process\.env\.SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(helper, /process\.env\.SUPABASE_ANON_KEY/);
  assert.match(env, /^CLUB_SUPABASE_URL=/m);
  assert.match(env, /^CLUB_SUPABASE_PUBLISHABLE_KEY=/m);
  assert.doesNotMatch(env, /^SUPABASE_URL=/m);
  assert.doesNotMatch(env, /^SUPABASE_ANON_KEY=/m);
  assert.doesNotMatch(env, /^DATABASE_URL=/m);
});

test("pilot access separates identity from club membership and supports admin approval", () => {
  const access = read("src/components/AccessCenter.tsx");
  const signup = read("src/app/api/auth/signup/route.ts");
  const accessApi = read("src/app/api/access/route.ts");
  const approve = read("src/app/api/access/approve/route.ts");
  const nav = read("src/components/ProductJourneyNav.tsx");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");

  assert.match(access, /Secure pilot access without opening the club workspace/);
  assert.match(access, /Authentication proves identity\. Membership grants club access/);
  assert.match(access, /Create account/);
  assert.match(access, /Request access/);
  assert.match(access, /Pending club access/);
  assert.match(access, /\/api\/access\/approve/);

  assert.match(signup, /\/auth\/v1\/signup/);
  assert.match(signup, /confirmationRequired: true/);
  assert.match(signup, /password\.length < 10/);

  assert.match(accessApi, /club_access_requests/);
  assert.match(accessApi, /user_id: user\.id/);
  assert.match(accessApi, /status: "pending"/);

  assert.match(approve, /approve_club_access_request/);
  assert.match(approve, /Authentication required/);

  assert.match(nav, /href: "\/app\/access"/);
  assert.match(nav, /label: "Team"/);

  assert.match(migration, /create table if not exists public\.club_access_requests/);
  assert.match(migration, /security invoker/);
  assert.match(migration, /campaigns', 'administer'/);
  assert.match(migration, /authenticated users can discover clubs/);
  assert.match(migration, /Authentication alone never grants club access/);
});

test("club setup context differentiates the engine from replacement CRM and generic campaign tools", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
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

  assert.match(home, /Decision intelligence for football clubs/);
  assert.match(home, /Works above your existing stack/);
  assert.match(home, /FIXTURES/);
  assert.match(home, /growth-intelligence layer|decision layer/i);
});

test("club setup persists reusable fixture, channel, objective, brand and approval context", () => {
  const setup = read("src/components/ClubSetup.tsx");
  const route = read("src/app/api/club-setup/route.ts");
  const nav = read("src/components/ProductJourneyNav.tsx");
  const page = read("src/app/app/setup/page.tsx");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");

  assert.match(setup, /Configure once\. Let every fixture start with context/);
  assert.match(setup, /Fixture source/);
  assert.match(setup, /connectedChannels/);
  assert.match(setup, /priorityObjectives/);
  assert.match(setup, /Brand rules/);
  assert.match(setup, /Require campaign approval before scope lock/);
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
  const page = read("src/app/app/learning/page.tsx");
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
  const learning = read("src/app/app/learning/page.tsx");
  const trace = read("src/components/LearningCampaignTrace.tsx");

  assert.match(learning, /LearningCampaignTrace/);
  assert.match(learning, /fixtureId=\{selectedId\}/);

  assert.match(trace, /Execution trace/);
  assert.match(trace, /what actually executed and what happened next/i);
  assert.match(trace, /workflow completion/);
  assert.match(trace, /No execution evidence/);
  assert.match(trace, /Missing stages stay missing rather than being inferred/);
  assert.match(trace, /Use ticketing, CRM, scan and revenue evidence to assess outcomes/);
  assert.match(trace, /credible counterfactual/);
  assert.match(trace, /\/api\/campaign-history/);
  assert.match(trace, /\/api\/auth\/session/);
});

test("campaign history records shared fixture milestones without conflating them with the credit ledger", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const route = read("src/app/api/campaign-history/[fixtureId]/route.ts");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");

  assert.match(builder, /Campaign history/);
  assert.match(builder, /One timeline from review to launch handoff/);
  assert.match(builder, /\/api\/campaign-history/);
  assert.match(builder, /draft-generated/);
  assert.match(builder, /Campaign moved to review/);
  assert.match(builder, /Campaign scope locked/);
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

test("campaign flow reviews and locks scope before a truthful launch handoff", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");

  assert.match(builder, /Scope/);
  assert.match(builder, /Review/);
  assert.match(builder, /Lock/);
  assert.match(builder, /Handoff/);
  assert.match(builder, /Lock reviewed scope/);
  assert.match(builder, /campaign:reserve/);
  assert.match(builder, /campaign:release/);
  assert.match(builder, /Existing generated-draft effort is excluded/);
  assert.match(builder, /Scope locked by reservation/);
  assert.match(builder, /Reopen campaign scope/);
  assert.match(builder, /Prepare launch handoff/);
  assert.match(builder, /External launch required/);
  assert.match(builder, /AVELA prepares the handoff only/);
  assert.match(builder, /no CRM send, social publish or media spend happens/);
});

test("campaign reservation cycles are uniquely identifiable and repeat safely", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const trace = read("src/components/LearningCampaignTrace.tsx");

  assert.match(builder, /reservationId/);
  assert.match(builder, /crypto\.randomUUID\(\)/);
  assert.match(builder, /campaign:reserve:\$\{cycleId\}/);
  assert.match(builder, /campaign:release:\$\{reservationId\}/);
  assert.match(builder, /reserve-history:\$\{cycleId\}/);
  assert.match(builder, /release-history:\$\{reservationId\}/);
  assert.match(builder, /const hasReservation = Boolean\(reservationId\)/);
  assert.match(builder, /setReservationId\(null\)/);

  assert.match(trace, /latestReservationEvent/);
  assert.match(trace, /latestReservationEvent\?\.event_type === "reserve"/);
  assert.match(trace, /latestReservationEvent\?\.event_type === "release"/);
});

test("match plan keeps delivery effort visible without an in-product credit paywall", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(builder, /Campaign proposal/);
  assert.match(builder, /approval-ready campaign/);
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
  assert.match(builder, /Delivery effort/);
  assert.match(builder, /internal planning signal, not a purchasable currency/);
  assert.match(builder, /Lock reviewed scope/);
  assert.match(builder, /Prepare launch handoff/);
  assert.match(builder, /External launch required/);
  assert.match(builder, /External tools or club operators must execute the launch/);
  assert.doesNotMatch(builder, /Explorer · preview only/);
  assert.doesNotMatch(builder, /included credits/);
  assert.doesNotMatch(builder, /Upgrade to reveal/);
  assert.doesNotMatch(builder, /Add credits/);
  assert.doesNotMatch(builder, /£175|£450|£1,000/);
  assert.match(page, /CampaignDeliveryPlanner/);
  assert.match(page, /fixtureId=\{fixture\.id\}/);
  assert.doesNotMatch(nav, /href: "\/app\/credits"/);
  assert.doesNotMatch(nav, /label: "Credits"/);
  assert.doesNotMatch(nav, /<strong>60<\/strong> credits/);
});

test("match plan closes with a simple review and handoff gate", () => {
  const decision = read("src/components/MatchPlanDecision.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  assert.match(decision, /Review required/);
  assert.match(decision, /Mark as reviewed locally/);
  assert.match(decision, /does not send campaigns, commit spend or execute club actions/);
  assert.match(page, /MatchPlanDecision/);
  assert.match(page, /id="approval-gates"/);
});

test("match plan exposes a review-ready activation draft", () => {
  const draft = read("src/components/ActivationDraft.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  for (const label of ["Audience", "Channel", "Message", "Timing", "Owner", "Measurement", "Next approval"]) {
    assert.match(draft, new RegExp(label));
  }
  assert.match(draft, /Review all drafted activations/);
  assert.match(page, /ActivationDraft/);
  assert.match(page, /Review the draft, then execute the next actions/);
});

test("match signals can be excluded without mutating engine data", () => {
  const controls = read("src/components/MatchSignalControls.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  assert.match(controls, /Signals used/);
  assert.match(controls, /Confidence with this selection/);
  assert.match(controls, /Recommendation/);
  assert.match(controls, /The recommended play is unchanged in this scenario/);
  assert.match(controls, /Needs review/);
  assert.match(controls, /does not delete the source, edit the evidence register, change the saved Radar rank or authorise a campaign/);
  assert.match(page, /MatchSignalControls/);
});

test("single match workspace absorbs plan evidence signals and impact", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
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
  assert.match(overview, /PUBLIC DEMO · LONDON CITY/);
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
  assert.match(home, /See a live fixture decision/);
  assert.match(home, /href="\/live\/london-city"/);
  assert.match(marketingNav, /Try product/);
  assert.match(marketingNav, /href="\/app\/demo">Try product/);
  assert.match(appNav, /AVELA website/);
  assert.match(appNav, /\/app\/learning/);
  assert.match(config, /source: "\/london-city", destination: "\/live\/london-city"/);
  assert.match(liveCase, /MarketingNav/);
});

test("Learning keeps deep interpretation secondary to observed outcomes", () => {
  const page = read("src/app/app/learning/page.tsx");
  const css = read("src/app/app/learning/results.module.css");
  assert.match(page, /How to read this evidence/);
  assert.match(page, /Attribution ≠ incremental impact/);
  assert.match(page, /fixturePicker/);
  assert.match(page, /fixtureFacts/);
  assert.match(css, /interpretation>summary/);
});

test("matches behaves like a decision inbox with one priority fixture", () => {
  const page = read("src/app/app/matches/page.tsx");
  const css = read("src/app/app/matches/matches.module.css");
  assert.match(page, /Current engine priority/);
  assert.match(page, /Next opportunities/);
  assert.match(page, /Ranked by what deserves attention now/);
  assert.match(page, /Open opportunity brief/);
  assert.match(css, /priorityMatch/);
  assert.match(css, /futureFixture/);
});

test("match plan prioritises one executive campaign decision before deep evidence", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const css = read("src/app/app/matches/[fixtureId]/match-plan.module.css");
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
  const demo = read("src/app/app/demo/page.tsx");
  const demoTour = read("src/components/DemoTour.tsx");
  const operatingPack = read("src/app/pilot/operating-pack/page.tsx");
  const caseOverview = read("src/components/LondonCityCase.tsx");
  for (const source of [cases, pilot, demo, operatingPack, caseOverview]) {
    assert.doesNotMatch(source, /href="\/brief"/);
    assert.doesNotMatch(source, /href="\/opportunity"/);
    assert.doesNotMatch(source, /href="\/decision-room"/);
  }
  assert.match(pilot, /\/app\/matches/);
  assert.match(demo, /DemoTour/);
  assert.match(demoTour, /\/app\/matches\/\$\{props\.fixtureId\}/);
  assert.match(caseOverview, /\/app\/matches\/\$\{opportunity\.fixtureId\}/);
});

test("club product starts from fixtures instead of requiring a plan first", () => {
  const matches = read("src/app/app/matches/page.tsx");
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
  assert.match(productNav, /Radar/);
  assert.match(productNav, /Learning/);
  assert.match(productNav, /AVELA website/);
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


test("canonical club app routes opt into the shared product shell", () => {
  const routes = [
    "src/app/app/page.tsx",
    "src/app/app/matches/page.tsx",
    "src/app/app/matches/[fixtureId]/page.tsx",
    "src/app/app/campaigns/page.tsx",
    "src/app/app/players/page.tsx",
    "src/app/app/learning/page.tsx",
    "src/app/app/season/page.tsx",
    "src/app/app/executive/page.tsx",
    "src/app/app/sources/page.tsx"
  ];
  for (const route of routes) {
    assert.match(read(route), /AppWorkspaceShell|productAppShell/, route + " should use the product app shell");
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
    "src/app/app/matches/[fixtureId]/page.tsx",
    "src/app/app/learning/page.tsx"
  ]) {
    assert.match(read(route), /ProductDataStateLegend/, route + " should show the shared data-state legend");
  }
});


test("Results switches from missing to measured only through the live CRM slot", () => {
  const page = read("src/app/app/learning/page.tsx");
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
  const brief = read("src/app/app/matches/[fixtureId]/page.tsx");

  assert.match(opportunity, /recommendedAction/);
  assert.match(opportunity, /nextRequiredAction/);
  assert.match(opportunity, /campaign\?\.nextApproval\.en/);
  assert.match(opportunity, /OVERDUE/);
  assert.match(brief, /nextAction\.label/);
  assert.match(brief, /Recommended play/);
});


test("fixture lifecycle keeps pre-match and post-match UX distinct", () => {
  const opportunity = read("src/lib/productOpportunity.ts");
  const results = read("src/app/app/learning/page.tsx");
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
  const results = read("src/app/app/learning/page.tsx");
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


test("AVELA commercial home uses an editorial product-theatre identity with purposeful motion", () => {
  const page = read("src/app/page.tsx");
  const homeCss = read("src/app/commercial-home.module.css");
  const motion = read("src/components/CommercialSignalStage.tsx");
  const motionCss = read("src/components/CommercialSignalStage.module.css");
  const productSystem = read("src/app/product-system.css");
  const appNav = read("src/components/ProductJourneyNav.tsx");

  assert.match(page, /Read the signals/);
  assert.match(page, /Works above your existing stack/);
  assert.match(page, /The problem is not missing data/);
  assert.match(page, /CommercialSignalStage/);
  assert.match(page, /See a live fixture decision/);

  assert.match(motion, /Fixture → decision → action/);
  assert.match(motion, /Opportunity/);
  assert.match(motion, /Recommended play/);
  assert.match(motionCss, /@keyframes drift/);
  assert.match(motionCss, /prefers-reduced-motion:no-preference/);

  assert.match(homeCss, /--avela-paper:#f8f6f1/i);
  assert.match(homeCss, /--avela-coral:#ef8b6c/i);
  assert.match(homeCss, /exampleGrid/);
  assert.match(homeCss, /liveProof/);

  assert.match(productSystem, /--product-space-xl/);
  assert.match(productSystem, /--product-orange/);
  assert.match(appNav, /label: "Radar"/);
  assert.match(appNav, /label: "Team"/);
  assert.doesNotMatch(appNav, /<strong>60<\/strong> credits/);
});

test("club UX exposes clear setup, access and campaign next-step flows", () => {
  const setup = read("src/components/ClubSetup.tsx");
  const access = read("src/components/AccessCenter.tsx");
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const learningCss = read("src/app/app/learning/results.module.css");

  assert.match(setup, /Club setup progress/);
  assert.match(setup, /Save and use for next fixture/);
  assert.match(access, /Secure access flow/);
  assert.match(access, /Workspace unlocked/);
  assert.match(access, /Authentication established identity/);
  assert.match(builder, /Do next/);
  assert.match(builder, /Finish the campaign scope and mark it ready for review/);
  assert.match(builder, /Nothing is published or spent from this workspace/);
  assert.match(learningCss, /AVELA learning visual refresh/);
});

test("club surfaces use explicit loading states and mobile-first controls", () => {
  const setup = read("src/components/ClubSetup.tsx");
  const setupCss = read("src/components/ClubSetup.module.css");
  const access = read("src/components/AccessCenter.tsx");
  const accessCss = read("src/components/AccessCenter.module.css");
  const radarCss = read("src/app/app/matches/matches.module.css");
  const learningCss = read("src/app/app/learning/results.module.css");

  assert.match(setup, /Loading club context/);
  assert.match(setup, /configured === null/);
  assert.match(access, /Checking account and club access/);
  assert.match(access, /configured === null/);
  assert.match(setupCss, /min-height:44px/);
  assert.match(accessCss, /width:100%/);
  assert.match(radarCss, /@media\(max-width:620px\)/);
  assert.match(learningCss, /fixturePicker\{display:grid/);
});

test("National Rail RDM is registered as approved access awaiting a data product", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const rdm = data.sources.find((source) => source.id === "national-rail-rdm");
  assert.ok(rdm);
  assert.equal(rdm.label.en, "National Rail / Rail Data Marketplace");
  assert.equal(rdm.access, "account-approved-product-pending");
  assert.equal(rdm.state, "not-configured");
  assert.match(rdm.note.en, /national rail routing remains unavailable until an RDM product is validated and connected/);
  assert.doesNotMatch(rdm.note.en, /TransportAPI|fallback/i);

  const env = read(".env.example");
  assert.match(env, /RDM_DATA_PRODUCT_ID=/);
  assert.match(env, /RDM_DELIVERY_ENDPOINT=/);
  assert.match(env, /RDM_AUTH_MODE=/);
});



test("Opportunity Radar is the primary fixture decision surface", () => {
  const radar = read("src/lib/opportunityRadar.ts");
  const matches = read("src/app/app/matches/page.tsx");
  const css = read("src/app/app/matches/matches.module.css");

  assert.match(radar, /opportunityScore: number \| null/);
  assert.match(radar, /urgency: "Immediate" \| "Soon" \| "Watch"/);
  assert.match(radar, /recentMaterialSignalCount/);
  assert.match(radar, /No material opportunity/);
  assert.match(radar, /new material signal/);
  assert.match(matches, /Opportunity score/);
  assert.match(matches, /Signal movement/);
  assert.match(matches, /signalChangeLabel/);
  assert.match(matches, /Open opportunity brief/);
  assert.match(css, /radarScoreline/);
  assert.match(css, /stateNomaterialopportunity/);
});


test("Opportunity Brief supports transparent signal what-if recalculation", () => {
  const controls = read("src/components/MatchSignalControls.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const product = read("src/lib/productOpportunity.ts");

  assert.match(controls, /Core evidence/);
  assert.match(controls, /Observed/);
  assert.match(controls, /Excluded temporarily/);
  assert.match(controls, /How recalculation works/);
  assert.match(controls, /No source data has been changed/);
  assert.match(controls, /does not delete the source/);
  assert.match(controls, /change the saved Radar rank/);
  assert.match(controls, /isCoreEvidence/);
  assert.match(controls, /disabled=\{core\}/);
  assert.match(page, /Inspect, exclude & recalculate/);
  assert.match(product, /observedAt: signal\.observedAt/);
});


test("Opportunity Brief reads like an executive decision brief", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const css = read("src/app/app/matches/[fixtureId]/match-plan.module.css");

  assert.match(page, /Executive opportunity summary/);
  assert.match(page, /Opportunity score/);
  assert.match(page, /Decision state/);
  assert.match(page, /Signal movement/);
  assert.match(page, /Commercial objective/);
  assert.match(page, /Evidence used/);
  assert.match(page, /Decision support, not autopilot/);
  assert.match(page, /Do not launch yet/);
  assert.match(page, /Ready for human review/);
  assert.match(page, /confidence\.rationale/);
  assert.match(css, /executiveStrip/);
  assert.match(css, /briefDecision/);
});


test("commercial case study leads with time-stamped prediction versus observable reality", () => {
  const story = read("src/components/LocalizedStoryPage.tsx");
  const css = read("src/app/intelligence-surfaces.css");
  assert.match(story, /BEFORE THE CLUB ANNOUNCED IT/);
  assert.match(story, /AVELA SAW/);
  assert.match(story, /LONDON CITY ANNOUNCED/);
  assert.match(story, /3<\/b>/);
  assert.match(story, /WHAT IT DOES SHOW/);
  assert.match(story, /WHAT IT DOES NOT SHOW/);
  assert.match(story, /Open the full evidence trail/);
  assert.match(story, /AVELA · London City Live Proof/);
  assert.match(css, /predictionProofFlow/);
  assert.match(css, /predictionProofBoundary/);
});


test("commercial home turns London City proof into a concrete 90-day pilot path", () => {
  const page = read("src/app/page.tsx");
  const css = read("src/app/commercial-home.module.css");
  assert.match(page, /See what AVELA saw before London City announced it/);
  assert.match(page, /AVELA saw/);
  assert.match(page, /London City later announced/);
  assert.match(page, /evidence of relevance/);
  assert.match(page, /Prove the decision loop before you expand the integration footprint/);
  assert.match(page, /4–6 fixtures/);
  assert.match(page, /1–2 workflows/);
  assert.match(page, /Measured learning/);
  assert.match(page, /See how AVELA could fit your club/);
  assert.match(css, /proofPair/);
  assert.match(css, /pilotSteps/);
});

test("AVELA visual system removes olive identity and simplifies club app navigation", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const navCss = read("src/components/ProductJourneyNav.module.css");
  const system = read("src/app/product-system.css");
  const commercial = read("src/app/commercial-home.module.css");
  assert.match(nav, /Radar/);
  assert.match(nav, /Campaigns/);
  assert.match(nav, /Learning/);
  assert.match(nav, /const workspaceItems/);
  assert.match(nav, />Club<\/span>/);
  assert.doesNotMatch(nav, /label: "London City Live"/);
  assert.doesNotMatch(nav, /primaryItems[\s\S]*label: "Credits"/);
  assert.match(system, /--product-accent:#2F8F83/);
  assert.match(system, /--product-signal:#EF8B6C/);
  assert.match(system, /--product-bg:#F8F6F1/);
  assert.doesNotMatch(system, /#C7EA3A/);
  assert.doesNotMatch(system, /#526D00/i);
  assert.match(navCss, /#102742/);
  assert.match(navCss, /#2F8F83/);
  assert.match(commercial, /#102742/i);
});

test("AVELA uses an application shell with a left sidebar and bounded work area", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const navCss = read("src/components/ProductJourneyNav.module.css");
  const system = read("src/app/product-system.css");
  assert.match(nav, /aside className=\{styles\.sidebar\}/);
  assert.match(nav, /Club workflow/);
  assert.match(navCss, /position:fixed/);
  assert.match(navCss, /width:232px/);
  assert.match(system, /margin-left:232px/);
  assert.match(system, /width:calc\(100% - 232px\)/);
  assert.match(system, /@media\(max-width:900px\)\{\.productAppShell\{margin-left:0;width:100%\}\}/);
  assert.doesNotMatch(system, /\.productAppShell\{padding-left:232px/);
  assert.match(system, /max-width:1120px/);
});

test("commercial and London City surfaces use bounded reading widths and demo framing", () => {
  const commercial = read("src/app/commercial-home.module.css");
  const live = read("src/components/LondonCityCase.tsx");
  const liveCss = read("src/components/LondonCityLive.module.css");
  const clubs = read("src/components/ClubPilotProposition.tsx");
  assert.match(commercial, /width:min\(1120px/);
  assert.match(commercial, /signalTicker\{[\s\S]*?background:#fff/);
  assert.match(live, /PUBLIC DEMO · LONDON CITY/);
  assert.match(liveCss, /width:min\((980|1120)px/);
  assert.match(clubs, /INDEPENDENT DEMO/);
});

test("Intelligence Sources exposes Blinkfire as public demo evidence without faking private access", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const sources = read("src/components/IntelligenceSources.tsx");
  const page = read("src/app/app/sources/page.tsx");
  assert.match(nav, /label: "Sources"/);
  assert.match(nav, /\/app\/sources/);
  assert.match(page, /IntelligenceSources/);
  assert.match(sources, /Blinkfire/);
  assert.match(sources, /Public demo evidence/);
  assert.match(sources, /active Blinkfire licence/);
  assert.match(sources, /Private club-level data is not accessed in this demo/);
  assert.match(sources, /Blinkfire measurement/);
  assert.match(sources, /AVELA learning/);
});


test("final visual pass removes legacy olive neutrals from primary product surfaces", () => {
  const system = read("src/app/product-system.css");
  const radar = read("src/app/app/matches/matches.module.css");
  const brief = read("src/app/app/matches/[fixtureId]/match-plan.module.css");
  const commercial = read("src/app/commercial-home.module.css");
  assert.doesNotMatch(system, /16,33,27/);
  assert.doesNotMatch(commercial, /199,234,58/);
  assert.doesNotMatch(commercial, /--lime|--cream/);
  assert.doesNotMatch(radar, /#d9dfda|#68756d|#637068/i);
  assert.doesNotMatch(brief, /#d9dfda|#68756d|#5f6c64/i);
});


test("campaign builder makes the recommended campaign path visually explicit", () => {
  const builder = read("src/components/CampaignDeliveryPlanner.tsx");
  const css = read("src/components/CampaignDeliveryPlanner.module.css");
  assert.match(builder, /Campaign path/);
  assert.match(builder, /Opportunity/);
  assert.match(builder, /Recipe/);
  assert.match(builder, /Review/);
  assert.match(builder, /Reserve/);
  assert.match(builder, /Handoff/);
  assert.match(builder, /Recommended campaign flow/);
  assert.match(builder, /journeySteps/);
  assert.match(css, /guidedSteps/);
  assert.match(css, /recipeMap/);
});


test("app Home surfaces the next decision before navigation", () => {
  const home = read("src/app/app/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(home, /Decision Center/);
  assert.match(home, /need your attention/);
  assert.match(home, /Highest current priority/);
  assert.match(home, /Decision queue/);
  assert.match(home, /What should I look at next\?/);
  assert.match(home, /Opportunity Radar/);
  assert.match(home, /Campaign execution/);
  assert.match(home, /Club context/);
  assert.match(home, /Learning/);
  assert.match(home, /AVELA decision loop/);
  assert.match(nav, /label: "Home"/);
});

test("campaign index visualizes approval progress and next decision", () => {
  const campaigns = read("src/app/app/campaigns/page.tsx");
  assert.match(campaigns, /progressBar/);
  assert.match(campaigns, /Next decision/);
});


test("Opportunity Brief keeps long-form work navigable with a sticky context rail", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const css = read("src/app/app/matches/[fixtureId]/match-plan.module.css");
  assert.match(page, /Opportunity workspace sections/);
  assert.match(page, /href="#decision"/);
  assert.match(page, /href="#readiness"/);
  assert.match(page, /href="#execute"/);
  assert.match(page, /href="#evidence"/);
  assert.match(page, /href="#learning"/);
  assert.match(css, /position:sticky/);
});

test("Learning uses a semantic navigation state instead of the legacy results key", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const learning = read("src/app/app/learning/page.tsx");
  assert.match(nav, /key: "learning"/);
  assert.match(learning, /active="learning"/);
  assert.doesNotMatch(nav, /key: "results"/);
  assert.doesNotMatch(learning, /active="results"/);
});

test("Campaigns uses a semantic navigation state instead of the legacy brief key", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const campaigns = read("src/app/app/campaigns/page.tsx");
  assert.match(nav, /key: "campaigns"/);
  assert.match(campaigns, /active="campaigns"/);
});


test("Radar includes an interactive visual Opportunity Explorer", () => {
  const radar = read("src/app/app/matches/page.tsx");
  const explorer = read("src/components/OpportunityExplorer.tsx");
  assert.match(radar, /OpportunityExplorer/);
  assert.match(explorer, /Opportunity map/);
  assert.match(explorer, /Campaign readiness/);
  assert.match(explorer, /Signal pulse/);
  assert.match(explorer, /Higher = stronger opportunity/);
  assert.match(explorer, /driver bars are separate signals, not an additive score formula/i);
});

test("Season Intelligence aggregates campaigns and evidence without treating missing as zero", () => {
  const page = read("src/app/app/season/page.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(page, /Season Intelligence/);
  assert.match(page, /Are we getting better across the season/);
  assert.match(page, /Home attendance trend/);
  assert.match(page, /Activation mix/);
  assert.match(page, /Season opportunity timeline/);
  assert.match(page, /Missing fixtures are not shown as zero/);
  assert.match(page, /drafted activation volume, not channel performance or incremental impact/);
  assert.match(nav, /label: "Season"/);
  assert.match(nav, /\/app\/season/);
});


test("Player Asset Planning optimises multi-player packs with contract, capacity, cost and opportunity cost", () => {
  const strategy = read("src/lib/clubStrategy.ts");
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const nav = read("src/components/ProductJourneyNav.tsx");
  assert.match(strategy, /recommendPlayerPacks/);
  assert.match(strategy, /opportunityCost/);
  assert.match(strategy, /sportingAvailability/);
  assert.match(strategy, /commercialAvailabilityOverride/);
  assert.match(planner, /Players needed/);
  assert.match(planner, /Pack Optimizer/);
  assert.match(planner, /Best combinations/);
  assert.match(nav, /Player assets/);
});

test("International duty supports watch windows, private pre-alerts and public confirmations", () => {
  const strategy = read("src/lib/clubStrategy.ts");
  const data = JSON.parse(read("data/seed/club-strategy-demo.json"));
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  assert.match(strategy, /InternationalDutyState/);
  assert.match(strategy, /manual-private/);
  assert.match(strategy, /public-confirmed/);
  assert.match(strategy, /internationalAvailabilityAlerts/);
  assert.match(strategy, /internationalDuty/);
  assert.ok(data.internationalDuty.some((item) => item.state === "window"));
  assert.ok(data.internationalDuty.some((item) => item.state === "manual-private" && item.public === false));
  assert.ok(data.internationalDuty.some((item) => item.state === "public-confirmed"));
  assert.match(planner, /International duty alerts/);
  assert.match(planner, /Internal pre-alert/);
  assert.match(planner, /Public confirmation/);
});

test("Season Intelligence includes player asset utilisation without calling usage performance", () => {
  const page = read("src/app/app/season/page.tsx");
  assert.match(page, /Player asset utilisation/);
  assert.match(page, /Momentum and usage are different signals/);
  assert.match(page, /Open Player Asset Planning/);
});


test("Player Asset Planning works for fixture and non-fixture commercial campaigns", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const campaigns = read("src/app/app/campaigns/page.tsx");
  const data = JSON.parse(read("data/seed/club-strategy-demo.json"));
  assert.match(planner, /Campaign context/);
  assert.match(planner, /demoCommercialCampaigns/);
  assert.match(planner, /campaignOptions/);
  assert.match(planner, /selectedCampaign\.activationDate/);
  assert.match(planner, /selectedCampaign\.playerNeed/);
  assert.match(planner, /avela:player-pack/);
  assert.match(planner, /saved on this device/);
  assert.match(planner, /does not approve talent use/);
  assert.match(campaigns, /Campaigns that do not need a fixture to exist/);
  assert.match(campaigns, /season tickets, Christmas, retail, community or sponsor activity/i);
  assert.ok(data.commercialCampaigns.some((item) => item.type === "season-ticket"));
  assert.ok(data.commercialCampaigns.some((item) => item.type === "seasonal"));
  assert.ok(data.commercialCampaigns.some((item) => item.type === "community"));
});


test("Player pack selection syncs complete planning choices through club-scoped RLS", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const route = read("src/app/api/player-pack-selection/[campaignId]/route.ts");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");
  assert.match(planner, /player-pack-selection/);
  assert.match(planner, /Synced to club workspace · selected/);
  assert.match(planner, /Complete the pack to sync shared selection/);
  assert.match(planner, /shared club selection/);
  assert.match(route, /player_pack_selections/);
  assert.match(route, /status: "selected"/);
  assert.match(route, /selectedPlayerIds/);
  assert.match(migration, /create table if not exists public\.player_pack_selections/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /'campaigns', 'edit'/);
  assert.match(migration, /'campaigns', 'approve'/);
  assert.match(migration, /status in \('selected','approved','committed'\)/);
});

test("Player pack governance requires effective approval permission and valid lifecycle transitions", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const session = read("src/app/api/auth/session/route.ts");
  const route = read("src/app/api/player-pack-selection/[campaignId]/route.ts");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");
  assert.match(session, /club_permission_matrix/);
  assert.match(session, /permissions/);
  assert.match(planner, /campaigns:approve/);
  assert.match(planner, /Approve selected pack/);
  assert.match(planner, /Commit approved pack/);
  assert.match(planner, /activeEvaluation\.blockers\.length === 0/);
  assert.match(route, /Only a selected pack can be approved/);
  assert.match(route, /Only an approved pack can be committed/);
  assert.match(route, /Approved or committed packs cannot be overwritten as selected/);
  assert.match(migration, /enforce_player_pack_status_transition/);
  assert.match(migration, /Committed player pack status is immutable/);
});

test("Campaigns surface talent lifecycle and committed packs consume planning capacity", () => {
  const campaigns = read("src/app/app/campaigns/page.tsx");
  const board = read("src/components/CommercialCampaignBoard.tsx");
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const collectionRoute = read("src/app/api/player-pack-selection/route.ts");
  assert.match(campaigns, /CommercialCampaignBoard/);
  assert.match(board, /recommended/);
  assert.match(board, /selected/);
  assert.match(board, /approved/);
  assert.match(board, /committed/);
  assert.match(board, /Open talent pack/);
  assert.match(collectionRoute, /player_pack_selections/);
  assert.match(planner, /committedAppearances/);
  assert.match(planner, /planningAppearances/);
  assert.match(planner, /Committed talent pack/);
  assert.match(planner, /now reserved in player capacity planning/);
});

test("Season Intelligence exposes shared talent pressure before campaign approval", () => {
  const season = read("src/app/app/season/page.tsx");
  const panel = read("src/components/TalentPressurePanel.tsx");
  assert.match(season, /TalentPressurePanel/);
  assert.match(season, /Player conflicts & weekly load/);
  assert.match(panel, /Talent pressure/);
  assert.match(panel, /weekKey/);
  assert.match(panel, /Same-day conflict/);
  assert.match(panel, /days apart/);
  assert.match(panel, /selected/);
  assert.match(panel, /approved/);
  assert.match(panel, /committed/);
  assert.match(panel, /Review pack/);
});

test("Campaigns warns about near-term talent conflicts before approval", () => {
  const board = read("src/components/CommercialCampaignBoard.tsx");
  const css = read("src/app/app/campaigns/campaigns.module.css");
  assert.match(board, /conflictRows/);
  assert.match(board, /sharedIds/);
  assert.match(board, /days > 7/);
  assert.match(board, /talent conflict/);
  assert.match(board, /same day/);
  assert.match(css, /talentConflictAlert/);
});

test("AVELA recommends a resolution for near-term player conflicts", () => {
  const board = read("src/components/CommercialCampaignBoard.tsx");
  const css = read("src/app/app/campaigns/campaigns.module.css");
  assert.match(board, /governanceRank/);
  assert.match(board, /Protect this pack/);
  assert.match(board, /Change this pack/);
  assert.match(board, /Manual resolution required/);
  assert.match(board, /recommendPlayerPacks/);
  assert.match(board, /Best alternative:/);
  assert.match(board, /opportunity cost/);
  assert.match(css, /conflictResolution/);
});

test("Talent conflict alternatives can only be applied safely as selected", () => {
  const board = read("src/components/CommercialCampaignBoard.tsx");
  assert.match(board, /Apply alternative as selected/);
  assert.match(board, /status: "selected"/);
  assert.match(board, /campaigns:edit/);
  assert.match(board, /approval required again/);
  assert.match(board, /Reopen it in Player Assets before changing talent/);
  assert.match(board, /selection\.status !== "selected"/);
  assert.match(board, /alternativePool\.length >= campaign\.playerNeed/);
});

test("Club-system network failures preserve truthful state and recover visibly", () => {
  const continuity = read("src/components/OperationalContinuity.tsx");
  const access = read("src/components/AccessCenter.tsx");
  const setup = read("src/components/ClubSetup.tsx");
  const availability = read("src/components/AvailabilityPlanner.tsx");
  const contracts = read("src/components/ContractReviewQueue.tsx");
  assert.match(continuity, /No continuity data was changed/);
  assert.match(continuity, /Continuity state was not changed/);
  assert.match(access, /Sign-out failed\. Your current session may still be active/);
  assert.match(access, /Account service is unreachable/);
  assert.match(setup, /saving/);
  assert.match(setup, /Existing club defaults were not changed/);
  assert.match(availability, /No availability state was changed/);
  assert.match(contracts, /Contract truth was not changed/);
});

test("Workspace accessibility baseline covers focus, touch targets, drawers and live status", () => {
  const productCss = read("src/app/product-system.css");
  const navCss = read("src/components/ProductJourneyNav.module.css");
  const workspace = read("src/components/WorkspaceUI.tsx");
  const workspaceCss = read("src/components/WorkspaceUI.module.css");
  const access = read("src/components/AccessCenter.tsx");
  const setup = read("src/components/ClubSetup.tsx");
  assert.match(productCss, /:focus-visible/);
  assert.match(productCss, /summary,select,input/);
  assert.match(productCss, /min-height:44px/);
  assert.match(navCss, /pointer:coarse/);
  assert.match(navCss, /mobileMenu summary\{min-height:44px/);
  assert.match(workspace, /whenClosed/);
  assert.match(workspace, /whenOpen/);
  assert.match(workspaceCss, /drawer\[open\]>summary \.whenOpen/);
  assert.match(access, /aria-live="polite"/);
  assert.match(setup, /aria-live="polite"/);
});

test("Fixture campaign builder uses the unified campaign record contract", () => {
  const planner = read("src/components/CampaignDeliveryPlanner.tsx");
  const route = read("src/app/api/campaign-record/[campaignKey]/route.ts");
  const migration = read("supabase/bootstrap/campaign_workspace.sql");
  assert.match(planner, /\/api\/campaign-record\//);
  assert.doesNotMatch(planner, /\/api\/campaign-workspace\//);
  assert.match(planner, /campaignKind: "fixture"/);
  assert.match(route, /campaign_records/);
  assert.match(route, /campaign_kind/);
  assert.match(route, /campaign_key/);
  assert.match(migration, /create table if not exists public\.campaign_records/);
  assert.match(migration, /campaign_kind in \('fixture','commercial'\)/);
  assert.match(migration, /from public\.campaign_workspaces/);
});

test("Commercial campaigns use the unified shared campaign record", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const board = read("src/components/CommercialCampaignBoard.tsx");
  const collection = read("src/app/api/campaign-record/route.ts");
  assert.match(planner, /syncCommercialCampaignRecord/);
  assert.match(planner, /campaignKind: "commercial"/);
  assert.match(planner, /source: "commercial-calendar"/);
  assert.match(planner, /talent:/);
  assert.match(board, /campaign-record\?clubId=/);
  assert.match(board, /recordByCampaign/);
  assert.match(board, /shared campaign record/);
  assert.match(collection, /campaign_records/);
  assert.match(collection, /campaign_kind/);
});

test("Sources uses source-health as the operational connector truth", () => {
  const data = JSON.parse(read("data/live/source-health.json"));
  const sources = read("src/components/IntelligenceSources.tsx");
  assert.ok(data.sources.some((source) => source.id === "blinkfire" && source.state === "requires-access"));
  assert.ok(data.sources.some((source) => source.id === "avela-web-analytics" && source.state === "operational"));
  assert.ok(data.decisions.some((decision) => decision.id === "media-sponsor-learning" && decision.requiredSourceIds.includes("blinkfire")));
  assert.match(sources, /sourceHealth/);
  assert.match(sources, /aggregateHealth/);
  assert.match(sources, /Last successful/);
  assert.match(sources, /No private successful refresh recorded/);
  assert.doesNotMatch(sources, /stateLabel:/);
});

test("Decision Center elevates source reliability and talent pressure", () => {
  const overview = read("src/lib/decisionCenterOverview.ts");
  assert.match(overview, /source-health-/);
  assert.match(overview, /Required evidence is not fully operational/);
  assert.match(overview, /player_pack_selections/);
  assert.match(overview, /Talent pressure/);
  assert.match(overview, /Shared club talent selections create a near-term capacity conflict/);
  assert.match(overview, /committed/);
  assert.match(overview, /days <= 7/);
});

test("Learning separates recommendation, human decision, execution and outcome evidence", () => {
  const trace = read("src/components/LearningCampaignTrace.tsx");
  const page = read("src/app/app/learning/page.tsx");
  assert.match(trace, /AVELA recommendation/);
  assert.match(trace, /Club decision/);
  assert.match(trace, /Launch handoff prepared · execution not proven/);
  assert.match(trace, /Observed club outcome connected/);
  assert.match(trace, /No shared learning decision recorded/);
  assert.match(trace, /\/api\/decision-history/);
  assert.match(trace, /Shared decision history is unreachable/);
  assert.match(page, /measured=\{Boolean\(measured\)\}/);
});

test("External work handoff requires human confirmation and remains proposed until a real adapter acts", () => {
  const route = read("src/app/api/work-system/handoff/route.ts");
  const control = read("src/components/WorkHandoffConfirmation.tsx");
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const sync = read("src/components/ExternalExecutionSync.tsx");
  assert.match(route, /work_system_connections/);
  assert.match(route, /state=eq\.connected/);
  assert.match(route, /work_routing_rules/);
  assert.match(route, /require_confirmation=eq\.true/);
  assert.match(route, /external_work_packages/);
  assert.match(route, /sync_state: "proposed"/);
  assert.doesNotMatch(route, /external_work_item_links/);
  assert.match(route, /No external tasks were created/);
  assert.match(control, /Confirm handoff package/);
  assert.match(control, /External tasks have not been created yet/);
  assert.match(control, /campaigns:edit/);
  assert.match(page, /WorkHandoffConfirmation/);
  assert.match(sync, /avela:execution-handoff-proposed/);
});

test("Club setup separates planning readiness from outcome measurement readiness", () => {
  const readiness = read("src/components/ClubPilotReadiness.tsx");
  const page = read("src/app/app/setup/page.tsx");
  assert.match(page, /ClubPilotReadiness/);
  assert.match(readiness, /Pilot readiness/);
  assert.match(readiness, /Planning readiness and outcome measurement are assessed separately/);
  assert.match(readiness, /Identity & club membership/);
  assert.match(readiness, /Shared campaign persistence/);
  assert.match(readiness, /Outcome measurement/);
  assert.match(readiness, /crm-ticketing/);
  assert.match(readiness, /Missing measurement never becomes fake evidence/);
  assert.match(readiness, /Ready with limits/);
});

test("Commercial FAQ states current integration and execution boundaries", () => {
  const faq = read("src/components/CommercialFAQ.tsx");
  assert.match(faq, /public Blinkfire evidence as context/);
  assert.match(faq, /private club-specific Blinkfire measurement requires authorised club access/);
  assert.match(faq, /What is actually connected today/);
  assert.match(faq, /Club-private CRM, ticketing and Blinkfire data are not treated as connected/);
  assert.match(faq, /remains 'proposed' in AVELA until a real authorised adapter creates tasks/);
  assert.match(faq, /Publishing, sends and media spend remain in the club's execution tools/);
});

test("Player Asset Planning explains recommendation changes visually when players are added or removed", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const css = read("src/components/PlayerAssetPlanner.module.css");
  assert.match(planner, /Momentum Monitor/);
  assert.match(planner, /Live scenario/);
  assert.match(planner, /What changed/);
  assert.match(planner, /Add to pack/);
  assert.match(planner, /Remove from pack/);
  assert.match(planner, /Reset recommendation/);
  assert.match(planner, /vs recommended/);
  assert.match(css, /currentPack/);
  assert.match(css, /changeStory/);
});

test("Player momentum remains multi-dimensional, traceable and missing-aware", () => {
  const strategy = read("src/lib/clubStrategy.ts");
  const data = JSON.parse(read("data/seed/club-strategy-demo.json"));
  assert.match(strategy, /PlayerMomentum/);
  assert.match(strategy, /playerMomentumScore/);
  assert.match(strategy, /availableDimensions/);
  assert.match(strategy, /momentumScore/);
  assert.ok(data.playerMomentum.length >= 5);
  assert.ok(data.playerMomentum.some((item) => item.sporting.value === null && item.sporting.state === "missing"));
  assert.ok(data.playerMomentum.every((item) => item.sporting.source && item.attention.source && item.international.source && item.commercial.source));
});

test("Season Intelligence compares player momentum with asset usage instead of conflating them", () => {
  const season = read("src/app/app/season/page.tsx");
  assert.match(season, /momentum: playerMomentumScore/);
  assert.match(season, /momentum inputs/);
  assert.match(season, /Momentum and usage are different signals/);
  assert.match(season, /high momentum does not automatically mean/);
});


test("mobile app navigation keeps settings and utility destinations reachable", () => {
  const nav = read("src/components/ProductJourneyNav.tsx");
  const css = read("src/components/ProductJourneyNav.module.css");
  assert.match(nav, /className=\{styles\.mobileMenu\}/);
  assert.match(nav, />More<\/summary>/);
  for (const label of ["Executive view", "Sources", "Setup", "Team", "Product demo"]) {
    assert.match(nav, new RegExp(label));
  }
  assert.match(nav, /aria-current=\{active === item\.key \? "page"/);
  assert.match(css, /overflow-x:auto/);
  assert.match(css, /\.mobileMenu\{display:block/);
});

test("club app has explicit loading error and not-found states and remains non-indexable", () => {
  const layout = read("src/app/app/layout.tsx");
  const loading = read("src/app/app/loading.tsx");
  const error = read("src/app/app/error.tsx");
  const notFound = read("src/app/app/not-found.tsx");
  assert.match(layout, /index: false/);
  assert.match(layout, /follow: false/);
  assert.match(loading, /Preparing the next decision/);
  assert.match(error, /underlying data has not been changed/);
  assert.match(notFound, /Workspace not found/);
});

test("public crawl policy exposes canonical surfaces and excludes the club app", () => {
  const robots = read("src/app/robots.ts");
  const sitemap = read("src/app/sitemap.ts");
  assert.match(robots, /disallow: \["\/app\/"/);
  assert.match(robots, /sitemap\.xml/);
  assert.doesNotMatch(robots, /"\/brief"|"\/opportunity"|"\/decision-room"|"\/impact"|"\/today"|"\/calendar"|"\/measurement"|"\/club-demo"/);
  assert.match(sitemap, /\/for-clubs/);
  assert.match(sitemap, /\/case-study/);
  assert.match(sitemap, /\/live\/london-city/);
  assert.doesNotMatch(sitemap, /\$\{base\}\/app/);
});

test("commercial navigation enters the guided product demo and labels London City as a demo", () => {
  const nav = read("src/components/MarketingNav.tsx");
  assert.match(nav, /Live case/);
  assert.match(nav, /href="\/app\/demo">Try product/);
  assert.doesNotMatch(nav, /href="\/app\/matches">Try product/);
});

test("Player Assets keeps the live pack decision visible and navigable", () => {
  const planner = read("src/components/PlayerAssetPlanner.tsx");
  const css = read("src/components/PlayerAssetPlanner.module.css");
  const readme = read("README.md");

  for (const id of ["campaign-context", "availability", "player-status", "momentum", "packs", "scenario"]) {
    assert.match(planner, new RegExp(`id="${id}"`));
  }
  assert.match(planner, /Player asset planning sections/);
  assert.match(planner, /Live pack/);
  assert.match(planner, /livePackState/);
  assert.match(css, /\.decisionRail/);
  assert.match(css, /position:sticky/);
  assert.match(readme, /\/app\/players/);
  assert.doesNotMatch(readme, /\/app\/player-assets/);
});


test("Vercel only auto-deploys production and explicit preview branches", () => {
  const config = JSON.parse(read("vercel.json"));
  assert.equal(config.git.deploymentEnabled["**"], false);
  assert.equal(config.git.deploymentEnabled.main, true);
  assert.equal(config.git.deploymentEnabled["preview-*"], true);
  assert.equal(config.git.deploymentEnabled["*"], undefined);
});


test("current AVELA brand surfaces do not regress to the retired lime system", () => {
  const paths = [
    "src/app/app/learning/results.module.css",
    "src/app/pilot/pilot.module.css",
    "src/app/pilot/operating-pack/operating-pack.module.css",
    "src/app/opengraph-image.tsx",
    "src/app/linkedin-card/route.tsx"
  ];
  for (const path of paths) {
    const source = read(path);
    assert.doesNotMatch(source, /#526D00|#C7EA3A|#EAF4B9|#BCD22D|#AFC52D/i, `${path} should use the current AVELA identity`);
  }
  assert.match(read("src/app/app/learning/results.module.css"), /var\(--product-accent\)/);
  assert.match(read("src/app/pilot/pilot.module.css"), /var\(--product-accent-soft\)/);
  assert.match(read("src/app/opengraph-image.tsx"), /#2F8F83/);
  assert.match(read("src/app/linkedin-card/route.tsx"), /#2F8F83/);
});

test("commercial funnel proves relevance before explaining the full product and keeps CTAs truthful", () => {
  const home = read("src/app/page.tsx");
  const nav = read("src/components/MarketingNav.tsx");
  const clubs = read("src/components/ClubPilotProposition.tsx");
  assert.ok(home.indexOf("The problem is not missing data") < home.indexOf("Proof in public"));
  assert.match(home, /See how AVELA could fit your club/);
  assert.match(home, /See a live fixture decision/);
  assert.doesNotMatch(home, /Request a demo|Request pilot demo|Request club demo|Request the 90-day pilot/);
  assert.match(nav, /href="\/app\/demo">Try product/);
  assert.match(nav, /Club pilot/);
  assert.match(clubs, /Prepare a pilot conversation/);
  assert.match(clubs, /Copy pilot brief/);
  assert.doesNotMatch(clubs, /Request a club demo/);
});

test("guided demo sells the decision workflow without implying unsupported execution", () => {
  const demo = read("src/components/DemoTour.tsx");
  assert.match(demo, /one home fixture becomes one growth decision/);
  assert.match(demo, /Review & handoff/);
  assert.match(demo, /Handoff principle/);
  assert.match(demo, /never presents an unsupported action as executed/);
  assert.match(demo, /Use this workflow on your next six home fixtures/);
  assert.doesNotMatch(demo, /credit cost/);
  assert.doesNotMatch(demo, /Review & launch/);
});


test("Decision Center derives a simple action queue from the canonical opportunity engine", () => {
  const home = read("src/app/app/page.tsx");
  const model = read("src/lib/decisionIntelligence.ts");
  const css = read("src/app/app/home.module.css");

  assert.match(home, /Decision Center/);
  assert.match(home, /What changed/);
  assert.match(home, /Decision queue/);
  assert.match(home, /Why AVELA is recommending this/);
  assert.match(home, /buildDecisionAlerts/);
  assert.match(home, /decisionSummary/);

  assert.match(model, /DecisionPriority/);
  assert.match(model, /"act-now" \| "review" \| "on-track" \| "monitor" \| "blocked"/);
  assert.match(model, /getCurrentProductOpportunity/);
  assert.match(model, /campaignPlans/);
  assert.match(model, /new material signal/);
  assert.match(model, /Approval gate unresolved/);

  assert.match(css, /signalStrip/);
  assert.match(css, /primaryDecision/);
  assert.match(css, /changeFeed/);
  assert.match(css, /priorityPill/);
});


test("decision history persists an auditable club memory with RLS", () => {
  const route = read("src/app/api/decision-history/route.ts");
  const migration = read("supabase/migrations/20261004214706_decision_event_history.sql");
  const creatorIndex = read("supabase/migrations/20261004214718_index_decision_event_creator.sql");

  assert.match(route, /decision_events/);
  assert.match(route, /eventType/);
  assert.match(route, /sourceType/);
  assert.match(route, /on_conflict=event_key/);
  assert.match(route, /Authentication required/);

  assert.match(migration, /create table if not exists public\.decision_events/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /club_has_permission\(club_id, 'overview', 'view'\)/);
  assert.match(migration, /club_has_permission\(club_id, 'overview', 'edit'\)/);
  assert.match(migration, /'committed'/);
  assert.match(migration, /'executed'/);
  assert.match(migration, /'measured'/);
  assert.match(migration, /'learned'/);
  assert.match(migration, /'context-added'/);
  assert.match(creatorIndex, /decision_events_created_by_idx/);
});


test("opportunity brief records the final decision and actual execution separately", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/DecisionHistoryPanel.tsx");
  const css = read("src/components/DecisionHistoryPanel.module.css");

  assert.match(page, /DecisionHistoryPanel/);
  assert.match(page, /decisionId=\{\`fixture:\$\{fixture\.id\}\`\}/);
  assert.match(component, /Record final decision/);
  assert.match(component, /Record what went live/);
  assert.match(component, /Recommended → decided → executed → learned/);
  assert.match(component, /\/api\/decision-history/);
  assert.match(component, /eventType/);
  assert.match(component, /committed/);
  assert.match(component, /executed/);
  assert.match(component, /View full decision history/);
  assert.match(css, /stages/);
  assert.match(css, /timeline/);
});


test("Ask AVELA is grounded in the current decision and treats new user information as confirmable context", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const panel = read("src/components/AskAvelaPanel.tsx");
  const route = read("src/app/api/ask-avela/route.ts");

  assert.match(page, /AskAvelaPanel/);
  assert.match(panel, /Why are you recommending this\?/);
  assert.match(panel, /I don't know what to do for this match/);
  assert.match(panel, /Internal context detected/);
  assert.match(panel, /Add to AVELA memory/);
  assert.match(panel, /context-added/);
  assert.match(panel, /\/api\/decision-history/);

  assert.match(route, /getCurrentProductOpportunity/);
  assert.match(route, /buildOpportunityRadar/);
  assert.match(route, /decision_events/);
  assert.match(route, /Never invent club facts/);
  assert.match(route, /candidateContext/);
  assert.match(route, /do not claim it has been saved or applied/);
  assert.match(route, /AI_GATEWAY_API_KEY/);
});


test("opportunity brief can create role-specific heads-ups and operational requests", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/OperationalHandoffs.tsx");
  const route = read("src/app/api/operational-requests/route.ts");
  const migration = read("supabase/migrations/20261004215220_operational_request_handoffs.sql");

  assert.match(page, /OperationalHandoffs/);
  assert.match(component, /Player heads-up/);
  assert.match(component, /Team Manager/);
  assert.match(component, /Sponsor activation/);
  assert.match(component, /Activation Manager/);
  assert.match(component, /Club representation/);
  assert.match(component, /Secretary \/ Protocol/);
  assert.match(component, /Heads-up/);
  assert.match(component, /Formal request/);
  assert.match(component, /\/api\/operational-requests/);

  assert.match(route, /operational_requests/);
  assert.match(route, /requestType/);
  assert.match(route, /recipientRole/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /'heads-up'/);
  assert.match(migration, /'formal-request'/);
  assert.match(migration, /'confirmed'/);
});


test("operational handoff recipients can return execution state to AVELA", () => {
  const component = read("src/components/OperationalHandoffs.tsx");
  const route = read("src/app/api/operational-requests/route.ts");
  const css = read("src/components/OperationalHandoffs.module.css");

  assert.match(component, /Confirm/);
  assert.match(component, /Alternative/);
  assert.match(component, /Unavailable/);
  assert.match(component, /method: "PATCH"/);
  assert.match(component, /updateRequest/);
  assert.match(route, /export async function PATCH/);
  assert.match(route, /updated_by: user\.id/);
  assert.match(route, /updated_at: new Date\(\)\.toISOString\(\)/);
  assert.match(css, /requestActions/);
});


test("internal availability can block or protect fixture-day activation", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/AvailabilityPlanner.tsx");
  const model = read("src/lib/availabilityIntelligence.ts");
  const route = read("src/app/api/availability/route.ts");
  const migration = read("supabase/migrations/20261004220010_internal_availability_windows.sql");

  assert.match(page, /AvailabilityPlanner/);
  assert.match(component, /Squad off day/);
  assert.match(component, /Recovery \/ protected/);
  assert.match(component, /Christmas break/);
  assert.match(component, /public signals cannot see/);
  assert.match(model, /hard-unavailable/);
  assert.match(model, /protected/);
  assert.match(model, /preferred/);
  assert.match(model, /assessAvailability/);
  assert.match(route, /availability_windows/);
  assert.match(migration, /calendar', 'edit'/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /christmas-break/);
  assert.match(migration, /international-duty/);
  assert.match(migration, /personal-calendar/);
});


test("calendar intelligence ranks common windows without treating missing calendars as free", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/CalendarSlotFinder.tsx");
  const model = read("src/lib/schedulingIntelligence.ts");

  assert.match(page, /CalendarSlotFinder/);
  assert.match(component, /President/);
  assert.match(component, /General Director/);
  assert.match(component, /Head of Marketing/);
  assert.match(component, /Secretary \/ Protocol/);
  assert.match(component, /Unknown calendars stay unknown/);
  assert.match(component, /Consider squad availability/);
  assert.match(model, /rankSchedulingSlots/);
  assert.match(model, /hard-unavailable/);
  assert.match(model, /protected/);
  assert.match(model, /busy/);
  assert.match(model, /preferred/);
  assert.match(model, /Needs calendar data/);
  assert.match(model, /unknown/);
});


test("operational intelligence calculates complexity and capacity rather than asking users to label difficulty", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/OperationalCapacityPanel.tsx");
  const model = read("src/lib/operationalCapacity.ts");
  const route = read("src/app/api/operational-capacity/route.ts");
  const migration = read("supabase/migrations/20261004221000_operational_capacity_model.sql");

  assert.match(page, /OperationalCapacityPanel/);
  assert.match(page, /estimatedMinutes/);
  assert.match(page, /dependencyCount/);
  assert.match(page, /approvalCount/);
  assert.match(page, /unknownInputs/);
  assert.match(component, /Can we realistically deliver this\?/);
  assert.match(component, /How to make it viable/);
  assert.match(component, /Asana, Monday, Jira, Teams/);
  assert.match(model, /calculateOperationalComplexity/);
  assert.match(model, /assessOperationalCapacity/);
  assert.match(model, /Simplify scope/);
  assert.match(model, /Reallocate work/);
  assert.match(route, /workload_items/);
  assert.match(route, /capacity_windows/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /external_system/);
  assert.match(migration, /estimated_minutes/);
  assert.match(migration, /complexity_score/);
});


test("daily automation leaves reviewed WSL attendance outside its commit set", () => {
  const workflow = readFileSync(".github/workflows/daily-data-refresh.yml", "utf8");
  assert.doesNotMatch(workflow, /data\/live\/wsl-attendance-benchmark\.json/);
  assert.match(workflow, /data\/live\/source-health\.json/);
  assert.match(workflow, /data\/live\/audience-reach\.json/);
});


test("content guard follows the Decision Center home", () => {
  const guard = read("scripts/check-product-content.mjs");
  assert.match(guard, /Decision Center/);
  assert.match(guard, /need your attention/);
  assert.doesNotMatch(guard, /What needs attention today\?/);
});


test("Calendar Intelligence derives relationships without treating disconnected layers as clear", () => {
  const page = read("src/app/app/season/page.tsx");
  const engine = read("src/lib/calendarIntelligence.ts");
  const internal = read("src/lib/calendarIntelligenceServer.ts");
  const panel = read("src/components/CalendarRelationshipPanel.tsx");

  assert.match(page, /buildCalendarRelationships/);
  assert.match(page, /getInternalCalendarRelationships/);
  assert.match(page, /CalendarRelationshipPanel/);

  assert.match(engine, /"conflict"/);
  assert.match(engine, /"sequence"/);
  assert.match(engine, /"content-transfer"/);
  assert.match(engine, /"resource-efficiency"/);
  assert.match(engine, /"avoidance"/);
  assert.match(engine, /Compressed fixture window/);
  assert.match(engine, /Sequence opportunity/);
  assert.match(engine, /campaign-clash/);
  assert.match(engine, /fixtureScores/);
  assert.match(engine, /no automatic plan change is implied/i);

  assert.match(internal, /availability_windows/);
  assert.match(internal, /off-day/);
  assert.match(internal, /christmas-break/);
  assert.match(internal, /international-duty/);
  assert.match(internal, /personal-calendar/);
  assert.match(internal, /Internal personal availability/);
  assert.doesNotMatch(internal, /select=[^\n]*detail/);
  assert.doesNotMatch(internal, /source_ref/);

  assert.match(panel, /Men&apos;s team calendar · not connected/);
  assert.match(panel, /Sponsor event calendar · not connected/);
  assert.match(panel, /disconnected calendar layers remain explicitly unknown/);
  assert.match(panel, /Relationship ≠ automatic decision/);
  assert.match(panel, /does not silently move dates, contact people or alter the official campaign/);
});


test("calendar pressure can elevate attention without changing opportunity score", () => {
  const page = read("src/app/app/matches/page.tsx");
  const pressure = read("src/lib/calendarDecisionPressure.ts");

  assert.match(page, /opportunityRadar = buildOpportunityRadar/);
  assert.match(page, /applyCalendarDecisionPressure/);
  assert.match(page, /Attention driver:/);
  assert.match(page, /Opportunity state ·/);
  assert.match(page, /Calendar pressure/);

  assert.match(pressure, /attentionState/);
  assert.match(pressure, /calendarPressure/);
  assert.match(pressure, /Calendar pressure elevates/);
  assert.match(pressure, /internalBlocks/);
  assert.match(pressure, /highConflicts/);
  assert.match(pressure, /sequenceOpportunities/);
  assert.match(pressure, /radarWeight/);
  assert.match(pressure, /pressureWeight/);
  assert.doesNotMatch(pressure, /opportunityScore\s*[+*\-/]/);
  assert.doesNotMatch(pressure, /rank\s*=\s*.*calendar/i);
});


test("Decision Center integrates calendar attention and resilient cross-system state", () => {
  const page = read("src/app/app/page.tsx");
  const helper = read("src/lib/decisionCenterOverview.ts");
  const css = read("src/app/app/home.module.css");

  assert.match(page, /applyCalendarDecisionPressure/);
  assert.match(page, /radarState: item\.attentionState/);
  assert.match(page, /item\.attentionReason/);
  assert.match(page, /Calendar pressure/);
  assert.match(page, /Contract impacts/);
  assert.match(page, /Execution sync/);
  assert.match(page, /Verified contracts/);
  assert.match(page, /Calendar pressure can elevate attention without changing opportunity potential/);
  assert.match(page, /Calendar pressure/);
  assert.match(page, /calendarRelationships/);

  assert.match(helper, /contract_documents/);
  assert.match(helper, /contract_clauses/);
  assert.match(helper, /contract_impact_reviews/);
  assert.match(helper, /external_work_packages/);
  assert.match(helper, /if \(workloadResponse\.ok && capacityResponse\.ok\)/);
  assert.match(helper, /if \(availabilityResponse\.ok\)/);
  assert.match(helper, /if \(requestsResponse\.ok\)/);
  assert.match(helper, /if \(contractsResponse\.ok && clausesResponse\.ok\)/);
  assert.match(helper, /if \(impactsResponse\.ok\)/);
  assert.match(helper, /if \(executionResponse\.ok\)/);
  assert.doesNotMatch(helper, /!workloadResponse\.ok \|\| !capacityResponse\.ok \|\| !availabilityResponse\.ok/);

  assert.match(css, /grid-template-columns:repeat\(4,1fr\)/);
  assert.match(css, /data-state="syncing"/);
});


test("Decision Center promotes sanitized contract and execution issues into the attention queue", () => {
  const page = read("src/app/app/page.tsx");
  const helper = read("src/lib/decisionCenterOverview.ts");

  assert.match(page, /opsState\.crossAlerts/);
  assert.match(page, /priorityWeight/);
  assert.match(page, /blocked: 5/);
  assert.match(page, /decisionSummary\(alerts\)/);
  assert.match(page, /What should I look at next\\?/);

  assert.match(helper, /crossAlerts: DecisionAlert\[\]/);
  assert.match(helper, /contract_impact_reviews/);
  assert.match(helper, /external_work_packages/);
  assert.match(helper, /Contract change ·/);
  assert.match(helper, /External work blocked/);
  assert.match(helper, /sanitised impact review/);
  assert.doesNotMatch(helper, /source_fragment/);
  assert.doesNotMatch(helper, /extracted_value/);
  assert.doesNotMatch(helper, /sync_error/);
  assert.doesNotMatch(helper, /title: "Contract change · " \+ item\.entity_type \+ " " \+ item\.entity_id/);
});


test("work-system orchestration derives vendor-neutral work without becoming a task manager", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const lib = read("src/lib/workSystemOrchestration.ts");
  const component = read("src/components/ExternalWorkPackagePreview.tsx");

  assert.match(lib, /WorkSystemId = "asana" \| "monday" \| "jira" \| "notion" \| "other"/);
  assert.match(lib, /interface WorkSystemAdapter/);
  assert.match(lib, /createWorkPackage/);
  assert.match(lib, /syncWorkPackage/);
  assert.match(lib, /deriveCampaignWorkPackage/);
  assert.match(lib, /dependencyKeys/);
  assert.match(lib, /estimatedMinutes/);
  assert.doesNotMatch(lib, /fetch\(/);
  assert.doesNotMatch(lib, /api\.asana|monday\.com|atlassian|notion\.com/i);

  assert.match(component, /AVELA derives the work package/);
  assert.match(component, /Not connected/);
  assert.match(component, /Preview only · no external task has been created/);
  assert.match(component, /AVELA orchestrates; it does not replace project management/);

  assert.match(page, /deriveCampaignWorkPackage/);
  assert.match(page, /ExternalWorkPackagePreview/);
  assert.match(page, /estimatedMinutes: workPackage\?\.estimatedMinutes/);
  assert.match(page, /taskCount: workPackage\?\.items\.length/);
  assert.match(page, /dependencyCount: workDependencyCount/);
});


test("external work sync stores only the operational projection AVELA needs", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const component = read("src/components/ExternalExecutionSync.tsx");
  const route = read("src/app/api/work-system/status/route.ts");
  const migration = read("supabase/migrations/20261005002000_work_system_sync_projection.sql");

  assert.match(page, /ExternalExecutionSync/);
  assert.match(component, /Only operational state required for decision intelligence is synced back/);
  assert.match(component, /External system owns task execution/);
  assert.match(component, /does not duplicate comments, attachments or full task history/);
  assert.match(component, /safeExternalUrl/);
  assert.ok(component.includes("^https:\\/\\/"));

  assert.match(route, /external_work_packages/);
  assert.match(route, /external_work_item_links/);
  assert.match(route, /work_system_connections/);
  assert.match(route, /assignee_label/);
  assert.match(route, /blocker_label/);
  assert.doesNotMatch(route, /comment|attachment|description|body_text/i);

  assert.match(migration, /Provider credentials and task bodies remain outside AVELA/);
  assert.match(migration, /connection_ref/);
  assert.doesNotMatch(migration, /access_token|refresh_token|api_key|client_secret/i);
  assert.match(migration, /completed_count cannot exceed item_count/);
  assert.match(migration, /blocked_count cannot exceed item_count/);
  assert.match(migration, /club_has_permission\(club_id,'connections','view'\)/);
  assert.match(migration, /club_has_permission\(club_id,'campaigns','view'\)/);
});


test("work-system routing stays explainable and confirmation-gated", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const routing = read("src/lib/workSystemRouting.ts");
  const server = read("src/lib/workSystemRoutingServer.ts");
  const component = read("src/components/WorkRoutingPlan.tsx");
  const migration = read("supabase/migrations/20261005003500_work_system_routing_policy.sql");

  assert.match(page, /getWorkRoutingRules/);
  assert.match(page, /routeWorkPackage/);
  assert.match(page, /WorkRoutingPlan/);

  assert.match(routing, /highest-priority matching rule/);
  assert.match(routing, /No enabled work-system routing rule matches this package/);
  assert.match(routing, /unroutedItemKeys/);
  assert.match(routing, /requireConfirmation/);

  assert.match(server, /work_routing_rules/);
  assert.match(server, /work_system_connections/);
  assert.match(server, /state=eq\.connected/);

  assert.match(component, /No route configured/);
  assert.match(component, /Confirmation/);
  assert.match(component, /AVELA does not dispatch this package automatically/);

  assert.match(migration, /require_confirmation boolean not null default true check \(require_confirmation = true\)/);
  assert.match(migration, /external work routing currently requires human confirmation/);
  assert.match(migration, /routing destination_system must match the selected connection/);
  assert.match(migration, /enabled routing rule requires a connected destination/);
  assert.doesNotMatch(migration, /access_token|refresh_token|api_key|client_secret/i);
});



test("homepage sells the decision layer with a low-friction pilot path", () => {
  const page = read("src/app/page.tsx");
  const ecosystem = read("src/components/CommercialEcosystem.tsx");
  assert.match(page, /Read the signals/);
  assert.match(page, /Decision intelligence for football clubs/);
  assert.match(ecosystem, /Keep your specialist tools/);
  assert.match(page, /See how AVELA could fit your club/);
  assert.match(page, /No rip-and-replace programme is required/);
  assert.match(page, /live\?\.nextAction\.label/);
  assert.match(page, /London City Live/);
});


test("commercial home uses lightweight decision motion instead of decorative video", () => {
  const page = read("src/app/page.tsx");
  const stage = read("src/components/CommercialSignalStage.tsx");
  const stageCss = read("src/components/CommercialSignalStage.module.css");
  const ecosystem = read("src/components/CommercialEcosystem.tsx");
  assert.match(page, /CommercialSignalStage/);
  assert.match(ecosystem, /Priority/);
  assert.match(ecosystem, /Decision/);
  assert.match(ecosystem, /Action/);
  assert.match(stage, /decisionPulse/);
  assert.match(stage, /tracer/);
  assert.match(stageCss, /prefers-reduced-motion:no-preference/);
});


test("commercial home explains why AVELA complements specialist tools and general AI", () => {
  const home = read("src/app/page.tsx");
  const ecosystem = read("src/components/CommercialEcosystem.tsx");
  const faq = read("src/components/CommercialFAQ.tsx");
  const nav = read("src/components/MarketingNav.tsx");

  assert.match(home, /Not another dashboard/);
  assert.match(home, /The LLM is part of AVELA\. It is not the product/);
  assert.match(home, /Decision intelligence for football clubs/);
  assert.match(ecosystem, /Blinkfire \/ analytics/);
  assert.match(ecosystem, /CRM \/ ticketing/);
  assert.match(ecosystem, /Asana \/ Monday \/ Jira/);
  assert.match(ecosystem, /systems of record/);
  assert.match(faq, /Does AVELA replace Blinkfire/);
  assert.match(faq, /Why can’t we just use ChatGPT, Claude or another LLM/);
  assert.match(faq, /Do we need to integrate everything before starting/);
  assert.match(faq, /What would a pilot look like/);
  assert.match(nav, /How it fits/);
  assert.match(nav, /FAQ/);
});


test("product shell uses the prepared AVELA navy teal coral identity without changing semantic risk colours", () => {
  const system = read("src/app/product-system.css");
  const nav = read("src/components/ProductJourneyNav.module.css");
  const home = read("src/app/app/home.module.css");
  const ask = read("src/components/AskAvelaPanel.module.css");

  assert.match(system, /--product-navy:#102742/);
  assert.match(system, /--product-teal:#2F8F83/);
  assert.match(system, /--product-coral:#EF8B6C/);
  assert.match(system, /--product-sand:#E8DCCB/);
  assert.match(system, /--product-success:#16845B/);
  assert.match(system, /--product-warning:#D78A1E/);
  assert.match(system, /--product-danger:#D94A4A/);
  assert.match(nav, /background:var\(--product-navy/);
  assert.match(nav, /brandMark::after/);
  assert.match(home, /background:var\(--product-navy\)/);
  assert.match(ask, /background:var\(--product-navy\)/);
});


test("Opportunity Brief follows decision readiness execution evidence memory hierarchy", () => {
  const page = read("src/app/app/matches/[fixtureId]/page.tsx");
  const css = read("src/app/app/matches/[fixtureId]/match-plan.module.css");

  const decision = page.indexOf('id="decision"');
  const readiness = page.indexOf('id="readiness"');
  const execute = page.indexOf('id="execute"');
  const evidence = page.indexOf('id="evidence"');
  const history = page.indexOf("<DecisionHistoryPanel");

  assert.ok(decision >= 0);
  assert.ok(readiness > decision);
  assert.ok(execute > readiness);
  assert.ok(evidence > execute);
  assert.ok(history > evidence);

  assert.match(page, /Can we actually do it\?/);
  assert.match(page, /Make the decision executable/);
  assert.match(page, /Why AVELA thinks this/);
  assert.match(page, /Human decision/);
  assert.match(page, /Decision memory/);
  assert.match(page, /AvailabilityPlanner/);
  assert.match(page, /CalendarSlotFinder/);
  assert.match(page, /OperationalCapacityPanel/);
  assert.match(page, /OperationalHandoffs/);

  assert.match(css, /decisionLens/);
  assert.match(css, /phaseIntro/);
  assert.match(css, /phaseNumber/);
});


test("campaign workflow preserves lifecycle and decision context", () => {
  const campaigns = read("src/app/app/campaigns/page.tsx");
  const players = read("src/app/app/players/page.tsx");
  const fixture = read("src/app/app/matches/[fixtureId]/page.tsx");
  const trail = read("src/components/DecisionContextTrail.tsx");

  assert.match(campaigns, /Draft/);
  assert.match(campaigns, /Review/);
  assert.match(campaigns, /Ready/);
  assert.match(campaigns, /Handoff/);
  assert.match(campaigns, /Learning/);
  assert.match(campaigns, /\/app\/players\?campaign=/);
  assert.match(players, /initialCampaignId/);
  assert.match(players, /DecisionContextTrail/);
  assert.match(fixture, /DecisionContextTrail/);
  assert.match(trail, /Campaign context preserved/);
  assert.doesNotMatch(campaigns, /\bLive\b/);
});


test("universal state primitives keep decision and evidence semantics consistent", () => {
  const ui = read("src/components/WorkspaceUI.tsx");
  const home = read("src/app/app/page.tsx");
  const radar = read("src/app/app/matches/page.tsx");
  const campaigns = read("src/app/app/campaigns/page.tsx");
  const season = read("src/app/app/season/page.tsx");
  const executive = read("src/app/app/executive/page.tsx");
  const sponsors = read("src/app/app/sponsors/page.tsx");
  const learning = read("src/app/app/learning/page.tsx");
  const help = read("src/app/app/help/page.tsx");

  assert.match(ui, /UniversalDecisionState = "ACT" \| "REVIEW" \| "BLOCKED" \| "MONITOR" \| "READY" \| "MEASURED"/);
  assert.match(ui, /UniversalEvidenceState = "OBSERVED" \| "VERIFIED" \| "MODELLED" \| "MISSING"/);
  assert.match(home, /DecisionStateBadge/);
  assert.match(radar, /DecisionStateBadge/);
  assert.match(campaigns, /DecisionStateBadge/);
  assert.match(season, /DecisionStateBadge/);
  assert.match(executive, /DecisionStateBadge/);
  assert.match(sponsors, /DecisionStateBadge/);
  assert.match(sponsors, /EvidenceStateBadge/);
  assert.match(learning, /DecisionStateBadge/);
  assert.match(learning, /EvidenceStateBadge/);
  assert.match(help, /DecisionStateBadge/);
  assert.match(help, /EvidenceStateBadge/);
});
