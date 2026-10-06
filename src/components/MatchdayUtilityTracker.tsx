"use client";

import { useEffect } from "react";
import { emitMeasurementEvent } from "@/lib/measurement";

export function MatchdayUtilityTracker({ fixtureId }: { fixtureId: string }) {
  useEffect(() => {
    void emitMeasurementEvent({
      eventName: "matchday_utility_opened",
      fixtureId,
      locale: "en",
      properties: { surface: "matchday-companion" }
    });
  }, [fixtureId]);

  return null;
}

export function MatchdayOfficialDirectionsLink({
  fixtureId,
  href,
  children
}: {
  fixtureId: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        void emitMeasurementEvent({
          eventName: "matchday_official_directions_opened",
          fixtureId,
          locale: "en",
          properties: { surface: "matchday-companion" }
        });
      }}
    >
      {children}
    </a>
  );
}
