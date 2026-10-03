import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./story.css";
import "./live.css";
import "./weather.css";
import "./fixture-auto.css";
import "./brand.css";
import "./journey.css";
import "./national.css";
import "./i18n.css";
import "./i18n-fixes.css";
import "./block14.css";
import "./block15.css";
import "./block16.css";
import "./product-v2.css";
import "./experience.css";
import "./ux-consolidation.css";
import "./navigation-v2.css";
import "./experience-internal.css";
import "./product-system.css";
import "./product-shell.css";
import "./readability.css";
import "./commercial-pilot.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL("https://london-city-fan-opportunity-engine.vercel.app"),
  title: {
    default: "AVELA · Growth Intelligence for Women’s Football",
    template: "%s | AVELA"
  },
  description:
    "Turn every fixture into a growth opportunity. Matchday intelligence for women’s football clubs.",
  openGraph: {
    title: "AVELA · Growth Intelligence for Women’s Football",
    description: "Every fixture is a growth opportunity.",
    url: "/",
    siteName: "AVELA",
    type: "website",
    images: [{
      url: "/linkedin-card",
      width: 1200,
      height: 630,
      alt: "AVELA — growth intelligence for women’s football"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AVELA · Growth Intelligence for Women’s Football",
    description: "Every fixture is a growth opportunity.",
    images: ["/linkedin-card"]
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get("lcl-language")?.value;
  const initialLang = savedLanguage === "es" ? "es" : "en";

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body>
        <a className="skipLink" href="#main-content">
          {initialLang === "es" ? "Saltar al contenido" : "Skip to content"}
        </a>
        <LanguageProvider initialLang={initialLang}>
          <div id="main-content" tabIndex={-1}>{children}</div>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
