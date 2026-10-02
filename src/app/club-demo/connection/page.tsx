import type { Metadata } from "next";
import Link from "next/link";
import { getClubConnectionHealth } from "@/lib/clubConnectionHealth";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Conexión del espacio privado", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const messages = {
  missing_configuration: "Falta la configuración de Supabase en este despliegue.",
  invalid_configuration: "La configuración no cumple los requisitos de esta comprobación. Revisar URL y clave pública en Vercel.",
  available: "El servicio de autenticación de Supabase responde correctamente.",
  credentials_rejected: "Supabase rechaza la credencial configurada. Revisar la clave pública en Vercel.",
  unavailable: "No se ha podido confirmar la disponibilidad de Supabase. Revisar el proyecto y volver a comprobar.",
};

export default async function ConnectionPage() {
  const health = await getClubConnectionHealth();
  return <main id="main-content" className={styles.shell}>
    <Link href="/club-demo/operations">← Volver a la demo del club</Link>
    <p className={styles.eyebrow}>Preparación del espacio privado</p>
    <h1>Estado de la conexión</h1>
    <p>Comprobación desde el servidor de este despliegue. Se actualiza como máximo una vez por minuto.</p>
    <section className={styles.card} aria-labelledby="auth-health">
      <h2 id="auth-health">Autenticación · {health.authService === "available" ? "Servicio disponible" : "Revisión pendiente"}</h2>
      <p>{messages[health.authService]}</p>
      <p>Esta comprobación no consulta registros de clientes ni muestra claves.</p>
    </section>
    <section className={styles.card} aria-labelledby="workspace-readiness">
      <h2 id="workspace-readiness">Acceso privado · Pendiente de activar</h2>
      <p>La demo sigue utilizando datos de prueba y roles simulados.</p>
      <ul>
        <li>Inicio de sesión por invitación: pendiente.</li>
        <li>Permisos y aislamiento entre clubes: sin verificar.</li>
        <li>Guardado de planes y registro de auditoría: sin verificar.</li>
      </ul>
    </section>
  </main>;
}
