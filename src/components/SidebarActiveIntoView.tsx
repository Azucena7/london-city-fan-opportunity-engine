"use client";

import { useEffect } from "react";

/**
 * On a short screen the desktop sidebar scrolls. When the current page is one of the lower
 * links (Help, Team, Setup…), bring it into view so the person sees where they are.
 */
export function SidebarActiveIntoView() {
  useEffect(() => {
    const sidebar = document.querySelector<HTMLElement>("aside[aria-label='AVELA club app navigation']");
    if (!sidebar || sidebar.scrollHeight <= sidebar.clientHeight) return;
    const active = sidebar.querySelector<HTMLElement>("[aria-current='page']");
    if (!active || active.offsetParent === null) return;
    const box = active.getBoundingClientRect();
    const frame = sidebar.getBoundingClientRect();
    // Scroll the sidebar alone (scrollIntoView could also move the page behind it).
    if (box.top < frame.top || box.bottom > frame.bottom) {
      sidebar.scrollTop += box.top - frame.top - (frame.height - box.height) / 2;
    }
  }, []);
  return null;
}
