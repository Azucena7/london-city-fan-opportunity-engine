import type { Metadata } from "next";
import Link from "next/link";
import { areas, actions, profiles, isRole, previewPermissions, permits, type ClubRole, type ClubArea, type ClubAction } from "@/lib/clubPermissions";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "Permisos del equipo del club", robots: { index: false, follow: false } };
export default async function PermissionsPage({ searchParams }: { searchParams: Promise<{ role?: string; readonly?: string }> }) {
  const query = await searchParams;
  const role: ClubRole = isRole(query.role) ? query.role : "marketing";
  const readonly = query.readonly === "on";
  const permissions = previewPermissions(role, readonly ? (Object.keys(areas) as ClubArea[]).flatMap(area => (Object.keys(actions) as ClubAction[]).filter(action => action !== "view").map(action => ({ area, action, allowed: false }))) : []);
  return <main id="main-content" className={styles.shell}>
    <Link href="/club-demo/operations">← Demo del club</Link>
    <p className={styles.eyebrow}>Equipo y permisos · Datos de prueba</p>
    <h1>Cada persona, su espacio de trabajo</h1>
    <p>Un club compartido. Cada departamento accede a sus áreas y cada persona recibe las acciones que necesita.</p>
    <form className={styles.card}>
      <label htmlFor="profile">Perfil del equipo</label>
      <select id="profile" name="role" defaultValue={role}>{Object.entries(profiles).map(([id, profile]) => <option key={id} value={id}>{profile.label}</option>)}</select>
      <label className={styles.check}><input type="checkbox" name="readonly" defaultChecked={readonly} /> Limitar esta persona a solo lectura</label>
      <button type="submit">Ver permisos</button>
    </form>
    <h2>{profiles[role].label}{readonly ? " · Solo lectura" : ""}</h2>
    <p>Los ajustes individuales pueden ampliar o restringir el perfil. Sin permiso para ver un área, ninguna acción está disponible.</p>
    <div className={styles.table} tabIndex={0} aria-label="Tabla de permisos, desplazable horizontalmente">
      <table><caption>Permisos orientativos del perfil seleccionado</caption><thead><tr><th scope="col">Área</th>{Object.values(actions).map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{(Object.entries(areas) as [ClubArea, string][]).map(([area, label]) => <tr key={area}><th scope="row">{label}</th>{(Object.keys(actions) as ClubAction[]).map(action => <td key={action}>{permits(permissions, area, action) ? "Permitido" : "Sin permiso"}</td>)}</tr>)}</tbody></table>
    </div>
    <section className={styles.card}><h2>Publicación y datos, con autorización específica</h2><p>Lanzar campañas y exportar datos necesitan un permiso individual explícito. Ningún perfil los incluye de partida.</p><p>Esta vista simula los perfiles. No modifica permisos ni concede acceso a datos reales. El acceso privado se verifica en el servidor y en la base de datos.</p><Link href="/club-demo/connection">Ver el estado del acceso privado →</Link></section>
  </main>;
}
