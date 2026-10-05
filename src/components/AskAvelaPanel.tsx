"use client";

import { useEffect, useState } from "react";
import styles from "./AskAvelaPanel.module.css";

type Club = { id: string; name: string; role: string };
type AskMode = "ask" | "tell" | "change";

type Reply = {
  intent: AskMode;
  answer: string;
  candidateContext?: {
    subject?: string;
    signal?: string;
    detail?: string;
    confidence?: "low" | "medium" | "high";
    validUntil?: string | null;
  } | null;
};

export function AskAvelaPanel({
  fixtureId,
  decisionId
}: {
  fixtureId: string;
  decisionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AskMode>("ask");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeClubId, setActiveClubId] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const result = await response.json() as { authenticated?: boolean; clubs?: Club[] };
      const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
      setClubs(nextClubs);
      if (result.authenticated && nextClubs.length) setActiveClubId(nextClubs[0].id);
    })();
  }, []);

  async function ask(nextMessage?: string, nextMode?: AskMode) {
    const value = (nextMessage ?? message).trim();
    const activeMode = nextMode ?? mode;
    if (!value || busy) return;
    setBusy(true);
    setStatus("");
    setReply(null);

    const response = await fetch("/api/ask-avela", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixtureId, message: value, clubId: activeClubId || undefined, mode: activeMode })
    });
    const result = await response.json() as Reply & { error?: string };
    if (response.ok) {
      setReply(result);
      setMessage("");
    } else {
      setStatus(result.error || "Ask AVELA could not respond.");
    }
    setBusy(false);
  }

  async function confirmContext() {
    if (!reply?.candidateContext || !activeClubId || saving) return;
    setSaving(true);
    setStatus("");
    const candidate = reply.candidateContext;
    const now = new Date().toISOString();
    const response = await fetch("/api/decision-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clubId: activeClubId,
        decisionId,
        subjectType: "fixture",
        subjectId: fixtureId,
        eventType: "context-added",
        sourceType: "user",
        eventKey: `${decisionId}:context:${now}`,
        state: "confirmed-internal-context",
        label: candidate.signal || "Internal context added",
        detail: candidate.detail || candidate.subject || "Club user added internal context.",
        metadata: {
          subject: candidate.subject,
          confidence: candidate.confidence,
          validUntil: candidate.validUntil
        }
      })
    });

    if (response.ok) {
      setStatus("Internal context added to the decision memory.");
      setReply((current) => current ? { ...current, candidateContext: null } : current);
    } else {
      setStatus("This context could not be saved.");
    }
    setSaving(false);
  }

  return (
    <>
      <button type="button" className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        ✦ Ask AVELA
      </button>

      {open ? (
        <aside className={styles.panel} aria-label="Ask AVELA">
          <div className={styles.head}>
            <div><span>Decision copilot</span><strong>Ask AVELA</strong></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask AVELA">×</button>
          </div>

          <div className={styles.modeBar} aria-label="Ask AVELA mode">
            {([
              ["ask", "? ASK"],
              ["tell", "+ TELL AVELA"],
              ["change", "✎ CHANGE"]
            ] as const).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={mode === value ? styles.activeMode : ""}
                onClick={() => { setMode(value); setReply(null); setStatus(""); }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.intro}>
            <p>
              {mode === "ask"
                ? "Ask about the current decision, blockers, timing, requests or operational capacity."
                : mode === "tell"
                  ? "Tell AVELA something the club knows internally. Nothing is added to club memory until you confirm it."
                  : "Explore a different scope, timing or approach. This does not change the official decision."}
            </p>
            <div className={styles.prompts}>
              {(mode === "ask"
                ? [
                    "Why are you recommending this?",
                    "Can we realistically do this?",
                    "Who needs to respond next?",
                    "What is blocking this?",
                    "What happens if we wait?",
                    "What changed recently?"
                  ]
                : mode === "change"
                  ? [
                      "Show me a simpler version.",
                      "What if we use fewer players?",
                      "What if we delay this?",
                      "What if we remove the highest-risk dependency?"
                    ]
                  : [
                      "A player is likely to be unavailable.",
                      "The sponsor asked us to move the activation.",
                      "The club has an internal off-day.",
                      "This was launched yesterday."
                    ]
              ).map((prompt) => <button type="button" key={prompt} onClick={() => void ask(prompt, mode)}>{prompt}</button>)}
            </div>
          </div>

          {reply ? (
            <div className={styles.reply}>
              <span className={styles.intent}>{reply.intent === "ask" ? "? ASK" : reply.intent === "tell" ? "+ TELL AVELA" : "✎ CHANGE"}</span>
              <p>{reply.answer}</p>

              {reply.candidateContext ? (
                <div className={styles.contextCard}>
                  <span>Internal context detected</span>
                  <strong>{reply.candidateContext.subject || "Current fixture"}</strong>
                  <p>{reply.candidateContext.detail}</p>
                  <div>
                    <small>Confidence · {reply.candidateContext.confidence ?? "medium"}</small>
                    {reply.candidateContext.validUntil ? <small>Valid until · {reply.candidateContext.validUntil}</small> : null}
                  </div>
                  {activeClubId ? (
                    <button type="button" disabled={saving} onClick={() => void confirmContext()}>{saving ? "Saving…" : "Add to AVELA memory"}</button>
                  ) : (
                    <small>Sign in to save internal context to the club memory.</small>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.composer}>
            {clubs.length > 1 ? (
              <select aria-label="Ask AVELA club context" value={activeClubId} onChange={(event) => setActiveClubId(event.target.value)}>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
              </select>
            ) : null}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                mode === "ask"
                  ? "e.g. I don't know what to do for this match…"
                  : mode === "tell"
                    ? "e.g. Smith is likely to be unavailable on Wednesday."
                    : "e.g. Give me a lower-complexity version with one player."
              }
              rows={3}
            />
            <button type="button" disabled={busy || !message.trim()} onClick={() => void ask()}>
              {busy ? "Thinking…" : mode === "ask" ? "Ask AVELA" : mode === "tell" ? "Review context" : "Explore change"}
            </button>
            {status ? <p className={styles.status}>{status}</p> : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
