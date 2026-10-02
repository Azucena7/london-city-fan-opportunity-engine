import type { Locale, Plan } from "@/lib/clubOperations";
import { departments, departmentWork } from "@/lib/clubDepartments";
import type { Department, DepartmentArea } from "@/lib/clubDepartments";
import styles from "./ClubOperationsDemo.module.css";

export function ClubDepartmentHome({ department, lang, plan, onDepartment, onArea, onTasks }: {
  department: Department; lang: Locale; plan: Plan | null; onDepartment: (value: Department) => void; onArea: (value: DepartmentArea) => void; onTasks: (owner: string) => void;
}) {
  const tr = (es: string, en: string) => lang === "es" ? es : en;
  const focus = departments[department];
  const work = departmentWork(plan, department);
  const areaLabels: Record<DepartmentArea, string> = {
    plan: tr("Partido y plan", "Fixture and plan"), flow: tr("Preparar acciones y piezas", "Prepare actions and assets"), calendar: tr("Calendario del equipo", "Team calendar"),
    audiences: tr("Audiencias y elegibilidad", "Audiences and eligibility"), results: tr("Resultados y evidencia", "Results and evidence"), brand: tr("Marca del club", "Club brand"),
    intelligence: tr("Contenidos y tendencias", "Content and trends"), sources: tr("Fuentes y conexiones", "Sources and connections"), partners: tr("Oportunidades de partners", "Partner opportunities"), talent: tr("Talento y derechos", "Talent and rights"),
  };
  return <section className={styles.panel} aria-label={tr("Vista del departamento", "Department view")}>
    <label className={styles.picker}>{tr("Vista del departamento · demo", "Department view · demo")}<select value={department} onChange={event => onDepartment(event.target.value as Department)}>{(Object.keys(departments) as Department[]).map(id => <option key={id} value={id}>{departments[id].label[lang]}</option>)}</select></label>
    <h2>{tr("Prioridades de", "Priorities for")} {focus.label[lang]}</h2><p>{focus.purpose[lang]}</p>
    <p className={styles.departmentNote}>{tr("Este selector solo cambia el enfoque del inicio. No identifica a una persona ni concede permisos. El rol simulado y los controles de aprobación siguen vigentes.", "This selector only changes the home focus. It does not identify a person or grant permissions. Simulated roles and approval checks still apply.")}</p>
    <nav className={styles.actions} aria-label={tr("Accesos del departamento", "Department shortcuts")}>{focus.areas.map(area => <button key={area} type="button" onClick={() => onArea(area)}>{areaLabels[area]}</button>)}</nav>
    {plan ? <div className={styles.departmentTasks}>
      <h3>{focus.owner === "all" ? tr("Pendientes del equipo", "Team pending work") : tr("Tareas pendientes asignadas a este departamento", "Pending tasks assigned to this department")}</h3>
      <p><strong>{work.pending.length}</strong> {work.pending.length === 1 ? tr("tarea pendiente", "pending task") : tr("tareas pendientes", "pending tasks")}. {focus.owner !== "all" && tr("Se cuentan asignaciones explícitas; el departamento sugerido de una tarea no la asigna automáticamente.", "Only explicit assignments count; a suggested task department does not assign it automatically.")}</p>
      <button type="button" onClick={() => onTasks(focus.owner)}>{tr("Abrir estas tareas", "Open these tasks")}</button>
      {work.unassigned > 0 && <p>{work.unassigned} {tr("pendientes sin responsable en el plan compartido", "unassigned pending tasks in the shared plan")}. <button type="button" onClick={() => onTasks("unassigned")}>{tr("Revisar sin asignar", "Review unassigned")}</button></p>}
    </div> : <p>{tr("Todavía no hay plan ni tareas generadas. Prepara el partido para empezar.", "No generated plan or tasks yet. Prepare the fixture to start.")}</p>}
  </section>;
}
