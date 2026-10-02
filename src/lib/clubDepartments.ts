import type { Copy, Plan } from "./clubOperations";
export type DepartmentArea = "flow" | "audiences" | "results" | "brand" | "intelligence" | "sources" | "partners" | "talent" | "plan" | "calendar";
const c = (es: string, en: string): Copy => ({ es, en });
export const departments = {
  all: { label: c("Todo el equipo", "Whole team"), owner: "all", purpose: c("Coordina el plan compartido, las acciones y el trabajo pendiente.", "Coordinate the shared plan, actions and remaining work."), areas: ["plan", "flow", "calendar"] },
  marketing: { label: c("Marketing", "Marketing"), owner: "marketing", purpose: c("Prepara audiencias y acciones de captación, recurrencia y fidelización; comprueba cómo se medirán.", "Prepare audiences and acquisition, repeat-visit and loyalty actions; check how they will be measured."), areas: ["audiences", "flow", "results"] },
  communications: { label: c("Comunicación", "Communications"), owner: "communications", purpose: c("Revisa marca, mensajes y piezas; contrasta las sugerencias con la inteligencia de contenidos de prueba.", "Review brand, messages and assets; compare suggestions with test content intelligence."), areas: ["brand", "flow", "intelligence"] },
  ticketing: { label: c("Ticketing", "Ticketing"), owner: "ticketing", purpose: c("Comprueba elegibilidad, compra y acceso antes de activar audiencias. Las fuentes son sintéticas.", "Check eligibility, purchases and entry before activating audiences. Sources are synthetic."), areas: ["audiences", "sources", "results"] },
  business: { label: c("Negocio", "Business"), owner: "business", purpose: c("Prepara oportunidades para partners, revisa derechos y evalúa entregables sin asumir interés comercial confirmado.", "Prepare partner opportunities, review rights and evaluate deliverables without assuming confirmed commercial interest."), areas: ["partners", "talent", "results"] },
  direction: { label: c("Dirección", "Leadership"), owner: "all", purpose: c("Consulta el plan compartido, sus pendientes y la evidencia disponible. Una simulación no es un resultado de negocio.", "Inspect the shared plan, outstanding work and available evidence. A simulation is not a business result."), areas: ["plan", "calendar", "results"] },
} satisfies Record<string, { label: Copy; owner: string; purpose: Copy; areas: DepartmentArea[] }>;
export type Department = keyof typeof departments;
export function departmentWork(plan: Plan | null, department: Department) {
  const owner = departments[department].owner;
  const tasks = plan?.actions.flatMap(action => action.tasks.map(task => ({ action, task }))) ?? [];
  return {
    pending: tasks.filter(({ task }) => !task.done && (owner === "all" || task.owner === owner)),
    unassigned: tasks.filter(({ task }) => !task.done && !task.owner).length,
    total: tasks.length,
  };
}
