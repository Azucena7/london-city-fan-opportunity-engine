import type { Metadata } from "next";
import "./globals.css";
import "./story.css";
import "./live.css";
import "./weather.css";
import "./fixture-auto.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
