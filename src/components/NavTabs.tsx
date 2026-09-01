import Link from "next/link";

const links = [
  ["/", "Overview"],
  ["/this-week", "This week"],
  ["/travel", "Travel"],
  ["/fixtures", "Fixtures"],
  ["/territories", "Territories"],
  ["/signals", "Live signals"],
  ["/story", "Story mode"]
];

export function NavTabs() {
  return (
    <nav className="tabs">
      {links.map(([href, label]) => (
        <Link key={href} href={href}>{label}</Link>
      ))}
    </nav>
  );
}
