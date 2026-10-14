"use client";

import { invalidateClubSession } from "@/lib/clubSessionClient";
import { useEffect, useState } from "react";
import styles from "./PasswordResetForm.module.css";

type LinkState = { status: "checking" } | { status: "ready"; accessToken: string; expiresIn: number } | { status: "invalid"; reason: string };

// The Supabase recovery link lands here with the session in the URL fragment. The fragment is
// read once and removed from the address bar so the token is not left in history.
export function PasswordResetForm() {
  const [link, setLink] = useState<LinkState>({ status: "checking" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    const error = params.get("error_description");
    const accessToken = params.get("access_token");
    if (error) setLink({ status: "invalid", reason: error.replace(/\+/g, " ") });
    else if (accessToken && params.get("type") === "recovery") setLink({ status: "ready", accessToken, expiresIn: Number(params.get("expires_in")) || 3600 });
    else setLink({ status: "invalid", reason: "This page needs the reset link from your email." });
  }, []);

  async function submit() {
    if (link.status !== "ready" || busy) return;
    if (password.length < 10) return setMessage("Use a password of at least 10 characters.");
    if (password !== confirm) return setMessage("The two passwords do not match.");
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: link.accessToken, expiresIn: link.expiresIn, password })
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setMessage(result?.error || "The password could not be changed.");
        return;
      }
      setPassword("");
      setConfirm("");
      invalidateClubSession();
      setDone(true);
    } catch {
      setMessage("The account service is unreachable. Your password was not changed.");
    } finally {
      setBusy(false);
    }
  }

  if (link.status === "checking") return null;

  if (done) {
    return (
      <section className={styles.card} aria-label="Password changed">
        <span>Password changed</span>
        <h2>You are signed in with your new password.</h2>
        <p>Use it next time you sign in.</p>
        <a className={styles.primary} href="/app">Open the workspace →</a>
      </section>
    );
  }

  if (link.status === "invalid") {
    return (
      <section className={styles.card} aria-label="Reset link problem">
        <span>Reset link</span>
        <h2>This reset link cannot be used.</h2>
        <p>{link.reason} Request a new link from the sign-in page; each link works once and expires after a short time.</p>
        <a className={styles.primary} href="/app/access">Back to sign in →</a>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Choose a new password">
      <span>Reset password</span>
      <h2>Choose a new password</h2>
      <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label>Repeat new password<input type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
      <button type="button" className={styles.primary} disabled={busy} aria-busy={busy} onClick={() => void submit()}>
        {busy ? "Saving…" : "Save new password"}
      </button>
      <p>At least 10 characters.</p>
      {message ? <p className={styles.message} role="status" aria-live="polite">{message}</p> : null}
    </section>
  );
}
