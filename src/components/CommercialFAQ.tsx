import styles from "./CommercialFAQ.module.css";

const groups = [
  {
    title: "Product",
    items: [
      ["What exactly is AVELA?", "AVELA is the opportunity engine for football club marketing and commercial teams. It connects external signals — such as weather, transport, city events, competing football and calendar moments — with club context to detect when attendance, timing, activation or commercial decisions should change."],
      ["Why is that different from a dashboard?", "A dashboard shows information you already chose to monitor. AVELA is designed to surface the external change that could alter the decision, explain why it matters and prepare the next move."],
      ["Why can’t we just use ChatGPT, Claude or another LLM?", "General AI can reason when the right context is supplied. AVELA's product value is the persistent signal network, club context, decision rules, rights, availability, history and workflow around each opportunity. The model is part of the engine, not the whole product."],
      ["Does AVELA make decisions without humans?", "No. AVELA can detect, prioritise and prepare a recommendation automatically, but material club decisions remain with authorised people. External context can change confidence or recommendation; it does not override rights, availability or approval gates."]
    ]
  },
  {
    title: "Signals & stack",
    items: [
      ["Does AVELA monitor weather, transport and other events?", "That is a core product direction. The intended engine combines relevant external context with club data, while showing source, freshness and confidence. Pilot and demo environments may use synthetic or reference data rather than live integrations."],
      ["What kinds of external signals matter?", "Examples include weather, transport disruption, city events, competing men's and women's football, broadcast windows, public and school holidays, international windows and other context that can materially change attendance, recurrence or activation timing."],
      ["Does AVELA replace Blinkfire, CRM, ticketing or BI tools?", "No. Those remain specialist systems and evidence sources. AVELA combines them with external context around the same decision."],
      ["Does AVELA replace Asana, Monday, ClickUp or another work-management tool?", "No. Once a decision is made, AVELA can prepare the work and readiness context while the club continues using its preferred execution tool."]
    ]
  },
  {
    title: "Pilot",
    items: [
      ["What would a pilot look like?", "Start with 4–6 fixtures, a defined set of external and club signals, and agreed decision metrics. The aim is to test whether AVELA spots useful pressure or opportunity earlier and whether the recommendation changes a real decision."],
      ["How do we measure whether AVELA works?", "Measure signal-to-decision time, useful opportunities identified, external risks caught early, recommendation quality, execution readiness and whether learning improves later fixture decisions — not just campaign performance."]
    ]
  }
] as const;

export function CommercialFAQ() {
  return (
    <section className={styles.wrap} id="faq" aria-labelledby="faq-title">
      <div className={styles.intro}>
        <span>Questions clubs ask</span>
        <h2 id="faq-title">What the engine does — and what it does not.</h2>
        <p>The essentials a marketing or commercial lead needs before deciding whether to test AVELA on real fixtures.</p>
      </div>
      <div className={styles.groups}>
        {groups.map((group) => (
          <section className={styles.group} key={group.title}>
            <h3>{group.title}</h3>
            <div>
              {group.items.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
