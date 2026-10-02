import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentClubIdentity } from "@/lib/clubSession";
import { areas, actions, profiles } from "@/lib/clubPermissions";
import { signOut } from "./sign-in/actions";
import styles from "./club.module.css";

export const metadata: Metadata = { title: "Tu espacio de trabajo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function ClubPage() {
  const identity = await currentClubIdentity();
  if (!identity) redirect("/club/sign-in");
  return <main id="main-content" className={styles.shell}>
    <p className={styles.eyebrow}>Espacio privado</p><h1>Tu espacio de trabajo</h1>
    <p>Tu perfil determina qué áreas puedes consultar y qué acciones puedes realizar.</p>
    {identity.memberships.map(club => <section key={club.clubId} className={styles.card}>
      <h2>{club.clubName}</h2><p>Permiso: {profiles[club.role].label}</p>
      <ul>{Object.entries(areas).filter(([area]) => club.permissions.some(p => p.area === area && p.action === "view")).map(([area, label]) => <li key={area}><strong>{label}</strong>: {club.permissions.filter(p => p.area === area).map(p => actions[p.action]).join(", ")}</li>)}</ul>
      <p>El acceso está comprobado. La persistencia de campañas y las conexiones operativas son la siguiente fase.</p>
    </section>)}
    <form action={signOut}><button type="submit">Cerrar sesión</button></form>
    <p><Link href="/club-demo/operations">Abrir la demo pública con datos de prueba</Link></p>
  </main>;
}
