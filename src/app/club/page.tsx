import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentClubIdentity } from "@/lib/clubSession";
import { areas, actions, profiles } from "@/lib/clubPermissions";
import { signOut } from "./sign-in/actions";
import styles from "./club.module.css";
import { cookies } from "next/headers";
import { clubCookie, clubEnvironment } from "@/lib/clubSession";
import { permits } from "@/lib/clubPermissions";
import { accessMatchDrafts } from "@/lib/clubDrafts";
import { createMatchDraft } from "./drafts/actions";

export const metadata: Metadata = { title: "Tu espacio de trabajo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function ClubPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const identity = await currentClubIdentity();
  if (!identity) redirect("/club/sign-in");
  const token = (await cookies()).get(clubCookie)?.value;
  const status = (await searchParams).draft;
  const drafts = await Promise.all(identity.memberships.map(async club => permits(club.permissions, "matchplan", "view") && token
    ? accessMatchDrafts(clubEnvironment(), token, club.clubId) : undefined));
  return <main id="main-content" className={styles.shell}>
    <p className={styles.eyebrow}>Espacio privado</p><h1>Tu espacio de trabajo</h1>
    <p>Tu perfil determina qué áreas puedes consultar y qué acciones puedes realizar.</p>
    {status === "saved" && <p role="status">Borrador guardado. Puedes recuperarlo en tu próximo acceso.</p>}
    {status === "error" && <p role="alert">No se ha confirmado el guardado. Comprueba tu sesión y permisos antes de intentarlo de nuevo.</p>}
    {identity.memberships.map((club, index) => <section key={club.clubId} className={styles.card}>
      <h2>{club.clubName}</h2><p>Permiso: {profiles[club.role].label}</p>
      <ul>{Object.entries(areas).filter(([area]) => club.permissions.some(p => p.area === area && p.action === "view")).map(([area, label]) => <li key={area}><strong>{label}</strong>: {club.permissions.filter(p => p.area === area).map(p => actions[p.action]).join(", ")}</li>)}</ul>
      {permits(club.permissions, "matchplan", "view") && <>
        <h3>Borradores de partido</h3>
        <p>Define el punto de partida. Guardar un borrador no genera una campaña ni autoriza ningún envío.</p>
        {drafts[index] === null ? <p role="alert">No podemos recuperar los borradores. No se han sustituido por datos de demo.</p>
          : drafts[index]?.length === 0 ? <p>Todavía no hay borradores guardados.</p>
          : <ul>{drafts[index]?.map(d => <li key={d.id}><strong>{d.opponent}</strong> · {d.match_date} · {{ attendance: "Asistencia", repeat: "Recurrencia", partners: "Partners" }[d.objective as "attendance" | "repeat" | "partners"]} · Borrador</li>)}</ul>}
        {permits(club.permissions, "matchplan", "edit") ? <form action={createMatchDraft}>
          <input type="hidden" name="clubId" value={club.clubId} />
          <label>Rival<input name="opponent" required maxLength={120} /></label>
          <label>Fecha del partido<input name="matchDate" type="date" required /></label>
          <label>Objetivo<select name="objective" defaultValue="attendance"><option value="attendance">Aumentar asistencia</option><option value="repeat">Mejorar recurrencia</option><option value="partners">Activar partners</option></select></label>
          <button type="submit">Guardar nuevo borrador</button>
        </form> : <p>Tu acceso a los planes de partido es de solo lectura.</p>}
        <p>En esta primera versión los borradores no se editan ni se eliminan. Las tareas, piezas y conexiones operativas llegarán en los siguientes pasos.</p>
      </>}
    </section>)}
    <form action={signOut}><button type="submit">Cerrar sesión</button></form>
    <p><Link href="/club-demo/operations">Abrir la demo pública con datos de prueba</Link></p>
  </main>;
}
