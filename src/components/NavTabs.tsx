"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function isActive(pathname: string, href: string) {
  if (href === "/this-week") return pathname === "/" || pathname.startsWith("/this-week");
  return pathname.startsWith(href);
}

export function NavTabs() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const es = lang === "es";

  const primary = [
    ["/this-week", es ? "Esta semana" : "This Week"],
    ["/opportunities", es ? "Oportunidades" : "Opportunities"],
    ["/access", es ? "Acceso" : "Access"],
    ["/method", es ? "Método" : "Method"]
  ] as const;

  return (
    <header className="labHeader">
      <div className="labTopline">
        <Link className="brand brandLink" href="/this-week">
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
            href="/case-study"
            className={pathname.startsWith("/case-study") ? "secondaryLink active" : "secondaryLink"}
          >
            {es ? "Case study" : "Case study"}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
