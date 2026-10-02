import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentClubIdentity } from "@/lib/clubSession";
import { signOut } from "./sign-in/actions";
import styles from "./club.module.css";

export const metadata: Metadata = { title: "Mis clubes", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const roleNames = { admin: "Administración", operator: "Operaciones", approver: "Aprobación", viewer: "Solo lectura" };
export default async function ClubPage() {
  const identity = await currentClubIdentity();
  if (!identity) redirect("/club/sign-in");
  return <main id="main-content" className={styles.shell}>
    <p className={styles.eyebrow}>Espacio privado</p><h1>Mis clubes</h1>
    <p>Estos son los clubes a los que tienes acceso activo.</p>
    {identity.memberships.map(club => <section key={club.clubId} className={styles.card}>
      <h2>{club.clubName}</h2><p>Permiso: {roleNames[club.role]}</p>
      <p>El acceso está comprobado. La persistencia de campañas y las conexiones operativas son la siguiente fase.</p>
    </section>)}
    <form action={signOut}><button type="submit">Cerrar sesión</button></form>
    <p><Link href="/club-demo/operations">Abrir la demo pública con datos de prueba</Link></p>
  </main>;
}
