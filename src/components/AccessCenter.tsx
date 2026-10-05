"use client";

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

export function AccessCenter() {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AccessRequest[]>([]);
  const [clubId, setClubId] = useState("");
  const [requestedRole, setRequestedRole] = useState("marketing");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("Loading account state…");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
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
    setClubId((current) => current || nextClubs[0]?.id || "");
    setMessage("Account state loaded.");
  }

  useEffect(() => {
    void refresh();
  }, []);

  const activeMemberships = useMemo(() => new Set(memberships.map((membership) => membership.club_id)), [memberships]);
  const availableClubs = clubs.filter((club) => !activeMemberships.has(club.id));
  const hasMembership = memberships.length > 0;
  const hasPendingRequest = requests.some((request) => request.status === "pending");

  async function signUp() {
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
      await refresh();
    } catch {
      setMessage("Sign-in service is unreachable. No session was created.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setPassword("");
    await refresh();
  }

  async function requestAccess() {
    if (!clubId) return;
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
        await refresh();
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
      if (response.ok) await refresh();
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
        <h1>Club accounts are not configured in this environment.</h1>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span>Access & team</span>
          <h1>Secure pilot access without opening the club workspace.</h1>
          <p>
            Users create and confirm their own account first. Club data remains inaccessible until an authorised club admin approves a membership.
          </p>
        </div>
        <div className={styles.state}>
          <span>Account state</span>
          <strong>{authenticated ? "Signed in" : "Not signed in"}</strong>
          <small>{message}</small>
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
            <button type="button" disabled={busy} onClick={() => void signUp()}>Create account</button>
            <p>Email confirmation is required before the account can sign in. If the confirmation link opens a fallback page, return here afterwards and try Sign in — confirmation may already have completed.</p>
          </article>
          <article>
            <span>Existing user</span>
            <h2>Sign in</h2>
            <label>Work email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="button" disabled={busy} onClick={() => void signIn()}>Sign in</button>
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
            <button type="button" onClick={() => void signOut()}>Sign out</button>
          </div>

          <div className={styles.grid}>
            <article>
              <span>01 · Memberships</span>
              <h2>Current club access</h2>
              {memberships.length ? (
                <div className={styles.rows}>
                  {memberships.map((membership) => (
                    <div key={membership.club_id}>
                      <strong>{clubs.find((club) => club.id === membership.club_id)?.name ?? "Club"}</strong>
                      <small>{membership.role}</small>
                    </div>
                  ))}
                </div>
              ) : <p>No active club membership yet.</p>}
            </article>

            <article>
              <span>02 · Request access</span>
              <h2>Ask the club to add you.</h2>
              {availableClubs.length ? (
                <>
                  <label>Club<select value={clubId} onChange={(event) => setClubId(event.target.value)}>{availableClubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label>
                  <label>Requested role<select value={requestedRole} onChange={(event) => setRequestedRole(event.target.value)}>{requestableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label>Context<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Role, team and why access is needed." /></label>
                  <button type="button" disabled={busy} onClick={() => void requestAccess()}>Request access</button>
                </>
              ) : <p>No additional clubs are available to request.</p>}
            </article>

            <article>
              <span>03 · Request status</span>
              <h2>Your access requests</h2>
              {requests.length ? (
                <div className={styles.rows}>
                  {requests.map((request) => (
                    <div key={request.id}>
                      <strong>{clubs.find((club) => club.id === request.club_id)?.name ?? "Club"}</strong>
                      <small>{request.requested_role} · {request.status}</small>
                    </div>
                  ))}
                </div>
              ) : <p>No access request has been submitted.</p>}
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
                      <button type="button" disabled={busy} onClick={() => void approveRequest(request.id, request.requested_role)}>Approve</button>
                    </div>
                  ))}
                </div>
              ) : <p>No pending requests visible to this account.</p>}
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
