"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavTabs() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const es = lang === "es";

  const primary = [
    ["/live/london-city", es ? "Resumen del caso" : "Case overview"],
    ["/app", es ? "Inicio" : "Home"],
    ["/app/matches", es ? "Radar" : "Radar"],
    ["/app/campaigns", es ? "Campañas" : "Campaigns"],
    ["/app/learning", es ? "Aprendizaje" : "Learning"]
  ] as const;

  const operations = [
    ["/app/players", es ? "Activos de jugadoras" : "Player assets"],
    ["/app/season", es ? "Temporada" : "Season"],
    ["/app/sources", es ? "Datos y fuentes" : "Data & Sources"]
  ] as const;

  return (
    <header className="labHeader">
      <div className="labTopline">
        <Link className="brand brandLink" href="/live/london-city">
          LONDON CITY / CASE
        </Link>
        <div className="analystBridge">
          <span className="evidenceMark">
            {es ? "Entorno de evidencia" : "Evidence environment"}
          </span>
          <Link className="backToProduct" href="/app/matches">
            {es ? "← Volver al producto" : "← Back to product"}
          </Link>
        </div>
      </div>

      <div className="navTabsRow">
        <div className="productNavigation">
          <span className="navGroupLabel">{es ? "Producto" : "Product"}</span>
          <nav className="tabs primaryTabs" aria-label={es ? "Producto" : "Product"}>
            {primary.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={isActive(pathname, href) ? "active" : ""}
                aria-current={isActive(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="navSecondary" aria-label={es ? "Evaluación del producto" : "Product evaluation"}>
          <span className="navGroupLabel">{es ? "Evaluación" : "Evaluation"}</span>
          <Link
            href="/case-study/technical"
            className={pathname.startsWith("/case-study/technical") ? "secondaryLink active" : "secondaryLink"}
            aria-current={pathname.startsWith("/case-study/technical") ? "page" : undefined}
          >
            {es ? "Cómo funciona" : "How it works"}
          </Link>
          <Link
            href="/case-study"
            className={pathname.startsWith("/case-study") ? "secondaryLink active" : "secondaryLink"}
            aria-current={pathname.startsWith("/case-study") ? "page" : undefined}
          >
            {es ? "Caso de estudio" : "Case study"}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>

      <nav className="operationsNav" aria-label={es ? "Herramientas operativas" : "Operational tools"}>
        <span>{es ? "Operaciones" : "Operations"}</span>
        {operations.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={pathname.startsWith(href) ? "active" : ""}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
