import styles from "./CommercialFAQ.module.css";

const groups = [
  {
    title: "Product",
    items: [
      ["What exactly is AVELA?", "AVELA is the Opportunity Engine for football club marketing and commercial teams. It reads what is changing around each match — weather, city events, competing football, calendar moments — connects it with demand, rights and availability inside the club, and shows which decision it should change. The workspace is where the team then prepares and runs the move."],
      ["Why can’t we just use ChatGPT, Claude or another LLM?", "A general assistant only knows what someone remembers to paste in. AVELA watches a signal network around every fixture without being asked, and carries the club’s own context — demand, rights, partner obligations, availability, brand rules and the history of previous decisions and outcomes — into each read. That is what turns a signal into a move the club can actually deliver. The LLM is part of AVELA; it is not the product."],
      ["Does AVELA predict attendance?", "No. AVELA does not promise forecasts or a magic score. It detects which signal should change a decision and shows the evidence behind it, with what is known, assumed and missing kept apart. Outcomes are measured after the match, not claimed before it."],
      ["What does AVELA read today?", "In the public London City demonstration: weather forecasts, London events and competing football, the club’s calendar and public announcements, and public news. Road and rail disruption around the venue is checked daily from TfL. CRM and ticketing, partner data and live journey routing join in a club pilot — until then they are shown as not connected, never filled in."],
      ["Does AVELA make decisions without humans?", "AVELA can detect, prioritise and recommend automatically. Material club decisions remain subject to authorised human confirmation, with evidence, assumptions and unknowns visible."]
    ]
  },
  {
    title: "Existing stack",
    items: [
      ["Does AVELA replace Blinkfire, CRM, ticketing or BI tools?", "No. Specialist platforms remain systems of record or specialist intelligence sources. AVELA sits above them as the Opportunity Engine, combining performance, fan, sponsor, player, calendar and capacity context around the same decision."],
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
        <h2 id="faq-title">Where AVELA fits — and where it does not.</h2>
        <p>Questions clubs ask: the essentials a marketing or commercial lead needs before deciding whether to explore a pilot.</p>
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
