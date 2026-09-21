"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function isActive(pathname: string, href: string) {
  if (href === "/today") return pathname === "/" || pathname.startsWith("/today") || pathname.startsWith("/this-week");
  return pathname.startsWith(href);
}

export function NavTabs() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const es = lang === "es";

  const primary = [
    ["/today", es ? "Hoy" : "Today"],
    ["/calendar", es ? "Calendario" : "Calendar"],
    ["/territories", es ? "Territorios" : "Territories"],
    ["/experience", es ? "Experiencia del aficionado" : "Fan Experience"]
  ] as const;

  const operations = [
    ["/access", es ? "Acceso al partido" : "Matchday Access"],
    ["/measurement", es ? "Medición" : "Measurement"],
    ["/partners", es ? "Alianzas" : "Partnerships"],
    ["/sources", es ? "Datos y fuentes" : "Data & Sources"]
  ] as const;

  return (
    <header className="labHeader">
      <div className="labTopline">
        <Link className="brand brandLink" href="/today">
          LCL / FAN OPPORTUNITY ENGINE
        </Link>
        <span className="prototypeMark">
          {es ? "Prototipo independiente" : "Independent prototype"}
        </span>
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
            href="/method"
            className={pathname.startsWith("/method") ? "secondaryLink active" : "secondaryLink"}
            aria-current={pathname.startsWith("/method") ? "page" : undefined}
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
