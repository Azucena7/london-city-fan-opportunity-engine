"use client";

import { fetchClubSession } from "@/lib/clubSessionClient";
import { deliveryState, type DeliveryPackage, type DeliveryState } from "@/lib/deliveryState";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./DeliveredWorked.module.css";

type Delivery = DeliveryState | { state: "unavailable"; reason: string } | { state: "loading" };

/** Two separate answers: did the work happen (the club's tool says) and did it work (measurement says). */
export function DeliveredWorked({ fixtureId, worked, workedDetail, workedMeasured }: {
  fixtureId: string;
  worked: string;
  workedDetail: string;
  workedMeasured: boolean;
}) {
  const [delivery, setDelivery] = useState<Delivery>({ state: "loading" });

  useEffect(() => { void (async () => {
    try {
      const session = await (await fetchClubSession()).json() as { authenticated?: boolean; clubs?: Array<{ id: string }> };
      const clubId = session.authenticated ? session.clubs?.[0]?.id : undefined;
      if (!clubId) { setDelivery({ state: "unavailable", reason: "Sign in with a club account to read execution status from the club's work tool." }); return; }
      const response = await fetch(`/api/work-system/status?clubId=${encodeURIComponent(clubId)}&decisionId=${encodeURIComponent("fixture:" + fixtureId)}`, { cache: "no-store" });
      const result = await response.json() as { enabled?: boolean; packages?: DeliveryPackage[] };
      if (!response.ok || !result.enabled) { setDelivery({ state: "unavailable", reason: "Execution status is not available in this environment." }); return; }
      setDelivery(deliveryState(Array.isArray(result.packages) ? result.packages : []));
    } catch {
      setDelivery({ state: "unavailable", reason: "Execution status could not be loaded." });
    }
  })(); }, [fixtureId]);

  let headline = "Checking the work tool…";
  let detail = "";
  if (delivery.state === "unavailable") { headline = "Not available"; detail = delivery.reason; }
  else if (delivery.state === "not-sent") { headline = "Not sent to a work tool"; detail = "No approved work package for this fixture has been sent, so there is nothing to deliver yet."; }
  else if (delivery.state === "in-flight" || delivery.state === "delivered") {
    headline = `${delivery.done} of ${delivery.total} tasks done`;
    detail = (delivery.state === "delivered" ? "The club's tool reports all sent tasks done." : "Reported by the club's tool.") + (delivery.blocked ? ` ${delivery.blocked} blocked.` : "");
  }

  return (
    <section className={styles.wrap} aria-label="Delivered and worked">
      <article data-state={delivery.state}>
        <span>Delivered · operational</span>
        <strong>{headline}</strong>
        <p>{detail}</p>
        <Link href={`/app/matches/${fixtureId}#handoff-heading`}>Open the execution monitor →</Link>
      </article>
      <article data-state={workedMeasured ? "measured" : "pending"}>
        <span>Worked · business impact</span>
        <strong>{worked}</strong>
        <p>{workedDetail}</p>
      </article>
      <p className={styles.rule}>Delivered is not Worked: finished tasks do not prove the move changed demand, and a measured outcome does not prove the tasks caused it.</p>
    </section>
  );
}
