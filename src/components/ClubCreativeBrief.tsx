import type { Action, Channel, Locale } from "@/lib/clubOperations";
import type { BrandKit, Campaign } from "@/lib/clubStrategy";
import type { CreativePackages } from "@/lib/clubCreativePackages";
import { findCreative } from "@/lib/clubCreativePackages";
import styles from "./ClubOperationsDemo.module.css";

export function ClubCreativeBrief({ action, lang, brand, campaign, packages, version, channel, onChannel }: {
  action: Action; lang: Locale; brand: BrandKit; campaign: Campaign; packages: CreativePackages; version: string; channel: Channel; onChannel: (channel: Channel) => void;
}) {
  const es = lang === "es";
  const tr = (a: string, b: string) => es ? a : b;
  const labels: Record<Channel, string> = { instagram: "Instagram", whatsapp: "WhatsApp", linkedin: "LinkedIn" };
  return <section className={styles.panel}>
    <h2>{tr("Briefing y paquetes por canal", "Brief and channel packages")}</h2>
    <p>{tr("Cada canal conserva su propio borrador durante esta sesión. Cambiar de canal o de acción no borra sus piezas. Recargar la página sí reinicia la demo.", "Each channel keeps its own draft during this session. Switching channels or actions does not erase assets. Reloading resets the demo.")}</p>
    <div className={styles.cards}>
      <article><h3>{tr("Marca del club · kit base", "Club brand · base kit")}</h3><p><strong>{brand.name}</strong> · v{brand.version}</p><p>{tr("Tono", "Tone")}: {brand.tone}. {tr("Tipografía", "Typeface")}: {brand.font}.</p></article>
      <article><h3>{tr("Campaña · briefing específico", "Campaign · specific brief")}</h3><p><strong>{campaign.name[lang]}</strong></p><p>{campaign.brief[lang]}</p><p>{tr("Titular propuesto", "Proposed headline")}: {campaign.headline[lang]}</p></article>
    </div>
    <nav className={styles.channelCards} aria-label={tr("Paquetes creativos por canal", "Creative channel packages")}>
      {(["instagram", "whatsapp", "linkedin"] as Channel[]).map(id => {
        const saved = findCreative(packages, action.id, id);
        return <button type="button" key={id} aria-pressed={id === channel} className={id === channel ? styles.primary : ""} onClick={() => onChannel(id)}><strong>{labels[id]}</strong><span>{!saved ? tr("Por preparar", "Not prepared") : saved.actionVersion !== version ? tr("Requiere regeneración", "Regeneration required") : saved.approvedVersion ? tr("Revisada en ensayo", "Reviewed in rehearsal") : tr("Borrador · por revisar", "Draft · awaiting review")}</span></button>;
      })}
    </nav>
    <details><summary>{tr("Qué podrás revisar y descargar", "What you can review and download")}</summary><ul><li>{tr("Texto editable para el canal seleccionado, generado mediante plantilla.", "Editable template-generated copy for the selected channel.")}</li><li>{tr("Composición gráfica SVG: no es una fotografía ni un diseño final aprobado del club.", "SVG graphic composition: not a photograph or an approved final club design.")}</li><li>{tr("Guion de producción: vídeo corto para Instagram; adaptación opcional para otros canales. No se renderiza vídeo.", "Production script: short Instagram video; optional adaptation for other channels. No video is rendered.")}</li></ul><p>{tr("La aprobación de una pieza no sustituye los derechos, permisos de contacto ni controles de lanzamiento.", "Asset approval does not replace rights, contact permission or delivery checks.")}</p></details>
  </section>;
}
