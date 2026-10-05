import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./intelligence-surfaces.css";
import "./case-brand.css";
import "./i18n.css";
import "./workspace-structure.css";
import "./case-study.css";
import "./case-study-technical.css";
import "./case-study-commercial.css";
import "./product-ux.css";
import "./navigation-v2.css";
import "./product-system.css";
import "./product-shell.css";
import "./readability.css";
import "./commercial-pilot.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL("https://avela-growth-intelligence.vercel.app"),
  title: {
    default: "AVELA · Decision Intelligence for Football Clubs",
    template: "%s | AVELA"
  },
  description:
    "Connect signals, club context and operational constraints to know what needs attention, what to do next and whether the club can deliver it.",
  openGraph: {
    title: "AVELA · Decision Intelligence for Football Clubs",
    description: "Read the signals. Move the club.",
    url: "/",
    siteName: "AVELA",
    type: "website",
    images: [{
      url: "/linkedin-card",
      width: 1200,
      height: 630,
      alt: "AVELA — decision intelligence for football clubs"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AVELA · Decision Intelligence for Football Clubs",
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
  const savedLanguage = cookieStore.get("avela-language")?.value ?? cookieStore.get("lcl-language")?.value;
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
