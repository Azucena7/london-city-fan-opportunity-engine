import type { Metadata } from "next";
import Link from "next/link";
import { clubAccessEnabled } from "@/lib/clubSession";
import { signIn } from "./actions";
import styles from "../club.module.css";

export const metadata: Metadata = { title: "Acceso del club", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const enabled = clubAccessEnabled();
  const status = (await searchParams).status;
  return <main id="main-content" className={styles.shell}>
    <Link href="/">AVELA</Link>
    <p className={styles.eyebrow}>Espacio privado del club</p>
    <h1>Accede a tu club</h1>
    <p>Para miembros invitados por el administrador. El club y tus permisos se comprueban en el servidor.</p>
    {!enabled ? <section className={styles.card} aria-labelledby="setup">
      <h2 id="setup">Acceso pendiente de configuración</h2>
      <p>Estamos preparando la conexión y los permisos del club. El inicio de sesión todavía no está habilitado.</p>
      <Link href="/club-demo/operations">Explorar la demo con datos de prueba →</Link>
      <p><Link href="/club-demo/connection">Consultar el estado de la conexión</Link></p>
    </section> : <form action={signIn} className={styles.card}>
      {status === "denied" && <p role="alert">No se ha podido autorizar el acceso. Comprueba tus credenciales y tu invitación, o contacta con el administrador del club.</p>}
      <label htmlFor="email">Correo de acceso</label>
      <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} />
      <button type="submit">Entrar en mi club</button>
      <p>La sesión dura como máximo una hora. Después tendrás que volver a entrar.</p>
    </form>}
  </main>;
}
