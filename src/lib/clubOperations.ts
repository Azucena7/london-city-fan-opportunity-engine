import sample from "../../data/seed/club-operations-demo.json";

/** Pure rehearsal domain. No personal data, credentials or external delivery. */
export type Locale = "es" | "en";
export type Copy = { es: string; en: string };
export const copy = (es: string, en: string): Copy => ({ es, en });
export type SourceId = "ticketing" | "crm" | "access" | "transport" | "weather";
export type SourceState = "ready" | "stale" | "missing";
export type Goal = "acquisition" | "repeat" | "attendance" | "partners" | "loyalty";
export type Role = "operator" | "approver" | "viewer";
export type Channel = "instagram" | "whatsapp" | "linkedin";
export type Fan = { id: string; segment: "subscriber" | "occasional"; purchases: number; visits: number; eligibleMatches: number; spend: number; optedIn: boolean; hasTicket: boolean; entitlement: boolean; reconciled: boolean; recentContacts: number };
export const demoFans: Fan[] = sample.fans as Fan[];
export const demoSourceManifest = sample.sources;
export const demoPartners = sample.partners;
export const demoMeasurement = sample.measurementExample;
export const goalLabels: Record<Goal, Copy> = {
  acquisition: copy("Captación", "Acquisition"), repeat: copy("Recurrencia", "Repeat visits"), attendance: copy("Asistencia y acceso", "Attendance & access"), partners: copy("Activación de partners", "Partner activation"), loyalty: copy("Fidelización", "Loyalty"),
};
export const sourceLabels: Record<SourceId, Copy> = {
  ticketing: copy("Ticketing · ejemplo", "Ticketing · example"), crm: copy("CRM · ejemplo", "CRM · example"), access: copy("Tornos · ejemplo", "Turnstiles · example"), transport: copy("Movilidad · señal ficticia", "Mobility · fictional signal"), weather: copy("Meteorología · señal ficticia", "Weather · fictional signal"),
};
export type Task = { id: string; title: Copy; department: Copy; offset: number; owner: string; done: boolean };
export type Action = {
  id: Goal | "mobility"; title: Copy; reason: Copy; audience: Copy; kpi: Copy;
  sources: SourceId[]; tasks: Task[]; owner: string; measurement: boolean; audienceReviewed: boolean; rights: boolean;
  approvedVersion: string | null; simulatedVersion: string | null;
};
export type Plan = { date: string; goal: Goal; mobility: boolean; comprehensive: boolean; actions: Action[] };
const task = (id: string, title: Copy, department: Copy, offset: number): Task => ({ id, title, department, offset, owner: "", done: false });
const marketing = copy("Marketing", "Marketing");
const communications = copy("Comunicación", "Communications");
const templates: Record<Goal | "mobility", { title: Copy; reason: Copy; audience: Copy; kpi: Copy; sources: SourceId[]; offset: number }> = {
  acquisition: { title: copy("Preparar captación local", "Prepare local acquisition"), reason: copy("Objetivo de captación seleccionado; hipótesis para probar, sin demanda externa medida.", "Acquisition objective selected; a hypothesis to test, with no measured external demand."), audience: copy("Audiencia publicitaria local por definir; no equivale a una lista de clientes contactables.", "Local advertising audience to define; not a contactable customer list."), kpi: copy("Primeras compras y coste de captación", "First purchases and acquisition cost"), sources: ["ticketing"], offset: -10 },
  repeat: { title: copy("Invitar a una nueva visita", "Invite a return visit"), reason: copy("Objetivo de recurrencia y cohorte sintética de compradores anteriores.", "Repeat objective and a synthetic cohort of previous buyers."), audience: copy("Compradores ocasionales con permiso; excluir entradas actuales, abonos y exceso de contactos.", "Opted-in occasional buyers; exclude current tickets, season entitlements and contact fatigue."), kpi: copy("Recompra frente a grupo de comparación", "Repeat purchase against a comparison group"), sources: ["ticketing", "crm"], offset: -7 },
  attendance: { title: copy("Preparar la asistencia", "Prepare attendance"), reason: copy("Objetivo de asistencia; los datos de prueba distinguen compra y acceso.", "Attendance objective; test data separates purchases and entry."), audience: copy("Titulares elegibles con entrada o abono; información para preparar su visita.", "Eligible ticket or season-pass holders; information to prepare their visit."), kpi: copy("Accesos reconciliados / derechos válidos", "Reconciled entries / valid entitlements"), sources: ["ticketing", "crm", "access"], offset: -3 },
  partners: { title: copy("Diseñar una activación conjunta", "Design a joint activation"), reason: copy("Objetivo de partners; oportunidad propuesta, sin interés comercial confirmado.", "Partner objective; a proposed opportunity, with no confirmed commercial interest."), audience: copy("Audiencia elegible según beneficio y contrato; sin compartir contactos con el partner.", "Eligible audience based on benefit and contract; no contact sharing with the partner."), kpi: copy("Participaciones verificadas y entregables cumplidos", "Verified participation and completed deliverables"), sources: ["ticketing", "crm"], offset: -10 },
  loyalty: { title: copy("Reconocer la participación", "Recognise participation"), reason: copy("Objetivo de fidelización; solo asistencias reconciliadas pueden alimentar recompensas.", "Loyalty objective; only reconciled attendance can inform rewards."), audience: copy("Participantes elegibles del programa de prueba; sin clasificación pública.", "Eligible participants in the test programme; no public leaderboard."), kpi: copy("Participación y siguiente visita", "Participation and next visit"), sources: ["crm", "access"], offset: 2 },
  mobility: { title: copy("Facilitar la llegada al estadio", "Make stadium travel easier"), reason: copy("Incidencia ficticia de transporte seleccionada para ensayar una respuesta.", "A fictional transport disruption selected to rehearse a response."), audience: copy("Asistentes elegibles afectados; segmentación territorial por confirmar.", "Eligible affected attendees; geographical segmentation to confirm."), kpi: copy("Uso de información de acceso y asistencia", "Travel information usage and attendance"), sources: ["crm", "transport"], offset: -2 },
};
export function validDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
}
export function relativeDate(date: string, offset: number): string {
  if (!validDate(date) || !Number.isSafeInteger(offset)) throw new Error("Invalid schedule");
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + offset);
  return result.toISOString().slice(0, 10);
}
export function generatePlan(date: string, goal: Goal, mobility: boolean, comprehensive = false): Plan {
  if (!validDate(date) || !Object.hasOwn(templates, goal) || goal === ("mobility" as string)) throw new Error("Invalid plan");
  const goals: Goal[] = comprehensive ? [goal, ...(["acquisition", "repeat", "attendance", "partners", "loyalty"] as Goal[]).filter((item) => item !== goal)] : [goal];
  const ids: (Goal | "mobility")[] = mobility ? [...goals, "mobility"] : goals;
  return { date, goal, mobility, comprehensive, actions: ids.map((id) => {
    const template = templates[id];
    return { id, ...template, owner: "", measurement: false, audienceReviewed: false, rights: false, approvedVersion: null, simulatedVersion: null, tasks: [
      task(`${id}-brief`, copy("Validar audiencia, propuesta y fuentes", "Validate audience, proposal and sources"), marketing, template.offset),
      task(`${id}-creative`, copy("Preparar y revisar creatividades", "Prepare and review creatives"), communications, template.offset + 1),
      task(`${id}-launch`, copy("Revisar aprobación y ensayar lanzamiento", "Review approval and rehearse launch"), marketing, id === "loyalty" ? 3 : -1),
      task(`${id}-measure`, copy("Reconciliar resultados y evaluar", "Reconcile results and evaluate"), copy("Negocio", "Business"), 4),
    ] };
  }) };
}
export function eligibleFans(goal: Goal | "mobility", fans: Fan[]): Fan[] {
  if (goal === "acquisition" || goal === "partners") return [];
  return fans.filter((fan) => fan.optedIn && fan.recentContacts < 2 && (
    goal === "repeat" ? fan.segment === "occasional" && fan.purchases > 0 && !fan.hasTicket && !fan.entitlement :
    goal === "loyalty" ? fan.reconciled && fan.visits > 0 : fan.hasTicket || fan.entitlement
  ));
}
export function rankFans(fans: Fan[], segment: "all" | Fan["segment"], metric: "attendance" | "purchases"): { fan: Fan; value: number | null }[] {
  return fans.filter((fan) => segment === "all" || fan.segment === segment).map((fan) => ({ fan, value: metric === "purchases" ? fan.purchases : fan.reconciled && fan.eligibleMatches > 0 ? fan.visits / fan.eligibleMatches : null })).sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.fan.id.localeCompare(b.fan.id));
}
export function actionVersion(action: Action, date: string, sources: Record<SourceId, SourceState>): string {
  return JSON.stringify({ id: action.id, date, owner: action.owner, measurement: action.measurement, audienceReviewed: action.audienceReviewed, rights: action.rights, sources: action.sources.map((id) => [id, sources[id]]) });
}
export function approvalBlockers(action: Action, date: string, sources: Record<SourceId, SourceState>, role: Role): string[] {
  const reasons: string[] = [];
  if (role !== "approver") reasons.push("role");
  if (!validDate(date)) reasons.push("date");
  if (!action.owner.trim()) reasons.push("owner");
  if (!action.measurement) reasons.push("measurement");
  if (!action.audienceReviewed) reasons.push("audience");
  if (action.id === "partners" && !action.rights) reasons.push("rights");
  if (action.sources.some((id) => sources[id] !== "ready")) reasons.push("sources");
  return reasons;
}
export type Creative = { actionId: Action["id"]; actionVersion: string; channel: Channel; text: string; headline: string; storyboard: string[]; approvedVersion: string | null };
export function generateCreative(action: Action, version: string, channel: Channel, club: string, opponent: string, date: string, locale: Locale): Creative {
  const es = locale === "es";
  const headline = action.id === "mobility" ? (es ? "Prepara tu llegada" : "Plan your journey") : action.id === "loyalty" ? (es ? "Tu próxima visita" : "Your next visit") : (es ? "Vivamos el próximo partido" : "Join the next matchday");
  const text = `${headline}. ${club} · ${opponent} · ${date}. ${action.id === "mobility" ? (es ? "Consulta la información oficial de transporte y accesos antes de salir." : "Check official travel and access information before you leave.") : (es ? "Consulta las condiciones y la disponibilidad en los canales oficiales del club." : "Check terms and availability through the club’s official channels.")} ${channel === "whatsapp" ? (es ? "En el envío real se incluirá el mecanismo de baja aprobado." : "The live message must include the approved opt-out mechanism.") : ""}`.trim();
  return { actionId: action.id, actionVersion: version, channel, text, headline, approvedVersion: null, storyboard: [
    es ? "0–3 s · Apertura con material autorizado del club." : "0–3 s · Open with licensed club footage.",
    `3–7 s · ${headline}.`,
    `7–11 s · ${club} · ${opponent} · ${date}.`,
    es ? "11–15 s · Información oficial, condiciones y llamada a la acción. Subtítulos." : "11–15 s · Official information, terms and call to action. Captions.",
  ] };
}
export function creativeVersion(creative: Creative): string {
  return JSON.stringify({ actionId: creative.actionId, actionVersion: creative.actionVersion, channel: creative.channel, text: creative.text, headline: creative.headline, storyboard: creative.storyboard });
}
export function canSimulate(action: Action, date: string, sources: Record<SourceId, SourceState>, role: Role, creative: Creative | null): boolean {
  const version = actionVersion(action, date, sources);
  return approvalBlockers(action, date, sources, role).length === 0 && action.approvedVersion === version && action.simulatedVersion !== version && Boolean(creative && creative.actionId === action.id && creative.actionVersion === version && creative.approvedVersion === creativeVersion(creative));
}
export function calendarExport(plan: Plan, locale: Locale): string {
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const events = plan.actions.flatMap((action) => action.tasks.map((item) => ["BEGIN:VEVENT", `UID:${plan.date}-${item.id}@club-rehearsal.invalid`, "DTSTAMP:20261001T000000Z", `DTSTART;VALUE=DATE:${relativeDate(plan.date, item.offset).replaceAll("-", "")}`, `DTEND;VALUE=DATE:${relativeDate(plan.date, item.offset + 1).replaceAll("-", "")}`, `SUMMARY:${escape(`${locale === "es" ? "ENSAYO" : "REHEARSAL"} · ${item.title[locale]}`)}`, `DESCRIPTION:${escape(`${action.title[locale]} · ${item.owner || "—"}`)}`, "END:VEVENT"].join("\r\n")));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fan Growth Engine//Synthetic rehearsal//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}
