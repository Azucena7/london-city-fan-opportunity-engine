"use client";

import { useEffect } from "react";

// Workspace phases live inside collapsed <details>. Browsers do not reliably expand
// them for fragment navigation, so open every ancestor panel of the hash target.
export function PhaseAnchorOpener() {
  useEffect(() => {
    function openTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      let panel = target.closest("details");
      while (panel) {
        panel.open = true;
        panel = panel.parentElement?.closest("details") ?? null;
      }
      target.scrollIntoView({ block: "start" });
    }

    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, []);

  return null;
}
