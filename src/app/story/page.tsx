import { NavTabs } from "@/components/NavTabs";
import { StorySteps } from "@/components/StorySteps";
import { ShareCard } from "@/components/ShareCard";
import { TerritoryMap } from "@/components/TerritoryMap";
import { territories } from "@/lib/data";

export default function StoryPage() {
  return (
    <main>
      <section className="subHero storyHero">
        <div className="brand">LCL / FAN OPPORTUNITY LAB</div>
        <NavTabs />
        <div className="eyebrow">STORY MODE</div>
        <h1 className="pageTitle">Alexia doesn’t fill stadiums. You do.</h1>
        <p className="lede">
          A practical experiment in turning star-driven attention into recurring
          matchday behaviour.
        </p>
      </section>

      <StorySteps />

      <TerritoryMap items={territories} />

      <ShareCard />

      <footer>
        <div>London City Fan Opportunity Lab</div>
        <div className="muted">Prototype — research-led, not an official club product.</div>
      </footer>
    </main>
  );
}
