import raw from "../../data/seed/club-permission-profiles.json";
export type ClubRole = keyof typeof raw;
export const areas = { overview: "Panel del club", matchplan: "Plan por partido", campaigns: "Campañas y flujos", calendar: "Calendario y equipo", brand: "Marca", studio: "Estudio creativo", audiences: "Audiencias y CRM", intelligence: "Contenidos y tendencias", partners: "Partners", talent: "Talento y derechos", connections: "Fuentes y conexiones", governance: "Control y cumplimiento", results: "Resultados", users: "Usuarios y permisos", licence: "Licencia" } as const;
export const actions = { view: "Ver", edit: "Editar", approve: "Aprobar", launch: "Lanzar", export: "Exportar", administer: "Administrar" } as const;
export type ClubArea = keyof typeof areas;
export type ClubAction = keyof typeof actions;
export type ClubPermission = { area: ClubArea; action: ClubAction };
export type PermissionOverride = ClubPermission & { allowed: boolean };
export const profiles = raw as Record<ClubRole, { label: string; permissions: Partial<Record<ClubArea, ClubAction[]>> }>;
export const isRole = (value: unknown): value is ClubRole => typeof value === "string" && Object.hasOwn(profiles, value);
export const isArea = (value: unknown): value is ClubArea => typeof value === "string" && Object.hasOwn(areas, value);
export const isAction = (value: unknown): value is ClubAction => typeof value === "string" && Object.hasOwn(actions, value);

// Presentation preview only. Private permissions come from the database RPC.
export function previewPermissions(role: ClubRole, overrides: PermissionOverride[] = []): ClubPermission[] {
  const output: ClubPermission[] = [];
  const allowed = (area: ClubArea, action: ClubAction) => overrides.find(p => p.area === area && p.action === action)?.allowed ?? profiles[role].permissions[area]?.includes(action) ?? false;
  for (const area of Object.keys(areas) as ClubArea[]) {
    if (!allowed(area, "view")) continue;
    for (const action of Object.keys(actions) as ClubAction[]) if (allowed(area, action)) output.push({ area, action });
  }
  return output;
}

export function permits(permissions: ClubPermission[], area: ClubArea, action: ClubAction): boolean {
  return permissions.some(p => p.area === area && p.action === "view") && permissions.some(p => p.area === area && p.action === action);
}
