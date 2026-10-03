"use client";

import { useState } from "react";
import styles from "./ExecutiveShareActions.module.css";

export function ExecutiveShareActions() {
  const [status, setStatus] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Link copied");
    } catch {
      setStatus("Copy unavailable — use the browser address bar");
    }
  }

  return (
    <div className={styles.actions} aria-label="Executive report sharing">
      <button type="button" onClick={() => void copyLink()}>Copy share link</button>
      <button type="button" onClick={() => window.print()}>Print / save PDF</button>
      <span aria-live="polite">{status}</span>
    </div>
  );
}
