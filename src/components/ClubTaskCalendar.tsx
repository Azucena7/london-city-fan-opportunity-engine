import type { Locale, Plan } from "@/lib/clubOperations";
import { relativeDate } from "@/lib/clubOperations";
import { taskGroups, visibleTasks } from "@/lib/clubJourney";
import styles from "./ClubOperationsDemo.module.css";

export function ClubTaskCalendar({ plan, lang, owner, status, actionId, phase, editable, onAction, onOwner, onDone }: {
  plan: Plan; lang: Locale; owner: string; status: string; actionId: string; phase: string; editable: boolean;
  onAction: (id: Plan["actions"][number]["id"]) => void; onOwner: (id: string, owner: string) => void; onDone: (id: string, done: boolean) => void;
}) {
  const es = lang === "es";
  const tr = (a: string, b: string) => es ? a : b;
  const groups = taskGroups(visibleTasks(plan, owner, status, actionId, phase));
  if (!groups.length) return <section className={styles.panel}><h2>{tr("No hay tareas con estos filtros", "No tasks match these filters")}</h2><p>{tr("Prueba con todas las acciones, todo el equipo o todas las fases. El plan no se ha eliminado.", "Try all actions, the whole team or all phases. Your plan has not been removed.")}</p></section>;
  return <div className={styles.taskList}>{groups.map(({ offset, entries }) => <section className={styles.dateGroup} key={offset}>
    <header className={styles.dateHeading}><h2><time dateTime={relativeDate(plan.date, offset)}>{relativeDate(plan.date, offset)}</time></h2><p>{offset < 0 ? tr(`${-offset} ${offset === -1 ? "día" : "días"} antes del partido`, `${-offset} ${offset === -1 ? "day" : "days"} before the fixture`) : offset === 0 ? tr("Día del partido", "Matchday") : tr(`${offset} ${offset === 1 ? "día" : "días"} después del partido`, `${offset} ${offset === 1 ? "day" : "days"} after the fixture`)} · {entries.length} {entries.length === 1 ? tr("tarea", "task") : tr("tareas", "tasks")}</p></header>
    <div className={styles.taskList}>{entries.map(({ action, task }) => <article className={styles.task} key={task.id}>
      <div><span className={styles.badge}>{task.done ? tr("Completada en ensayo", "Completed in rehearsal") : !task.owner ? tr("Pendiente · sin asignar", "Pending · unassigned") : tr("Pendiente", "Pending")}</span><h3>{task.title[lang]}</h3><p>{action.title[lang]} · {task.department[lang]}</p><button type="button" onClick={() => onAction(action.id)}>{tr("Abrir acción", "Open action")}</button></div>
      <label>{tr("Asignar tarea", "Assign task")}<select value={task.owner} disabled={!editable} onChange={event => onOwner(task.id, event.target.value)}><option value="">{tr("Sin asignar", "Unassigned")}</option><option value="marketing">Marketing</option><option value="communications">{tr("Comunicación", "Communications")}</option><option value="ticketing">Ticketing</option><option value="partnerships">Partners</option></select></label>
      <label className={styles.check}><input type="checkbox" disabled={!editable || !task.owner} checked={task.done} onChange={event => onDone(task.id, event.target.checked)} />{tr("Completada en ensayo", "Complete in rehearsal")}</label>
      {!task.owner && <p>{tr("Asigna un responsable antes de marcarla como completada.", "Assign an owner before marking this task complete.")}</p>}
    </article>)}</div>
  </section>)}</div>;
}
