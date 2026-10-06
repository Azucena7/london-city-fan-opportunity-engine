import styles from "./CommercialFAQ.module.css";

const groups = [
  {
    title: "Product",
    items: [
      ["What exactly is AVELA?", "AVELA is the decision workspace for football club marketing and commercial teams. It connects signals and club context to prioritise what deserves attention, recommend what to do next and show whether the club can realistically deliver it."],
      ["Why can’t we just use ChatGPT, Claude or another LLM?", "General AI can help someone reason when the right context is supplied. AVELA keeps club context structured across campaigns, fixtures, players, sponsors, calendars, capacity and previous decisions, then carries that context into the next decision. The LLM is part of AVELA; it is not the product."],
      ["Does AVELA make decisions without humans?", "AVELA can detect, prioritise and recommend automatically. Material club decisions remain subject to authorised human confirmation, with evidence, assumptions and unknowns visible."]
    ]
  },
  {
    title: "Existing stack",
    items: [
      ["Does AVELA replace Blinkfire, CRM, ticketing or BI tools?", "No. Specialist platforms remain systems of record or specialist intelligence sources. AVELA sits above them as the decision workspace, combining performance, fan, sponsor, player, calendar and capacity context around the same decision."],
      ["Do we need to integrate everything before starting?", "No. AVELA can start with fixtures, campaigns, public signals and a limited amount of club-approved context. Additional sources improve confidence and operational intelligence over time."]
    ]
  },
  {
    title: "Pilot",
    items: [
      ["What would a pilot look like?", "Start with 4–6 fixtures or a bounded campaign window, one or two priority workflows and agreed decision metrics. The aim is to prove decision value before expanding integrations."],
      ["How do we measure whether AVELA works?", "Not only campaign performance. A pilot can also measure decision speed, manual coordination reduced, signal-to-action time, execution delay, recommendation quality, missing-data resolution and learning reused in later decisions."]
    ]
  }
] as const;

export function CommercialFAQ() {
  return (
    <section className={styles.wrap} id="faq" aria-labelledby="faq-title">
      <div className={styles.intro}>
        <span>Questions clubs ask</span>
        <h2 id="faq-title">Where AVELA fits — and where it does not.</h2>
        <p>The essentials a marketing or commercial lead needs before deciding whether to explore a pilot.</p>
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
