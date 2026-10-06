import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./i18n.css";
import "./product-ux.css";
import "./product-system.css";
import "./readability.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL("https://avela-growth-intelligence.vercel.app"),
  title: {
    default: "AVELA · Decision Workspace for Football Club Marketing & Commercial Teams",
    template: "%s | AVELA"
  },
  description:
    "AVELA helps football club marketing and commercial teams decide what to do next across fixtures, campaigns and commercial moments.",
  openGraph: {
    title: "AVELA · Decision Workspace for Football Club Marketing & Commercial Teams",
    description: "Read the signals. Move the club.",
    url: "/",
    siteName: "AVELA",
    type: "website",
    images: [{
      url: "/linkedin-card",
      width: 1200,
      height: 630,
      alt: "AVELA — decision workspace for football club marketing and commercial teams"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "AVELA · Decision Workspace for Football Club Marketing & Commercial Teams",
    description: "Read the signals. Decide what to do next.",
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
