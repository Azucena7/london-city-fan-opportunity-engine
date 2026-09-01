import { territories } from "@/lib/data";
import { TerritoryCards } from "@/components/TerritoryCards";
import { NavTabs } from "@/components/NavTabs";

export default function TerritoriesPage() {
  return (
    <main>
      <section className="subHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">WHERE</div>
        <h1 className="pageTitle">Where are the next recurring households?</h1>
        <p className="lede">
          Priority is driven by families, girls’ football networks, matchday accessibility and competitive context.
        </p>
      </section>

      <TerritoryCards items={territories} />

      <section className="method">
        <div className="eyebrow">ACQUISITION UNIT</div>
        <h3>Sometimes the customer is not a family. It is an organisation.</h3>
        <p className="muted">
          One grassroots club can unlock dozens of girls, families and related spectators through a single relationship.
        </p>
      </section>
    </main>
  );
}
