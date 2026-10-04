import sample from "../../data/seed/club-strategy-demo.json";

type Copy = { es: string; en: string };
const c = (es: string, en: string): Copy => ({ es, en });
export type BrandKit = { schemaVersion: 1; synthetic: true; id: string; name: string; primary: string; background: string; font: "sans-serif" | "serif"; tone: string; version: number };
export type Campaign = { id: string; name: Copy; headline: Copy; brief: Copy; primary: string; background: string; start: string; end: string; goal: string };
export const strategySample = sample;
export const demoBrand = sample.brand as BrandKit;
export const demoCampaigns = sample.campaigns as Campaign[];
const dateValid = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    if (!/^#[a-f\d]{6}$/i.test(hex)) return NaN;
    const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export function parseDemoBrand(input: string): BrandKit {
  if (input.length > 10000) throw new Error("size");
  const value = JSON.parse(input) as Partial<BrandKit>;
  if (!value || value.schemaVersion !== 1 || value.synthetic !== true || !value.id?.startsWith("brand-demo") || typeof value.name !== "string" || value.name.length > 40 || !value.name.trim() || typeof value.tone !== "string" || value.tone.length > 160 || !["sans-serif", "serif"].includes(value.font ?? "") || !/^#[a-f\d]{6}$/i.test(value.primary ?? "") || !/^#[a-f\d]{6}$/i.test(value.background ?? "") || !Number.isSafeInteger(value.version) || (value.version ?? 0) < 1) throw new Error("schema");
  // Whitelist fields: no remote URLs, contracts, arbitrary CSS or image uploads.
  return { schemaVersion: 1, synthetic: true, id: value.id, name: value.name, primary: value.primary!, background: value.background!, font: value.font!, tone: value.tone, version: value.version! };
}
export function campaignBlockers(brand: BrandKit, campaign: Campaign, date: string): string[] {
  const reasons: string[] = [];
  if (!dateValid(date) || !dateValid(campaign.start) || !dateValid(campaign.end) || date < campaign.start || date > campaign.end || campaign.start > campaign.end) reasons.push("dates");
  if (!brand.name.trim() || !campaign.headline.es.trim() || !campaign.headline.en.trim() || !campaign.brief.es.trim() || !campaign.brief.en.trim()) reasons.push("brief");
  if (contrast(brand.primary, brand.background) < 4.5 || contrast(campaign.primary, campaign.background) < 4.5 || !Number.isFinite(contrast(campaign.primary, campaign.background))) reasons.push("contrast");
  return reasons;
}
export function brandCampaignVersion(brand: BrandKit, campaign: Campaign): string { return JSON.stringify({ brand, campaign }); }

export type Post = { id: string; playerId: string; account: "club" | "player"; platform: string; format: string; theme: string; period: "previous" | "current"; interactions: number; impressions: number | null };
export type ContentFilter = { account: "club" | "player"; platform: string; format: "all" | "video" | "image" };
export const demoPosts = sample.posts as Post[];
export function contentInsights(posts: Post[], filter: ContentFilter, group: "playerId" | "theme", metric: "volume" | "rate") {
  const filtered = posts.filter((p) => p.account === filter.account && p.platform === filter.platform && (filter.format === "all" || p.format === filter.format));
  const aggregate = (items: Post[]) => ({ posts: items.length, interactions: items.reduce((n, p) => n + p.interactions, 0), rate: items.length && items.every((p) => p.impressions !== null && p.impressions > 0) ? items.reduce((n, p) => n + p.interactions, 0) / items.reduce((n, p) => n + (p.impressions ?? 0), 0) * 100 : null });
  return [...new Set(filtered.filter((p) => p.period === "current").map((p) => p[group]))].map((id) => {
    const current = aggregate(filtered.filter((p) => p[group] === id && p.period === "current"));
    const previous = aggregate(filtered.filter((p) => p[group] === id && p.period === "previous"));
    return { id, ...current, previousPosts: previous.posts, delta: current.rate !== null && previous.rate !== null ? current.rate - previous.rate : null };
  }).sort((a, b) => (metric === "volume" ? b.interactions - a.interactions : (b.rate ?? -1) - (a.rate ?? -1)) || a.id.localeCompare(b.id));
}

export type SportingAvailability = "available" | "injured" | "rehab" | "sporting-unavailable";
export type Player = { id: string; name: string; signed: boolean; validated: boolean; document: string; start: string; end: string; channels: string[]; territories: string[]; blockedCategories: string[]; quota: number | null; confirmedDates: string[]; fit: number; fee: number; sportingAvailability?: SportingAvailability; commercialAvailabilityOverride?: boolean; priorityReserve?: number };
export type Appearance = { id: string; playerId: string; date: string; status: "reserved" | "completed" | "cancelled"; category: string; channel: string; territory: string; owner: string; evidence: string | null };
export type InternationalDutyState = "window" | "manual-private" | "public-confirmed" | "released";
export type InternationalDuty = { id: string; playerId: string; start: string; end: string; state: InternationalDutyState; team: string; source: string; public: boolean; note?: string };
export type ActivationRequest = { date: string; category: string; channel: string; territory: string; owner: string; budget: number };
export type CommercialCampaignBrief = { id: string; name: string; type: "fixture" | "season-ticket" | "seasonal" | "community" | "retail" | "sponsor" | "hospitality" | "other"; start: string; end: string; activationDate: string; objective: string; category: string; channel: string; territory: string; owner: string; budget: number; playerNeed: number };
export type MomentumDimension = { value: number | null; direction: "up" | "down" | "stable" | "unknown"; state: "measured" | "reported" | "public" | "synthetic-demo" | "missing"; source: string };
export type PlayerMomentum = { playerId: string; observedAt: string; sporting: MomentumDimension; attention: MomentumDimension; international: MomentumDimension; commercial: MomentumDimension };
export const demoCommercialCampaigns = (sample.commercialCampaigns ?? []) as CommercialCampaignBrief[];
export const demoPlayerMomentum = (sample.playerMomentum ?? []) as PlayerMomentum[];
export const demoPlayers = sample.players as Player[];
export const demoAppearances = sample.appearances as Appearance[];
export const demoInternationalDuty = (sample.internationalDuty ?? []) as InternationalDuty[];
export function playerCapacity(player: Player, appearances: Appearance[]) {
  const items = appearances.filter((a) => a.playerId === player.id && a.status !== "cancelled" && a.date >= player.start && a.date <= player.end);
  const completed = items.filter((a) => a.status === "completed").length;
  return { completed, reserved: items.length - completed, remaining: player.quota === null ? null : Math.max(0, player.quota - items.length), used: items.length };
}
export function internationalDutyForDate(playerId: string, date: string, duties: InternationalDuty[] = demoInternationalDuty) {
  return duties.filter((duty) =>
    duty.playerId === playerId &&
    duty.state !== "released" &&
    date >= duty.start &&
    date <= duty.end
  );
}

export function internationalAvailabilityAlerts(
  players: Player[],
  duties: InternationalDuty[],
  from: string,
  to: string
) {
  return duties
    .filter((duty) => duty.state !== "released" && duty.end >= from && duty.start <= to)
    .map((duty) => {
      const player = players.find((item) => item.id === duty.playerId);
      return {
        playerId: duty.playerId,
        playerName: player?.name ?? duty.playerId,
        team: duty.team,
        start: duty.start,
        end: duty.end,
        state: duty.state,
        visibility: duty.public ? "public" as const : "internal" as const,
        message: duty.state === "window"
          ? `International window may affect ${player?.name ?? duty.playerId}; call-up not yet confirmed.`
          : duty.state === "manual-private"
            ? `${player?.name ?? duty.playerId} is marked internally as expected unavailable for international duty.`
            : `${player?.name ?? duty.playerId} is publicly confirmed for international duty.`
      };
    })
    .sort((a,b) => a.start.localeCompare(b.start) || a.playerName.localeCompare(b.playerName));
}

export function activationBlockers(player: Player, request: ActivationRequest, appearances: Appearance[], duties: InternationalDuty[] = demoInternationalDuty): string[] {
  const reasons: string[] = [];
  if (!player.signed || !player.validated) reasons.push("agreement");
  if (!dateValid(request.date) || request.date < player.start || request.date > player.end) reasons.push("dates");
  if (!player.channels.includes(request.channel)) reasons.push("channel");
  if (!player.territories.includes(request.territory)) reasons.push("territory");
  if (player.blockedCategories.includes(request.category)) reasons.push("conflict");
  if (!player.confirmedDates.includes(request.date)) reasons.push("availability");
  if (player.sportingAvailability === "sporting-unavailable" && !player.commercialAvailabilityOverride) reasons.push("sportingAvailability");
  if (internationalDutyForDate(player.id, request.date, duties).some((duty) => duty.state === "manual-private" || duty.state === "public-confirmed")) reasons.push("internationalDuty");
  if (!Number.isFinite(request.budget) || request.budget < player.fee) reasons.push("budget");
  if (!request.owner) reasons.push("owner");
  const capacity = playerCapacity(player, appearances);
  if (capacity.remaining === null) reasons.push("quotaUnknown");
  else if (capacity.remaining === 0) reasons.push("quota");
  if (appearances.some((a) => a.playerId === player.id && a.date === request.date && a.status !== "cancelled")) reasons.push("collision");
  return reasons;
}
export type Weights = { fit: number; balance: number; engagement: number };
export function recommendPlayers(players: Player[], request: ActivationRequest, appearances: Appearance[], weights: Weights, posts: Post[], intelligence: boolean, duties: InternationalDuty[] = demoInternationalDuty) {
  if (Object.values(weights).some((v) => !Number.isFinite(v) || v < 0) || weights.fit + weights.balance + (intelligence ? weights.engagement : 0) <= 0) throw new Error("weights");
  const insights = contentInsights(posts, { account: "club", platform: "instagram", format: "video" }, "playerId", "rate");
  return players.map((player) => {
    const capacity = playerCapacity(player, appearances);
    const rate = insights.find((p) => p.id === player.id)?.rate ?? null;
    const balance = player.quota && capacity.remaining !== null ? capacity.remaining / player.quota * 100 : 0;
    const useEngagement = intelligence && rate !== null;
    const total = weights.fit + weights.balance + (useEngagement ? weights.engagement : 0);
    const score = total > 0 ? (weights.fit * player.fit + weights.balance * balance + (useEngagement ? weights.engagement * Math.min(100, rate * 10) : 0)) / total : 0;
    return { player, capacity, rate, balance, score, blockers: activationBlockers(player, request, appearances, duties) };
  }).sort((a, b) => Number(a.blockers.length > 0) - Number(b.blockers.length > 0) || b.score - a.score || a.player.id.localeCompare(b.player.id));
}

export type PlayerPackWeights = Weights & { cost: number; opportunityCost: number; sportingAvailability: number; momentum: number };
export type PlayerPackRecommendation = {
  players: Array<ReturnType<typeof recommendPlayers>[number]>;
  totalFee: number;
  avgScore: number;
  opportunityCost: number;
  sportingAvailabilityBonus: number;
  momentumScore: number | null;
  costEfficiency: number;
  packScore: number;
  blockers: string[];
};

function combinations<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [[]];
  if (size > items.length) return [];
  if (size === 1) return items.map((item) => [item]);
  const result: T[][] = [];
  for (let i = 0; i <= items.length - size; i += 1) {
    for (const tail of combinations(items.slice(i + 1), size - 1)) result.push([items[i], ...tail]);
  }
  return result;
}

function sportingCommercialBonus(player: Player) {
  if (!player.commercialAvailabilityOverride) return 0;
  if (player.sportingAvailability === "injured") return 100;
  if (player.sportingAvailability === "rehab") return 70;
  return 0;
}

function playerOpportunityCost(player: Player, capacity: ReturnType<typeof playerCapacity>) {
  if (player.quota === null || capacity.remaining === null) return 100;
  const reserve = player.priorityReserve ?? 1;
  const afterUse = Math.max(0, capacity.remaining - 1);
  return Math.max(0, reserve - afterUse) * 50 + (capacity.remaining <= 1 ? 35 : 0);
}


export function playerMomentumScore(playerId: string, signals: PlayerMomentum[] = demoPlayerMomentum) {
  const signal = signals.find((item) => item.playerId === playerId) ?? null;
  if (!signal) return { score: null as number | null, signal: null as PlayerMomentum | null, availableDimensions: 0 };
  const values = [signal.sporting.value, signal.attention.value, signal.international.value, signal.commercial.value]
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return {
    score: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    signal,
    availableDimensions: values.length
  };
}

export function evaluatePlayerPack(
  selectedPlayers: Player[],
  request: ActivationRequest,
  appearances: Appearance[],
  weights: PlayerPackWeights,
  posts: Post[],
  intelligence: boolean,
  duties: InternationalDuty[] = demoInternationalDuty,
  momentumSignals: PlayerMomentum[] = demoPlayerMomentum
): PlayerPackRecommendation {
  const ranked = recommendPlayers(selectedPlayers, request, appearances, weights, posts, intelligence, duties);
  const totalFee = ranked.reduce((sum, item) => sum + item.player.fee, 0);
  const avgScore = ranked.length ? ranked.reduce((sum, item) => sum + item.score, 0) / ranked.length : 0;
  const opportunityCost = ranked.length ? ranked.reduce((sum, item) => sum + playerOpportunityCost(item.player, item.capacity), 0) / ranked.length : 0;
  const sportingAvailabilityBonus = ranked.length ? ranked.reduce((sum, item) => sum + sportingCommercialBonus(item.player), 0) / ranked.length : 0;
  const momentumValues = ranked
    .map((item) => playerMomentumScore(item.player.id, momentumSignals).score)
    .filter((value): value is number => value !== null);
  const momentumScore = momentumValues.length ? momentumValues.reduce((sum, value) => sum + value, 0) / momentumValues.length : null;
  const costEfficiency = request.budget > 0 ? Math.max(0, 100 - (totalFee / request.budget) * 100) : 0;
  const totalWeight = weights.fit + weights.balance + (intelligence ? weights.engagement : 0) + weights.cost + weights.opportunityCost + weights.sportingAvailability + (momentumScore !== null ? weights.momentum : 0);
  const packScore = totalWeight > 0
    ? (
        avgScore * (weights.fit + weights.balance + (intelligence ? weights.engagement : 0)) +
        costEfficiency * weights.cost +
        Math.max(0, 100 - opportunityCost) * weights.opportunityCost +
        sportingAvailabilityBonus * weights.sportingAvailability +
        (momentumScore ?? 0) * (momentumScore !== null ? weights.momentum : 0)
      ) / totalWeight
    : 0;
  const blockers = Array.from(new Set([
    ...ranked.flatMap((item) => item.blockers),
    ...(totalFee > request.budget ? ["budget"] : [])
  ]));
  return { players: ranked, totalFee, avgScore, opportunityCost, sportingAvailabilityBonus, momentumScore, costEfficiency, packScore, blockers };
}

export function recommendPlayerPacks(
  players: Player[],
  request: ActivationRequest,
  appearances: Appearance[],
  count: number,
  weights: PlayerPackWeights,
  posts: Post[],
  intelligence: boolean,
  duties: InternationalDuty[] = demoInternationalDuty,
  momentumSignals: PlayerMomentum[] = demoPlayerMomentum
): PlayerPackRecommendation[] {
  if (!Number.isSafeInteger(count) || count < 1 || count > players.length) throw new Error("count");
  const ranked = recommendPlayers(players, request, appearances, weights, posts, intelligence, duties);
  const eligible = ranked.filter((item) => item.blockers.length === 0).map((item) => item.player);
  const packs = combinations(eligible, count).map((pack) =>
    evaluatePlayerPack(pack, request, appearances, weights, posts, intelligence, duties, momentumSignals)
  );
  return packs.sort((a,b) => Number(a.blockers.length > 0) - Number(b.blockers.length > 0) || b.packScore - a.packScore || a.totalFee - b.totalFee);
}

export function reserveAppearance(player: Player, request: ActivationRequest, appearances: Appearance[], role: string, duties: InternationalDuty[] = demoInternationalDuty): Appearance[] {
  if (role !== "approver" || activationBlockers(player, request, appearances, duties).length) throw new Error("blocked");
  return [...appearances, { id: `AP-RESERVED-${player.id}-${request.date}-${appearances.length + 1}`, playerId: player.id, ...request, status: "reserved", evidence: null }];
}
export function completeAppearance(id: string, appearances: Appearance[], role: string): Appearance[] {
  if (role !== "approver" || !appearances.some((a) => a.id === id && a.status === "reserved")) throw new Error("blocked");
  return appearances.map((a) => a.id === id ? { ...a, status: "completed", evidence: "EVIDENCE-DEMO · simulated completion, no actual proof" } : a);
}

export type ModuleId = "audiences" | "automation" | "studio" | "intelligence" | "partners" | "talent";
export const modules: { id: ModuleId; name: Copy; value: Copy; scope: Copy; dependency: ModuleId[]; production: Copy; meter: Copy }[] = [
  { id:"audiences", name:c("Audiencias y fidelización","Audiences & loyalty"), value:c("Convertir compras y visitas en recurrencia.","Turn purchases and visits into repeat attendance."), scope:c("Identidad única, CRM/ticketing/tornos, segmentos, rankings privados y retos.","Unique identity, CRM/ticketing/turnstiles, segments, private rankings and challenges."), dependency:[], production:c("Acuerdos de datos, proveedor e identidad reconciliada; no incluye su licencia.","Data agreements, provider and reconciled identity; vendor licence excluded."), meter:c("Tramo de perfiles activos y conectores.","Active profile tier and connectors.") },
  { id:"automation", name:c("Automatización y canales","Automation & channels"), value:c("Ejecutar flujos aprobados con exclusiones y límites.","Execute approved flows with exclusions and caps."), scope:c("WhatsApp, email, cuentas sociales/publicitarias autorizadas, tareas conectadas, reintentos y seguimiento.","WhatsApp, email, authorised social/ad accounts, connected tasks, retries and tracking."), dependency:["audiences"], production:c("Permisos, proveedores oficiales, plantillas y límites de gasto. No todos los canales permiten envío a grupos.","Permissions, official providers, templates and spend caps. Not all channels support group delivery."), meter:c("Volumen de ejecuciones; mensajería y publicidad aparte.","Execution volume; messaging and ad spend separate.") },
  { id:"studio", name:c("Estudio creativo","Creative studio"), value:c("Producir piezas consistentes con marca y campaña.","Produce assets aligned with club brand and campaign."), scope:c("Textos, composiciones, variantes, proveedores de imagen/vídeo y revisión por versión.","Copy, compositions, variants, image/video providers and version review."), dependency:[], production:c("La demo genera SVG y guiones; IA y vídeo renderizado pendientes de proveedor.","Demo generates SVG and scripts; AI and rendered video require a provider."), meter:c("Uso de generación y almacenamiento; nunca ilimitado.","Generation usage and storage; never unlimited.") },
  { id:"intelligence", name:c("Inteligencia de contenidos","Content intelligence"), value:c("Elegir contenidos y protagonistas con evidencia.","Choose content and talent using evidence."), scope:c("Rendimiento, tendencias comparables y pool de jugadores; conector Blinkfire opcional.","Performance, comparable trends and player pool; optional Blinkfire connector."), dependency:[], production:c("Licencia/API Blinkfire del club, cobertura y uso autorizado por confirmar; sin scraping.","Club Blinkfire/API licence, coverage and authorised use to confirm; no scraping."), meter:c("Cuentas/pool analizado; licencia externa separada.","Analysed accounts/pool; external licence separate.") },
  { id:"partners", name:c("Partners y valor comercial","Partners & commercial value"), value:c("Preparar activaciones, entregables y renovaciones.","Prepare activations, deliverables and renewals."), scope:c("Afinidad, inventario, exclusividades, informes y cumplimiento. Exposición conectada si se añade Inteligencia.","Fit, inventory, exclusivity, reports and fulfilment. Connected exposure with Intelligence added."), dependency:[], production:c("Contratos y derechos validados; compartir datos externos requiere autorización.","Validated agreements and rights; sharing external data requires permission."), meter:c("Partners activos y volumen de activos.","Active partners and asset volume.") },
  { id:"talent", name:c("Talento y activaciones","Talent & activations"), value:c("Repartir apariciones sin sobreasignar.","Allocate appearances without overbooking."), scope:c("Elegibilidad, capacidad, calendario, coste y reparto ponderado. Engagement opcional con Inteligencia.","Eligibility, capacity, calendar, cost and weighted allocation. Optional engagement with Intelligence."), dependency:[], production:c("Acuerdos revisados por el club y disponibilidad confirmada; no negociación automática.","Club-reviewed agreements and confirmed availability; no automated negotiation."), meter:c("Pool de talento y activaciones gestionadas.","Talent pool and managed activations.") }
];
export const allModules = modules.map((m) => m.id);
export function normalizeModules(selected: ModuleId[]): ModuleId[] {
  const unique = new Set(selected.filter((id) => allModules.includes(id)));
  for (const entry of modules) if (unique.has(entry.id)) for (const dependency of entry.dependency) unique.add(dependency);
  return allModules.filter((id) => unique.has(id));
}
export function toggleModule(selected: ModuleId[], id: ModuleId, enabled: boolean): ModuleId[] {
  if (enabled) return normalizeModules([...selected, id]);
  return normalizeModules(selected.filter((item) => item !== id && !modules.find((m) => m.id === item)?.dependency.includes(id)));
}
export const baseScope = [
  c("Un club, una temporada operativa y cinco usuarios incluidos como hipótesis comercial.","One club, one operating season and five included users as a commercial hypothesis."),
  c("Plan por partido, campañas, tareas, responsables, calendario y aprobaciones manuales.","Matchday plans, campaigns, tasks, owners, calendar and manual approvals."),
  c("Brand Kit base y kits de campaña; briefing y biblioteca de recursos.","Base Brand Kit and campaign kits; briefing and asset library."),
  c("Registro manual de partners, acuerdos y apariciones; sin optimización avanzada.","Manual partner, agreement and appearance register; no advanced optimisation."),
  c("Exportaciones y resumen de actividad; onboarding y soporte estándar.","Exports and activity summary; onboarding and standard support."),
  c("En producción: acceso privado, roles, aislamiento por club, auditoría, bajas y exportación de datos. Nunca extras de pago.","In production: private access, roles, club isolation, audit, deletion and data export. Never paid add-ons.")
];
export function licenceProposal(selected: ModuleId[], locale: "es" | "en") {
  const ids = normalizeModules(selected);
  return { schemaVersion:1, proposalOnly:true, synthetic:true, purchase:false, base:"Club Operations", includedUsersHypothesis:5, scope:baseScope.map((x) => x[locale]), modules:modules.filter((m) => ids.includes(m.id)).map((m) => ({ id:m.id, name:m.name[locale], scope:m.scope[locale], dependencies:m.dependency, prerequisites:m.production[locale], billingUnit:m.meter[locale] })), pricing:"Not set. Validate onboarding, provider costs, support, limits and willingness to pay before quoting.", security:"Production requirement, not implemented by this public demo or client-side module switches.", exclusions:["Provider licences", "Ad spend", "Messaging fees", "AI generation usage beyond agreed usage limits", "Custom migrations/integrations", "Legal interpretation of agreements"], liveConnections:false };
}
