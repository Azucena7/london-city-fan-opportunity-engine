"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { canApproveClubDemo, clubDemoDefaults, clubDemoExample, clubDemoMetrics, clubDemoVersion, validateClubDemoData } from "@/lib/clubWorkspace";
import type { ClubDemoAggregates, ClubDemoProfile, ClubGoal, DemoRole } from "@/lib/clubWorkspace";
import styles from "./ClubWorkspaceDemo.module.css";

type View = "home" | "profile" | "sources" | "decision" | "results";
type Fixture = { opponent: string; date: string; kickoff: string; venue: string };

export function ClubWorkspaceDemo({ fixture }: { fixture: Fixture }) {
  const { lang } = useLanguage();
  const es = lang === "es";
  const tr = (spanish: string, english: string) => es ? spanish : english;
  const [view, setView] = useState<View>("home");
  const [profile, setProfile] = useState<ClubDemoProfile>({ ...clubDemoDefaults });
  const [role, setRole] = useState<DemoRole>("operator");
  const [draft, setDraft] = useState<ClubDemoAggregates>({ ...clubDemoExample });
  const [data, setData] = useState<ClubDemoAggregates | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [approvedVersion, setApprovedVersion] = useState<string | null>(null);
  const [activity, setActivity] = useState<string[]>([]);
  const metrics = clubDemoMetrics(data);
  const version = clubDemoVersion(profile, data);
  const approved = approvedVersion === version;
  const allowed = canApproveClubDemo(profile, data, role);
  const editable = role !== "viewer";
  const goalLabels: Record<ClubGoal, string> = { repeat: tr("Repetición de visita", "Repeat visits"), attendance: tr("Asistencia", "Attendance"), revenue: tr("Ingresos por partido", "Matchday revenue") };
  const titles: Record<View, string> = { home: tr("Inicio", "Home"), profile: tr("Mi club", "My club"), sources: tr("Fuentes y datos", "Sources & data"), decision: tr("Decisión", "Decision"), results: tr("Resultados", "Results") };
  const errorLabels: Record<string, string> = {
    "synthetic-only": tr("Solo se admite el ejemplo sintético de este ensayo.", "Only this rehearsal's synthetic example is supported."),
    fixture: tr("El ejemplo debe corresponder al partido de Brighton.", "The example must match the Brighton fixture."),
    counts: tr("Los recuentos deben ser números enteros, finitos y no negativos.", "Counts must be finite, non-negative integers."),
    revenue: tr("Los ingresos deben ser un importe válido y no negativo.", "Revenue must be a valid, non-negative amount."),
    scans: tr("Los accesos no pueden superar las entradas vendidas.", "Scans cannot exceed tickets sold."),
    repeat: tr("Los compradores que repiten no pueden superar la cohorte elegible.", "Repeat buyers cannot exceed the eligible cohort.")
  };
  const goalCopy = {
    repeat: { title: tr("Probar una razón para volver ante Everton", "Test a reason to return against Everton"), audience: tr("Compradores recientes elegibles; excluir a quienes ya compraron Everton.", "Eligible recent buyers; exclude people who already bought Everton."), kpi: tr("Repetición entre partidos", "Repeat purchase between fixtures") },
    attendance: { title: tr("Probar un mensaje familiar para llenar más asientos", "Test family messaging to fill more seats"), audience: tr("Familias del territorio con oferta y canales aprobados por el club.", "Local families using a club-approved offer and channels."), kpi: tr("Compras y accesos al partido", "Purchases and matchday scans") },
    revenue: { title: tr("Evaluar el valor de la oferta oficial de partido", "Evaluate the value of the official matchday offer"), audience: tr("Audiencia elegible para productos oficiales; sin descuentos inventados.", "Audience eligible for official products; no invented discounts."), kpi: tr("Ingresos realizados por partido", "Realised matchday revenue") }
  }[profile.goal];
  const number = (value: number) => value.toLocaleString(es ? "es-ES" : "en-GB");
  const percentage = (value: number | null) => value === null ? "—" : `${number(Math.round(value * 100))}%`;
  const money = (value: number) => new Intl.NumberFormat(es ? "es-ES" : "en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);

  function updateProfile(patch: Partial<ClubDemoProfile>) {
    if (!editable) return;
    setProfile((previous) => ({ ...previous, ...patch }));
    setApprovedVersion(null);
    setNotice(tr("Configuración actualizada para este ensayo. Requiere nueva revisión.", "Configuration updated for this rehearsal. A new review is required."));
  }
  function loadExample() {
    if (!editable) return;
    const problems = validateClubDemoData(draft);
    setErrors(problems);
    if (problems.length) { setNotice(tr("No se ha aplicado el ejemplo. Corrige los errores.", "The example was not applied. Correct the errors.")); return; }
    setData({ ...draft });
    setApprovedVersion(null);
    setNotice(tr("Ejemplo validado. Métricas recalculadas; aprobación pendiente.", "Example validated. Metrics recalculated; approval pending."));
    setActivity((previous) => [tr("Ejemplo agregado validado y aplicado.", "Aggregate example validated and applied."), ...previous].slice(0, 6));
  }
  function approve() {
    if (!allowed || approved) return;
    setApprovedVersion(version);
    setNotice(tr("Decisión aprobada solo dentro del ensayo. No se ha activado ninguna campaña.", "Decision approved inside the rehearsal only. No campaign has been activated."));
    setActivity((previous) => [tr("Aprobación de ensayo registrada para la configuración actual.", "Rehearsal approval recorded for the current configuration."), ...previous].slice(0, 6));
  }
  function reset() {
    setProfile({ ...clubDemoDefaults }); setRole("operator"); setDraft({ ...clubDemoExample }); setData(null); setErrors([]); setApprovedVersion(null); setActivity([]); setView("home");
    setNotice(tr("Ensayo reiniciado.", "Rehearsal reset."));
  }

  return <main className={`${styles.shell} productAppShell`}>
    <header className={styles.topbar}><Link href="/">Fan Growth Engine</Link><div><LanguageSwitcher /><button type="button" onClick={reset}>{tr("Reiniciar ensayo", "Reset rehearsal")}</button></div></header>
    <aside className={styles.demoNotice}><strong>{tr("PROTOTIPO PÚBLICO · SOLO DATOS DE PRUEBA", "PUBLIC PROTOTYPE · TEST DATA ONLY")}</strong><p>{tr("Este recorrido representa el futuro espacio interno de un club. Todavía no tiene autenticación ni conexiones reales. No introduzcas datos privados. Los cambios viven en esta página y se pierden al recargar.", "This walkthrough represents a future internal club workspace. It has no authentication or live connections yet. Do not enter private data. Changes live on this page and reset on reload.")}</p></aside>
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.club}><span className={styles.clubMark}>LC</span><div><strong>London City</strong><span>{tr("Espacio de trabajo · ensayo", "Workspace · rehearsal")}</span></div></div>
        <nav aria-label={tr("Vistas del club", "Club views")}>{(Object.keys(titles) as View[]).map((key) => <button type="button" key={key} aria-current={view === key ? "page" : undefined} className={view === key ? styles.active : ""} onClick={() => { setView(key); setNotice(""); }}>{titles[key]}<span aria-hidden="true">→</span></button>)}</nav>
        <label className={styles.roleLabel} htmlFor="club-demo-role">{tr("Simular rol", "Simulate role")}<select id="club-demo-role" value={role} onChange={(event) => setRole(event.target.value as DemoRole)}><option value="operator">{tr("Operaciones", "Operator")}</option><option value="approver">{tr("Responsable de aprobación", "Approver")}</option><option value="viewer">{tr("Solo lectura", "Read only")}</option></select></label>
        <p>{tr("Cambiar este rol prueba la interfaz; no concede permisos reales.", "Switching roles tests the interface; it grants no real permissions.")}</p>
        <Link href="/london-city">{tr("Ver caso público ↗", "View public case ↗")}</Link>
      </aside>
      <section className={styles.content} aria-label={titles[view]}>
        <header className={styles.pageHead}><div><p className={styles.eyebrow}>{tr("CLIENTE · LONDON CITY", "CLIENT · LONDON CITY")}</p><h1>{titles[view]}</h1><p>{view === "home" ? tr("Una prioridad clara para el próximo partido.", "A clear priority for the next fixture.") : view === "profile" ? tr("El objetivo y las reglas que orientan el motor.", "The objective and rules guiding the engine.") : view === "sources" ? tr("Comprueba los datos antes de utilizarlos.", "Check data before using it.") : view === "decision" ? tr("Revisa la propuesta antes de aprobarla.", "Review the proposal before approving it.") : tr("Aprende del ejemplo sin confundirlo con resultados reales.", "Learn from the example without mistaking it for real outcomes.")}</p></div><span className={styles.badge}>{tr("Ensayo", "Rehearsal")}</span></header>
        <p className={styles.status} role="status" aria-live="polite">{notice}</p>

        {view === "home" ? <>
          <div className={styles.metrics}><article><span>{tr("Próximo partido de ejemplo", "Example next fixture")}</span><strong>{fixture.opponent}</strong><p>{fixture.date} · {fixture.kickoff} · {tr("hora de Londres", "London time")}</p></article><article><span>{tr("Objetivo", "Objective")}</span><strong>{goalLabels[profile.goal]}</strong><p>{tr("Modifica la recomendación", "Changes the recommendation")}</p></article><article><span>{tr("Datos del ensayo", "Rehearsal data")}</span><strong>{data ? tr("Ejemplo validado", "Example validated") : tr("Sin cargar", "Not loaded")}</strong><p>{tr("Ninguna conexión real", "No live connection")}</p></article></div>
          <article className={styles.priority}><p className={styles.eyebrow}>{tr("PRIORIDAD PROPUESTA", "PROPOSED PRIORITY")}</p><h2>{goalCopy.title}</h2><p>{goalCopy.audience}</p><p><strong>{tr("Estado: ", "State: ")}</strong>{approved ? tr("Aprobada en el ensayo", "Approved in rehearsal") : tr("Pendiente de revisión", "Awaiting review")}</p><button className={styles.primary} type="button" onClick={() => setView("decision")}>{tr("Abrir decisión", "Open decision")}</button></article>
          <section className={styles.panel}><h2>{tr("Qué hacer ahora", "What to do now")}</h2><div className={styles.tasks}><button type="button" onClick={() => setView("profile")}><strong>01 · {tr("Configurar objetivo", "Set objective")}</strong><span>{tr("Asignar responsable y acordar medición", "Assign an owner and agree measurement")}</span></button><button type="button" onClick={() => setView("sources")}><strong>02 · {tr("Validar datos de prueba", "Validate test data")}</strong><span>{data ? tr("Ejemplo aplicado; puedes revisar sus valores", "Example applied; review its values") : tr("Cargar el ejemplo agregado de Brighton", "Load the Brighton aggregate example")}</span></button><button type="button" onClick={() => setView("decision")}><strong>03 · {tr("Revisar y aprobar", "Review and approve")}</strong><span>{tr("Solo se aprueba con los requisitos completos", "Approval requires all checks to pass")}</span></button></div></section>
          <section className={styles.panel}><h2>{tr("Actividad de esta sesión", "Session activity")}</h2>{activity.length ? <ul>{activity.map((item,index) => <li key={index}>{item}</li>)}</ul> : <p>{tr("Todavía no se han aplicado datos ni registrado aprobaciones.", "No data applied or approvals recorded yet.")}</p>}</section>
        </> : null}

        {view === "profile" ? <>
          <section className={styles.panel}><h2>{tr("Perfil del club piloto", "Pilot club profile")}</h2><dl className={styles.facts}><div><dt>{tr("Club", "Club")}</dt><dd>London City Lionesses</dd></div><div><dt>{tr("País / moneda", "Country / currency")}</dt><dd>UK · GBP</dd></div><div><dt>{tr("Recinto", "Venue")}</dt><dd>{fixture.venue}</dd></div><div><dt>{tr("Zona horaria", "Time zone")}</dt><dd>Europe/London</dd></div></dl><p>{tr("Esta primera versión está limitada al club piloto. No crea cuentas ni otros clubes.", "This first version is limited to the pilot club. It creates no accounts or other clubs.")}</p></section>
          <section className={styles.panel}><h2>{tr("Configurar el motor", "Configure the engine")}</h2><div className={styles.fields}><label htmlFor="club-demo-goal">{tr("Objetivo prioritario", "Priority objective")}<select id="club-demo-goal" value={profile.goal} disabled={!editable} onChange={(event) => updateProfile({ goal: event.target.value as ClubGoal })}>{(Object.keys(goalLabels) as ClubGoal[]).map((goal) => <option key={goal} value={goal}>{goalLabels[goal]}</option>)}</select></label><label htmlFor="club-demo-planning">{tr("Preparar la decisión con", "Prepare the decision") }<select id="club-demo-planning" value={profile.planningDays} disabled={!editable} onChange={(event) => updateProfile({ planningDays: Number(event.target.value) })}><option value={3}>{tr("3 días de antelación", "3 days ahead")}</option><option value={7}>{tr("7 días de antelación", "7 days ahead")}</option><option value={14}>{tr("14 días de antelación", "14 days ahead")}</option></select></label></div><p>{tr("Cambiar estos ajustes actualiza la propuesta y anula su aprobación anterior. Son reglas de ensayo, no un modelo entrenado con datos del club.", "Changing these settings updates the proposal and invalidates its prior approval. These are rehearsal rules, not a model trained on club data.")}</p></section>
          <section className={styles.panel}><h2>{tr("Responsabilidad y medición", "Ownership and measurement")}</h2><label className={styles.check}><input type="checkbox" checked={profile.ownerAssigned} disabled={!editable} onChange={(event) => updateProfile({ ownerAssigned: event.target.checked })} />{tr("Simular un responsable asignado por el club", "Simulate a club-assigned owner")}</label><label className={styles.check}><input type="checkbox" checked={profile.measurementAgreed} disabled={!editable} onChange={(event) => updateProfile({ measurementAgreed: event.target.checked })} />{tr("Simular KPI y criterios de comparación acordados", "Simulate an agreed KPI and comparison criteria")}</label><button className={styles.primary} type="button" onClick={() => setView("sources")}>{tr("Continuar a fuentes", "Continue to sources")}</button></section>
        </> : null}

        {view === "sources" ? <>
          <div className={styles.sourceCards}><article><span className={styles.badge}>{tr("Referencia pública", "Public reference")}</span><h2>{tr("Calendario", "Calendar")}</h2><p>{tr("Everton usa el calendario del demostrador. No es una sincronización de una cuenta del club.", "Everton uses the demonstrator calendar. This is not a club-account sync.")}</p><Link href="/calendar">{tr("Consultar calendario ↗", "Inspect calendar ↗")}</Link></article><article><span className={styles.badge}>{data ? tr("Ejemplo aplicado", "Example applied") : tr("Pendiente", "Pending")}</span><h2>{tr("Resultados agregados", "Aggregate outcomes")}</h2><p>{tr("Ensayo de compras, accesos, ingresos y repetición con valores ficticios.", "Rehearse purchases, scans, revenue and repeat visits with fictional values.")}</p></article><article><span className={styles.badge}>{tr("Requiere acceso privado", "Requires private access")}</span><h2>CRM / ticketing</h2><p>{tr("Conexión real bloqueada hasta disponer de autenticación, permisos y almacenamiento privado.", "Live connection blocked until authentication, permissions and private storage are available.")}</p><button type="button" disabled>{tr("Conectar en la versión privada", "Connect in the private version")}</button></article></div>
          <section className={styles.panel}><h2>{tr("Validar el ejemplo de Brighton", "Validate the Brighton example")}</h2><p>{tr("Todos los valores siguientes son sintéticos. Modifícalos para probar errores y recálculo; no introduzcas datos reales. No se envían ni se guardan.", "All values below are synthetic. Edit them to test errors and recalculation; do not enter real data. They are neither submitted nor saved.")}</p><div className={styles.fields}>{([{ key: "ticketsSold", label: tr("Entradas vendidas", "Tickets sold") }, { key: "scans", label: tr("Accesos registrados", "Recorded scans") }, { key: "revenue", label: tr("Ingresos de ejemplo (GBP)", "Example revenue (GBP)") }, { key: "repeatEligible", label: tr("Cohorte elegible para repetir", "Eligible repeat cohort") }, { key: "repeatPurchased", label: tr("Compradores que repiten", "Repeat buyers") }] as const).map(({ key, label }) => <label key={key} htmlFor={`club-demo-${key}`}>{label}<input id={`club-demo-${key}`} type="number" min={0} step={key === "revenue" ? "0.01" : "1"} disabled={!editable} value={Number.isFinite(draft[key]) ? draft[key] : ""} onChange={(event) => { setDraft((previous) => ({ ...previous, [key]: event.target.value === "" ? NaN : Number(event.target.value) })); setNotice(""); }} /></label>)}</div>{errors.length ? <div className={styles.error} role="alert"><strong>{tr("Revisa el ejemplo", "Review the example")}</strong><ul>{errors.map((error) => <li key={error}>{errorLabels[error]}</li>)}</ul></div> : null}<div className={styles.actions}><button type="button" className={styles.primary} disabled={!editable} onClick={loadExample}>{tr("Validar y aplicar ejemplo", "Validate and apply example")}</button><button type="button" disabled={!editable} onClick={() => { setDraft({ ...clubDemoExample }); setErrors([]); }}>{tr("Restaurar valores de prueba", "Restore test values")}</button>{data ? <button type="button" disabled={!editable} onClick={() => { setData(null); setApprovedVersion(null); setNotice(tr("Ejemplo desconectado. Resultados vuelven a pendientes.", "Example disconnected. Results return to pending.")); }}>{tr("Desconectar ejemplo", "Disconnect example")}</button> : null}</div><p>{tr("Un error conserva el último ejemplo válido; los campos editados no afectan al motor hasta aplicar la validación.", "An error preserves the last valid example; edited fields do not affect the engine until validation is applied.")}</p></section>
          <section className={styles.panel}><h2>{tr("Antes de conectar fuentes reales", "Before connecting real sources")}</h2><p>{tr("La versión privada necesitará acceso autenticado, permisos por club, comprobación de campos, historial de importaciones y credenciales en servidor. No hay campos para contraseñas o claves en este prototipo.", "The private version needs authenticated access, club-scoped permissions, field checks, import history and server-side credentials. This prototype has no password or API-key fields.")}</p><button type="button" onClick={() => setView("decision")}>{tr("Revisar decisión con este contexto", "Review the decision with this context")}</button></section>
        </> : null}

        {view === "decision" ? <>
          <article className={styles.priority}><p className={styles.eyebrow}>{tr("PROPUESTA ADAPTADA AL OBJETIVO", "PROPOSAL ADAPTED TO THE OBJECTIVE")}</p><h2>{goalCopy.title}</h2><p>{goalCopy.audience}</p><dl className={styles.facts}><div><dt>{tr("Medir", "Measure")}</dt><dd>{goalCopy.kpi}</dd></div><div><dt>{tr("Momento de revisión", "Review timing")}</dt><dd>{tr(`${profile.planningDays} días antes del partido`, `${profile.planningDays} days before the fixture`)}</dd></div><div><dt>{tr("Evidencia disponible", "Available evidence")}</dt><dd>{data ? tr("Ejemplo sintético validado", "Validated synthetic example") : tr("Datos de prueba pendientes", "Test data pending")}</dd></div><div><dt>{tr("Presupuesto / activación real", "Real budget / activation")}</dt><dd>{tr("No aprobados", "Not approved")}</dd></div></dl><p>{tr("La oferta y la audiencia reales deben ser autorizadas por el club. El ejemplo de Brighton prueba el flujo; no demuestra demanda adicional ante Everton.", "The club must authorise the real offer and audience. The Brighton example tests the workflow; it does not establish additional Everton demand.")}</p></article>
          <section className={styles.panel}><h2>{tr("Requisitos para aprobar el ensayo", "Rehearsal approval requirements")}</h2><ul className={styles.gates}><li>{profile.ownerAssigned ? "✓" : "○"} {tr("Responsable simulado asignado", "Simulated owner assigned")}</li><li>{profile.measurementAgreed ? "✓" : "○"} {tr("KPI y comparación simulados acordados", "Simulated KPI and comparison agreed")}</li><li>{data ? "✓" : "○"} {tr("Ejemplo agregado validado", "Aggregate example validated")}</li><li>{role === "approver" ? "✓" : "○"} {tr("Rol de aprobación seleccionado", "Approver role selected")}</li></ul><div className={styles.actions}><button className={styles.primary} type="button" disabled={!allowed || approved} onClick={approve}>{approved ? tr("Aprobada en el ensayo", "Approved in rehearsal") : tr("Aprobar ensayo", "Approve rehearsal")}</button><button type="button" onClick={() => setView("profile")}>{tr("Revisar configuración", "Review configuration")}</button><button type="button" onClick={() => setView("results")}>{tr("Ver resultados de ejemplo", "View example results")}</button></div><p>{tr("La aprobación es local y simulada. No envía mensajes, no invierte presupuesto y no ejecuta campañas. Si cambian datos o configuración, debe revisarse de nuevo.", "Approval is local and simulated. It sends no messages, spends no budget and runs no campaigns. Data or configuration changes require a new review.")}</p></section>
        </> : null}

        {view === "results" ? <>
          <section className={styles.panel}><span className={styles.badge}>{tr("BRIGHTON · RESULTADOS SINTÉTICOS", "BRIGHTON · SYNTHETIC RESULTS")}</span><h2>{tr("Qué permite leer el ejemplo agregado", "What the aggregate example lets you read")}</h2><p>{tr("Estos valores ficticios pertenecen al ejemplo histórico de Brighton. No son resultados del club ni de la propuesta futura de Everton.", "These fictional values belong to the historical Brighton example. They are neither club results nor outcomes of the future Everton proposal.")}</p>{metrics ? <div className={styles.metrics}><article><span>{tr("Entradas de prueba", "Test tickets")}</span><strong>{number(metrics.ticketsSold)}</strong></article><article><span>{tr("Accesos de prueba", "Test scans")}</span><strong>{number(metrics.scans)}</strong><p>{percentage(metrics.scanRate)} {tr("de las entradas", "of tickets")}</p></article><article><span>{tr("Ingresos de prueba", "Test revenue")}</span><strong>{money(metrics.revenue)}</strong></article><article><span>{tr("Repetición de prueba", "Test repeat rate")}</span><strong>{percentage(metrics.repeatRate)}</strong><p>{number(metrics.repeatPurchased)} / {number(metrics.repeatEligible)}</p></article></div> : <div className={styles.empty}><strong>{tr("Sin ejemplo validado", "No validated example")}</strong><p>{tr("Carga los datos de prueba antes de calcular métricas. No sustituimos los datos ausentes por ceros.", "Load test data before calculating metrics. Missing data is not replaced with zero.")}</p><button type="button" className={styles.primary} onClick={() => setView("sources")}>{tr("Ir a fuentes", "Go to sources")}</button></div>}</section>
          <section className={styles.panel}><h2>{tr("Qué cambia en la siguiente decisión", "What changes in the next decision")}</h2><p>{tr("El objetivo elegido determina el KPI que revisamos. La disponibilidad de datos determina si podemos describir resultados. Ninguna de las dos demuestra impacto incremental.", "The chosen objective determines the KPI we review. Data availability determines whether we can describe outcomes. Neither establishes incremental impact.")}</p><p><strong>{tr("Objetivo actual: ", "Current objective: ")}</strong>{goalLabels[profile.goal]} · {goalCopy.kpi}</p><p>{tr("Para aprender con datos reales hará falta una comparación válida y umbrales acordados antes de activar. Este prototipo no modifica automáticamente pesos ni afirma que el modelo esté entrenado.", "Learning from real data requires a valid comparison and thresholds agreed before activation. This prototype does not automatically alter weights or claim the model is trained.")}</p><button type="button" className={styles.primary} onClick={() => setView("decision")}>{tr("Volver a la decisión", "Return to the decision")}</button></section>
        </> : null}
      </section>
    </div>
  </main>;
}
