"use client";

import { useEffect } from "react";

/**
 * Marks the rail link of the phase currently on screen with aria-current="location".
 * A phase inside a collapsed <details> has no box of its own, so the panel is measured instead.
 */
export function PhaseScrollSpy({ railLabel, phaseIds }: { railLabel: string; phaseIds: string[] }) {
  useEffect(() => {
    const rail = document.querySelector<HTMLElement>(`nav[aria-label="${railLabel}"]`);
    if (!rail) return;
    const links = new Map(phaseIds.map((id) => [id, rail.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)]));
    let frame = 0;

    function update() {
      frame = 0;
      const line = rail!.getBoundingClientRect().bottom + 16;
      let current: string | null = null;
      for (const id of phaseIds) {
        const target = document.getElementById(id);
        if (!target) continue;
        const box = (target.closest("details:not([open])") ?? target).getBoundingClientRect();
        if (box.top <= line) current = id;
      }
      for (const [id, link] of links) {
        if (!link) continue;
        if (id === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("toggle", schedule, true);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("toggle", schedule, true);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [railLabel, phaseIds]);

  return null;
}
