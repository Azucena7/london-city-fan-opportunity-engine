import type { Metadata } from "next";
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
import "./travel-delta.css";
import "./territory-travel.css";
import "./block14.css";
import "./block15.css";
import "./block16.css";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "London City Fan Opportunity Lab",
  description:
    "A practical audience-growth and matchday decision engine for London City Lionesses."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
