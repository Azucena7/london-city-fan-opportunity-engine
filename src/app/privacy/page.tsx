import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import ed from "@/components/editorial.module.css";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What AVELA collects on this website, why, which providers process it and how to ask for it to be deleted."
};

// Every line here describes what the code does today (the pilot form, sign-in and analytics).
// When a new form, tracker or provider is added, this page changes in the same pull request.
const contact = process.env.PRIVACY_CONTACT_EMAIL?.trim();

const sections: Array<[string, string[]]> = [
  ["What we collect", [
    "Pilot request form: club, role, work email, an optional priority, your consent, and where the visit came from (campaign tags and the page the form was sent from).",
    "Sign-in to the workspace: your email address and the clubs you belong to or have asked to join.",
    "Website analytics: aggregated page views through Vercel Web Analytics, which does not use cookies.",
    "Your browser keeps the first campaign tag you arrived with (local storage), so a later pilot request can say where it started. It is never sent unless you submit the form."
  ]],
  ["What we never ask for", [
    "Supporter, ticket or order data. A club pilot uses only privacy-safe aggregates that the club prepares; individual supporter records stay in the club’s own systems."
  ]],
  ["Why we use it", [
    "To reply to your pilot request and arrange a conversation, on the basis of the consent you give in the form.",
    "To let approved club users sign in to the workspace and keep each club’s data visible only to its members."
  ]],
  ["Who processes it for us", [
    "Vercel (hosting and analytics), Supabase (database and sign-in), Resend (the email that tells the team a request arrived) and Cloudflare Turnstile (a bot check on the form, when enabled).",
    "We do not sell your details or share them for advertising."
  ]],
  ["How long we keep it", [
    "Pilot requests are kept while the conversation about a pilot is active and deleted when you ask. Workspace accounts are kept while you have access to a club."
  ]],
  ["Your rights", [
    "You can ask to see, correct or delete your details, or withdraw your consent, at any time. You can also complain to your data protection authority (for example the ICO in the UK)."
  ]]
];

export default function PrivacyPage() {
  return (
    <main className={ed.surface} data-editorial>
      <MarketingNav variant="board" />
      <header className={styles.header}>
        <p className={ed.tileMeta}>Privacy</p>
        <h1>What this website collects, and why.</h1>
      </header>
      <div className={styles.body}>
        {sections.map(([title, lines]) => (
          <section key={title} aria-labelledby={`privacy-${title}`}>
            <h2 id={`privacy-${title}`}>{title}</h2>
            {lines.map((line) => <p key={line}>{line}</p>)}
          </section>
        ))}
        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact">Contact</h2>
          {contact
            ? <p>Write to <a href={`mailto:${contact}`}>{contact}</a> for any privacy request.</p>
            : <p>Send any privacy request through the <Link href="/for-clubs#demo">pilot request form</Link>, saying what you would like us to do.</p>}
        </section>
      </div>
      <MarketingFooter />
    </main>
  );
}
