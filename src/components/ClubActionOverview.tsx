import type { Action, Locale, SourceId, SourceState } from "@/lib/clubOperations";
import { goalLabels, relativeDate, sourceLabels } from "@/lib/clubOperations";
import { actionTaskProgress } from "@/lib/clubJourney";
import styles from "./ClubOperationsDemo.module.css";

export function ClubActionOverview({ action, date, lang, sources, onTasks }: { action: Action; date: string; lang: Locale; sources: Record<SourceId, SourceState>; onTasks: () => void }) {
  const es = lang === "es";
  const tr = (a: string, b: string) => es ? a : b;
  const progress = actionTaskProgress(action);
  const owners: Record<string, string> = { marketing: "Marketing", communications: tr("Comunicación", "Communications"), ticketing: "Ticketing", partnerships: "Partners" };
  const checks: [string, boolean][] = [[tr("Responsable", "Owner"), Boolean(action.owner)], [tr("Audiencia y exclusiones", "Audience and exclusions"), action.audienceReviewed], [tr("Medición", "Measurement"), action.measurement], [tr("Fuentes necesarias", "Required sources"), action.sources.every(id => sources[id] === "ready")], ...(action.id === "partners" ? [[tr("Derechos del partner", "Partner rights"), action.rights] as [string, boolean]] : [])];
  return <div className={styles.actionOverview}>
    <dl className={styles.overviewFacts}>
      <div><dt>{tr("Objetivo", "Objective")}</dt><dd>{action.id === "mobility" ? tr("Facilitar la llegada", "Ease stadium travel") : goalLabels[action.id][lang]}</dd></div>
      <div><dt>{tr("Responsable de la acción", "Action owner")}</dt><dd>{owners[action.owner] ?? tr("Sin asignar", "Unassigned")}</dd></div>
      <div><dt>{tr("Partido", "Fixture")}</dt><dd><time dateTime={date}>{date}</time></dd></div>
      <div><dt>{tr("Ventana de tareas", "Task window")}</dt><dd>{progress.firstOffset !== null && progress.lastOffset !== null ? `${relativeDate(date, progress.firstOffset)} → ${relativeDate(date, progress.lastOffset)}` : tr("Sin tareas", "No tasks")}</dd></div>
    </dl>
    <details><summary>{tr("Audiencia, medición y requisitos", "Audience, measurement and prerequisites")} · {checks.filter(([, ready]) => !ready).length} {tr("pendientes de preparación", "preparation items pending")}</summary>
    <dl className={styles.overviewFacts}>
      <div><dt>{tr("Público y exclusiones", "Audience and exclusions")}</dt><dd>{action.audience[lang]}</dd></div>
      <div><dt>{tr("Cómo se evaluará", "How it will be evaluated")}</dt><dd>{action.kpi[lang]}</dd></div>
    </dl>
    <h3>{tr("Preparación de la acción", "Action preparation")}</h3>
    <ul className={styles.preparationList}>
      {checks.map(([label, ready]) => <li key={label}><strong>{label}</strong><span>{ready ? tr("Confirmado en ensayo", "Confirmed in rehearsal") : tr("Pendiente", "Pending")}</span></li>)}
    </ul>
    <p>{tr("Fuentes de ejemplo", "Example sources")}: {action.sources.map(id => `${sourceLabels[id][lang]} (${sources[id] === "ready" ? tr("disponible", "available") : sources[id] === "stale" ? tr("desactualizada", "stale") : tr("ausente", "missing")})`).join(" · ")}</p>
    </details>
    <p>{progress.done} / {progress.total} {tr("tareas completadas en ensayo", "tasks completed in rehearsal")} · {progress.unassigned} {tr("sin asignar", "unassigned")}. {tr("Completar tareas no equivale a aprobar o lanzar una campaña.", "Task completion does not approve or launch a campaign.")}</p>
    <button type="button" onClick={onTasks}>{tr("Ver tareas de esta acción", "View this action’s tasks")}</button>
  </div>;
}
