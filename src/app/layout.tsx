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
import "./product-v2.css";
import "./experience.css";
import "./mobility.css";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://london-city-fan-opportunity-engine.vercel.app"),
  title: {
    default: "London City Fan Opportunity Lab",
    template: "%s | London City Fan Opportunity Lab"
  },
  description:
    "A practical audience-growth and matchday decision engine for London City Lionesses.",
  openGraph: {
    title: "London City Fan Opportunity Lab",
    description: "Turning fixtures, attendance and market context into clear marketing action.",
    url: "/today",
    siteName: "London City Fan Opportunity Lab",
    type: "website",
    images: [{
      url: "/linkedin-card",
      width: 1200,
      height: 630,
      alt: "London City Fan Opportunity Lab — from signals to decisions"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "London City Fan Opportunity Lab",
    description: "Turning fixtures, attendance and market context into clear marketing action.",
    images: ["/linkedin-card"]
  }
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
