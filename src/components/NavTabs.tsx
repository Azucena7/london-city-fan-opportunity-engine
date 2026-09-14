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
    ["/territories", es ? "Territorios" : "Territories"]
  ] as const;

  return (
    <header className="labHeader">
      <div className="labTopline">
        <Link className="brand brandLink" href="/today">
          LCL / FAN OPPORTUNITY LAB
        </Link>
        <span className="prototypeMark">
          {es ? "Prototipo independiente" : "Independent prototype"}
        </span>
      </div>

      <div className="navTabsRow">
        <nav className="tabs primaryTabs" aria-label={es ? "Navegación principal" : "Primary navigation"}>
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

        <div className="navSecondary">
          <Link
            href="/method"
            className={pathname.startsWith("/method") ? "secondaryLink active" : "secondaryLink"}
          >
            {es ? "Cómo funciona" : "How it works"}
          </Link>
          <Link
            href="/case-study"
            className={pathname.startsWith("/case-study") ? "secondaryLink active" : "secondaryLink"}
          >
            {es ? "Caso de estudio" : "Case study"}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
