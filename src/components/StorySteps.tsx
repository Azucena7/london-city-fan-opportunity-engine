const steps = [
  {
    number: "01",
    label: "Problem",
    title: "Stars create attention. They do not automatically create habit.",
    text: "The commercial question is not how much attention a signing creates. It is where recurring attendance can realistically come from."
  },
  {
    number: "02",
    label: "Where",
    title: "Find family-rich territories connected to girls’ football.",
    text: "Families, grassroots nodes and matchday accessibility reveal areas that standard fanbase assumptions can miss."
  },
  {
    number: "03",
    label: "When",
    title: "Not every home match deserves the same acquisition budget.",
    text: "Calendar whitespace, opponent appeal and competing attention create radically different windows across the season."
  },
  {
    number: "04",
    label: "Action",
    title: "Turn the score into one specific play.",
    text: "Target territory, product, channel, message and KPI are selected for the fixture — not left as a dashboard interpretation exercise."
  },
  {
    number: "05",
    label: "Learn",
    title: "Replace assumptions with observed repeat behaviour.",
    text: "Postcode, scan, product, source and repeat-purchase data progressively turn the model from research-led to club-specific."
  }
];

export function StorySteps() {
  return (
    <div className="storySteps">
      {steps.map((s) => (
        <article className="storyStep" key={s.number}>
          <div className="storyNum">{s.number}</div>
          <div>
            <div className="eyebrow">{s.label}</div>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
