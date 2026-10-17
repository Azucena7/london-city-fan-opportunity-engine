"use client";

import { fetchClubSession, invalidateClubSession } from "@/lib/clubSessionClient";
import { useEffect, useMemo, useState } from "react";
import styles from "./AccessCenter.module.css";

type Club = { id: string; name: string };
type Membership = { club_id: string; role: string };
type AccessRequest = {
  id: string;
  club_id: string;
  email: string;
  requested_role: string;
  note?: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  reviewed_at?: string | null;
};

const requestableRoles = [
  ["viewer", "Viewer"],
  ["marketing", "Marketing"],
  ["ticketing", "Ticketing"],
  ["business", "Commercial / business"],
  ["communications", "Communications"],
  ["compliance", "Compliance"],
  ["direction", "Leadership"]
] as const;

const approvalRoles = [...requestableRoles, ["admin", "Admin"]] as const;

// Clubs are not discoverable: a club admin shares an invitation link, and the requester opens it
// or pastes it. Any text holding a club id (the link or the bare id) is accepted.
const clubIdPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
function clubIdFrom(text: string) {
  return text.match(clubIdPattern)?.[0].toLowerCase() ?? "";
}

export function AccessCenter() {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AccessRequest[]>([]);
  const [invitation, setInvitation] = useState("");
  const [copiedClubId, setCopiedClubId] = useState("");
  const [origin, setOrigin] = useState("");
  const [requestedRole, setRequestedRole] = useState("marketing");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("Loading account state…");
  // The header status is the live region; the same text is repeated next to the card that
  // triggered it, where the person is looking.
  const [feedbackCard, setFeedbackCard] = useState<"sign-up" | "sign-in" | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh({ fresh = false }: { fresh?: boolean } = {}) {
    try {
    if (fresh) invalidateClubSession();
    const sessionResponse = await fetchClubSession();
    const session = await sessionResponse.json() as {
      configured?: boolean;
      authenticated?: boolean;
      user?: { email?: string | null };
    };
    setConfigured(Boolean(session.configured));
    setAuthenticated(Boolean(session.authenticated));

    if (!session.authenticated) {
      setClubs([]);
      setMemberships([]);
      setRequests([]);
      setPendingReviews([]);
      setMessage(session.configured ? "Create an account or sign in to request club access." : "Supabase is not configured.");
      return;
    }

    setEmail(session.user?.email ?? "");
    const response = await fetch("/api/access", { cache: "no-store" });
    const result = await response.json() as {
      clubs?: Club[];
      memberships?: Membership[];
      requests?: AccessRequest[];
      pendingReviews?: AccessRequest[];
      error?: string;
    };

    if (!response.ok) {
      setMessage(result.error || "Access state could not be loaded.");
      return;
    }

    const nextClubs = Array.isArray(result.clubs) ? result.clubs : [];
    setClubs(nextClubs);
    setMemberships(Array.isArray(result.memberships) ? result.memberships : []);
    setRequests(Array.isArray(result.requests) ? result.requests : []);
    setPendingReviews(Array.isArray(result.pendingReviews) ? result.pendingReviews : []);
    setMessage("Account state loaded.");
    } catch {
      setConfigured(true);
      setAuthenticated(false);
      setClubs([]);
      setMemberships([]);
      setRequests([]);
      setPendingReviews([]);
      setMessage("Account service is unreachable. Club access state could not be loaded.");
    }
  }

  useEffect(() => {
    const invited = new URLSearchParams(window.location.search).get("club");
    if (invited) setInvitation(invited);
    setOrigin(window.location.origin);
    void refresh();
  }, []);

  const activeMemberships = useMemo(() => new Set(memberships.map((membership) => membership.club_id)), [memberships]);
  const clubId = clubIdFrom(invitation);
  const alreadyMember = Boolean(clubId) && activeMemberships.has(clubId);
  const adminClubs = memberships.filter((membership) => membership.role === "admin");
  const clubName = (id: string) => clubs.find((club) => club.id === id)?.name ?? "Club";
  const hasMembership = memberships.length > 0;
  const hasPendingRequest = requests.some((request) => request.status === "pending");
  const authFeedback = feedbackCard === "sign-in" ? message : "";
  const signUpFeedback = feedbackCard === "sign-up" ? message : "";

  async function signUp() {
    setFeedbackCard("sign-up");
    setBusy(true);
    setMessage("Creating account…");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json() as { error?: string; next?: string };
      setMessage(response.ok ? result.next || "Check your email to confirm the account." : result.error || "Account could not be created.");
    } catch {
      setMessage("Account service is unreachable. No account was created.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn() {
    setFeedbackCard("sign-in");
    setBusy(true);
    setMessage("Signing in…");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(result.error || "Sign-in failed.");
        return;
      }
      setPassword("");
      await refresh({ fresh: true });
    } catch {
      setMessage("Sign-in service is unreachable. No session was created.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    setFeedbackCard("sign-in");
    if (!email.trim()) {
      setMessage("Enter your email above, then choose Forgot password.");
      return;
    }
    setBusy(true);
    setMessage("Sending reset link…");
    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json() as { error?: string; next?: string };
      setMessage(response.ok ? result.next || "If an account exists for that email, a reset link is on its way." : result.error || "The reset link could not be sent.");
    } catch {
      setMessage("Account service is unreachable. No reset email was sent.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage("Signing out…");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setMessage("Sign-out failed. Your current session may still be active.");
        return;
      }
      setPassword("");
      await refresh({ fresh: true });
    } catch {
      setMessage("Sign-out service is unreachable. Your current session may still be active.");
    } finally {
      setBusy(false);
    }
  }

  async function copyInvitation(id: string) {
    try {
      await navigator.clipboard.writeText(`${origin}/app/access?club=${id}`);
      setCopiedClubId(id);
      setMessage("Invitation link copied.");
    } catch {
      setMessage("The invitation link could not be copied. Select it and copy it manually.");
    }
  }

  async function requestAccess() {
    if (!clubId || alreadyMember) return;
    setBusy(true);
    setMessage("Sending access request…");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, requestedRole, note })
      });
      const result = await response.json() as { error?: string };
      setMessage(response.ok ? "Access request submitted for club review." : result.error || "Access request could not be sent.");
      if (response.ok) {
        setNote("");
        setInvitation("");
        await refresh({ fresh: true });
      }
    } catch {
      setMessage("Access service is unreachable. No access request was submitted.");
    } finally {
      setBusy(false);
    }
  }

  async function approveRequest(requestId: string, role: string) {
    setBusy(true);
    setMessage("Approving membership…");
    try {
      const response = await fetch("/api/access/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, role })
      });
      const result = await response.json() as { error?: string };
      setMessage(response.ok ? "Membership approved in the club access record." : result.error || "Request could not be approved.");
      if (response.ok) await refresh({ fresh: true });
    } catch {
      setMessage("Access service is unreachable. Membership was not approved.");
    } finally {
      setBusy(false);
    }
  }

  if (configured === null) {
    return (
      <section className={styles.loadingState} aria-live="polite">
        <span>Access & team</span>
        <strong>Checking account and club access…</strong>
        <p>Identity and membership are loaded separately so club data never flashes open before authorisation is known.</p>
      </section>
    );
  }

  if (configured === false) {
    return (
      <section className={styles.empty}>
        <span>Access & team</span>
        <h2>Club access is not available in this environment yet.</h2>
        <p>The decision workspace remains closed until identity and membership services are configured. No club data is exposed in the meantime.</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Access & team</span>
          <h2>Secure pilot access without opening the club workspace.</h2>
          <p>
            Users create and confirm their own account first. Club data remains inaccessible until an authorised club admin approves a membership.
          </p>
        </div>
        <div className={styles.state}>
          <span>Account state</span>
          <strong>{authenticated ? "Signed in" : "Not signed in"}</strong>
          <small role="status" aria-live="polite">{message}</small>
        </div>
      </header>

      <div className={styles.accessFlow} aria-label="Secure access flow">
        <div className={authenticated ? styles.flowDone : styles.flowCurrent}>
          <span>01</span><strong>Identity</strong><small>{authenticated ? "Confirmed account" : "Create or sign in"}</small>
        </div>
        <div className={hasMembership ? styles.flowDone : authenticated ? styles.flowCurrent : ""}>
          <span>02</span><strong>Club membership</strong><small>{hasMembership ? "Active membership" : hasPendingRequest ? "Awaiting club review" : "Requires club approval"}</small>
        </div>
        <div className={hasMembership ? styles.flowCurrent : ""}>
          <span>03</span><strong>Workspace</strong><small>{hasMembership ? "Club data available" : "Remains locked"}</small>
        </div>
      </div>

      {!authenticated ? (
        <div className={styles.authGrid}>
          <article>
            <span>New pilot user</span>
            <h2>Create account</h2>
            <label>Work email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="button" disabled={busy} aria-busy={busy} onClick={() => void signUp()}>Create account</button>
            {signUpFeedback ? <p className={styles.inlineStatus} aria-hidden="true">{signUpFeedback}</p> : null}
            <p>Email confirmation is required before the account can sign in. If the confirmation link opens a fallback page, return here afterwards and try Sign in — confirmation may already have completed.</p>
          </article>
          <article>
            <span>Existing user</span>
            <h2>Sign in</h2>
            <label>Work email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="button" disabled={busy} aria-busy={busy} onClick={() => void signIn()}>Sign in</button>
            <button type="button" className={styles.linkButton} disabled={busy} onClick={() => void requestPasswordReset()}>Forgot password?</button>
            {authFeedback ? <p className={styles.inlineStatus} aria-hidden="true">{authFeedback}</p> : null}
            <p>Signing in does not grant club access by itself.</p>
          </article>
        </div>
      ) : (
        <>
          {hasMembership ? (
            <div className={styles.accessSuccess}>
              <span>Workspace unlocked</span>
              <strong>You have an active club membership.</strong>
              <p>Authentication established identity; the membership now controls which club workspace and actions you can access.</p>
            </div>
          ) : null}

          <div className={styles.accountBar}>
            <div><span>Signed in as</span><strong>{email}</strong></div>
            <button type="button" aria-busy={busy} disabled={busy} onClick={() => void signOut()}>{busy ? "Working…" : "Sign out"}</button>
          </div>

          <div className={styles.grid}>
            <article>
              <span>01 · Memberships</span>
              <h2>Current club access</h2>
              {memberships.length ? (
                <div className={styles.rows}>
                  {memberships.map((membership) => (
                    <div key={membership.club_id}>
                      <strong>{clubName(membership.club_id)}</strong>
                      <small>{membership.role}</small>
                    </div>
                  ))}
                </div>
              ) : <p>No active club membership yet. Request access below to unlock an approved club workspace.</p>}
              {adminClubs.length ? (
                <div className={styles.invitations}>
                  <p>Clubs are not listed to other accounts. Share this link with a colleague so they can request access.</p>
                  {adminClubs.map((membership) => (
                    <div key={membership.club_id}>
                      <label>
                        Invitation link · {clubName(membership.club_id)}
                        <input readOnly value={`${origin}/app/access?club=${membership.club_id}`} onFocus={(event) => event.currentTarget.select()} />
                      </label>
                      <button type="button" onClick={() => void copyInvitation(membership.club_id)}>
                        {copiedClubId === membership.club_id ? "Copied" : "Copy link"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>

            <article>
              <span>02 · Request access</span>
              <h2>Ask the club to add you.</h2>
              <p>Clubs are not listed here. Open the invitation link a club admin sent you, or paste it below.</p>
              <label>
                Invitation link
                <input
                  value={invitation}
                  onChange={(event) => setInvitation(event.target.value)}
                  placeholder="https://…/app/access?club=…"
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={Boolean(invitation) && !clubId}
                  aria-describedby="invitation-state"
                />
              </label>
              <small id="invitation-state" className={styles.invitationState}>
                {!invitation ? "No invitation link yet." : !clubId ? "This is not a club invitation link." : alreadyMember ? "You are already a member of this club." : "Club invitation recognised."}
              </small>
              {clubId && !alreadyMember ? (
                <>
                  <label>Requested role<select value={requestedRole} onChange={(event) => setRequestedRole(event.target.value)}>{requestableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label>Context<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Role, team and why access is needed." /></label>
                  <button type="button" disabled={busy} aria-busy={busy} onClick={() => void requestAccess()}>Request access</button>
                </>
              ) : null}
            </article>

            <article>
              <span>03 · Request status</span>
              <h2>Your access requests</h2>
              {requests.length ? (
                <div className={styles.rows}>
                  {requests.map((request) => (
                    <div key={request.id}>
                      <strong>{clubName(request.club_id)}</strong>
                      <small>{request.requested_role} · {request.status}</small>
                    </div>
                  ))}
                </div>
              ) : <p>No access request has been submitted. When one is sent, its review state will appear here.</p>}
            </article>

            <article className={styles.admin}>
              <span>04 · Admin review</span>
              <h2>Pending club access</h2>
              {pendingReviews.length ? (
                <div className={styles.reviewList}>
                  {pendingReviews.map((request) => (
                    <div key={request.id}>
                      <div>
                        <strong>{request.email}</strong>
                        <small>{request.note || "No request context supplied."}</small>
                      </div>
                      <select defaultValue={request.requested_role} onChange={(event) => {
                        request.requested_role = event.target.value;
                      }}>
                        {approvalRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <button type="button" disabled={busy} aria-busy={busy} onClick={() => void approveRequest(request.id, request.requested_role)}>Approve</button>
                    </div>
                  ))}
                </div>
              ) : <p>No pending requests need action from this account.</p>}
            </article>
          </div>
        </>
      )}

      <div className={styles.guardrail}>
        <strong>Access rule</strong>
        <p>Authentication proves identity. Membership grants club access. AVELA never treats a successful sign-in as permission to read a club workspace.</p>
      </div>
    </section>
  );
}
