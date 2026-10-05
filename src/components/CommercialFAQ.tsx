import styles from "./CommercialFAQ.module.css";

const groups = [
  {
    title: "Product",
    items: [
      ["What exactly is AVELA?", "AVELA is a decision-intelligence layer for football clubs. It combines external signals and internal club context to identify what needs attention, recommend what to do next and assess whether the organisation can realistically execute it."],
      ["Is AVELA another dashboard?", "No. Dashboards organise and display information. AVELA uses evidence from multiple systems to prioritise decisions, explain why they matter and connect them to execution."],
      ["Is AVELA a project-management tool?", "No. Tasks can remain in Asana, Monday, Jira, Teams or another operational system. AVELA determines what work is worth doing, what depends on what, and whether the club can deliver it."]
    ]
  },
  {
    title: "AI",
    items: [
      ["Why can’t we just use ChatGPT, Claude or another LLM?", "You can use a general AI assistant to reason about a situation when you provide the right context. AVELA is designed to keep that context continuously structured across fixtures, contracts, players, sponsors, calendars, operational capacity and previous decisions. The LLM is part of AVELA; it is not the product."],
      ["Does AVELA make decisions without humans?", "AVELA can detect, prioritise and recommend automatically. Material club decisions remain subject to authorised human confirmation, with evidence, assumptions and unknowns visible."]
    ]
  },
  {
    title: "Existing stack",
    items: [
      ["Does AVELA replace Blinkfire or sponsorship analytics tools?", "No. Specialist platforms can remain the source for sponsorship, content, audience and media-performance intelligence. In the current public environment, AVELA can use public Blinkfire evidence as context; private club-specific Blinkfire measurement requires authorised club access. AVELA combines that evidence with contracts, player availability, fixtures, calendars and capacity to inform wider club decisions."],
      ["Does AVELA replace our CRM, ticketing or BI tools?", "No. Those systems remain systems of record. AVELA sits above them as a decision layer: what deserves attention, what should happen next, and whether the club can execute it."],
      ["Do we need to integrate everything before starting?", "No. AVELA can start with fixtures, public signals and a limited amount of club context. Additional sources improve confidence and operational intelligence over time."],
      ["What is actually connected today?", "The public AVELA environment uses its live public-signal sources and AVELA-owned web analytics where available. Club-private CRM, ticketing and Blinkfire data are not treated as connected unless the club authorises them. The Sources screen exposes operational, degraded, requires-access and not-configured states instead of collapsing them into one 'connected' label."]
    ]
  },
  {
    title: "Operations & governance",
    items: [
      ["Can AVELA understand player, sponsor and calendar constraints?", "Yes. The product model supports player availability, internal off-days, international duty, sponsor obligations, executive diaries, protocol requirements, approval gates and operational capacity."],
      ["Can AVELA explain why a recommendation changed?", "Yes. Recommendation changes should be traceable to material evidence such as a new signal, changed availability, deadline, blocker, contract context or capacity constraint."],
      ["Does AVELA send CRM messages, publish social posts or create external tasks automatically?", "Not by default. AVELA prepares and governs the decision, campaign and handoff. A human can confirm a routed work package, but it remains 'proposed' in AVELA until a real authorised adapter creates tasks in the external system. Publishing, sends and media spend remain in the club's execution tools unless a specific authorised connector is added."],
      ["Who can see sensitive club information?", "Access is role-based. Sensitive information such as contracts, internal availability, executive calendars or commercial terms can be restricted while still contributing to a decision at the appropriate permission level."]
    ]
  },
  {
    title: "Pilot",
    items: [
      ["What would a pilot look like?", "Start small: a limited set of fixtures, one or two priority workflows and agreed decision metrics. The aim is to prove decision value before expanding integrations."],
      ["Do we have to replace anything to run a pilot?", "No. AVELA is designed to work around the club’s existing stack, not require a rip-and-replace implementation."],
      ["How do we measure whether AVELA works?", "Not only campaign performance. Also decision speed, manual coordination reduced, signal-to-action time, execution delay, recommendation quality, missing-data resolution and learning reused in later decisions."]
    ]
  }
] as const;

export function CommercialFAQ() {
  return (
    <section className={styles.wrap} id="faq" aria-labelledby="faq-title">
      <div className={styles.intro}>
        <span>Questions clubs ask</span>
        <h2 id="faq-title">Where AVELA fits — and where it does not.</h2>
        <p>AVELA is designed to complement specialist tools and club expertise, not recreate them.</p>
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
