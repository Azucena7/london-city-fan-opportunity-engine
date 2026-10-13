"use client";

import { useEffect } from "react";
import { FIRST_TOUCH_KEY, externalCampaign, readFirstTouch, serialiseFirstTouch } from "@/lib/firstTouch";

/** Remembers the first external campaign a visitor arrived with, for lead attribution. */
export function FirstTouchRecorder() {
  useEffect(() => {
    const tags = externalCampaign(window.location.search);
    if (!tags) return;
    try {
      if (readFirstTouch(window.localStorage.getItem(FIRST_TOUCH_KEY))) return;
      window.localStorage.setItem(FIRST_TOUCH_KEY, serialiseFirstTouch(tags));
    } catch {
      // Storage can be unavailable (private mode, blocked site data); attribution then falls back to the page URL.
    }
  }, []);

  return null;
}
