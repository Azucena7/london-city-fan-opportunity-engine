import { NextResponse } from "next/server";
import { campaignPlans } from "@/lib/data";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

type AskIntent = "ask" | "tell" | "change";

function safeText(value: unknown, max = 2400) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeIntent(value: unknown): AskIntent | null {
  return value === "ask" || value === "tell" || value === "change" ? value : null;
}

function extractJson(value: string) {
  const trimmed = value.trim().replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/i, "");
  return JSON.parse(trimmed) as {
    intent?: AskIntent;
    answer?: string;
    candidateContext?: {
      subject?: string;
      signal?: string;
      detail?: string;
      confidence?: "low" | "medium" | "high";
      validUntil?: string | null;
    } | null;
  };
}

function capacityState(activeMinutes: number, availableMinutes: number) {
  if (availableMinutes <= 0) return { state: "unknown" as const, utilisation: null as number | null };
  const utilisation = Math.round((activeMinutes / availableMinutes) * 100);
  return {
    state: utilisation > 100 ? "overloaded" as const : utilisation >= 85 ? "tight" as const : "available" as const,
    utilisation
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    fixtureId?: string;
    message?: string;
    clubId?: string;
    mode?: AskIntent;
  } | null;

  const fixtureId = safeText(body?.fixtureId, 160);
  const message = safeText(body?.message);
  const clubId = safeText(body?.clubId, 80);
  const requestedIntent = safeIntent(body?.mode);
  if (!fixtureId || !message) return NextResponse.json({ error: "fixtureId and message are required." }, { status: 400 });

  const live = getCurrentProductOpportunity(fixtureId);
  if (!live) return NextResponse.json({ error: "Fixture context is unavailable." }, { status: 404 });

  const campaign = campaignPlans.campaigns.find((item) => item.fixtureId === fixtureId) ?? null;
  const clubContext = await getCurrentClubOperatingContext();
  const radar = buildOpportunityRadar([fixtureId], clubContext)[0] ?? null;
  let decisionHistory: Array<Record<string, unknown>> = [];
  let operationalRequests: Array<Record<string, unknown>> = [];
  let operationalCapacity = {
    state: "unknown" as "unknown" | "available" | "tight" | "overloaded",
    utilisation: null as number | null,
    activeMinutes: 0,
    availableMinutes: 0,
    blockedItems: 0
  };

  if (clubId && supabaseConfigured()) {
    const user = await currentSupabaseUser();
    if (user) {
      const from = live.updatedAt ?? new Date().toISOString();
      const to = live.fixture.date + "T23:59:59Z";
      const [history, workload, capacity, requests] = await Promise.all([
        supabaseRequest(
          `/rest/v1/decision_events?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(`fixture:${fixtureId}`)}&select=event_type,state,label,detail,source_type,created_at&order=created_at.desc&limit=40`
        ),
        supabaseRequest(
          `/rest/v1/workload_items?club_id=eq.${encodeURIComponent(clubId)}&state=not.in.(done,cancelled)&select=estimated_minutes,state,subject_label,title,due_at&limit=250`
        ),
        supabaseRequest(
          `/rest/v1/capacity_windows?club_id=eq.${encodeURIComponent(clubId)}&ends_at=gte.${encodeURIComponent(from)}&starts_at=lte.${encodeURIComponent(to)}&select=available_minutes,subject_label,starts_at,ends_at&limit=250`
        ),
        supabaseRequest(
          `/rest/v1/operational_requests?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(`fixture:${fixtureId}`)}&stage=in.(heads-up,formal-request)&select=request_type,stage,recipient_role,subject,due_at,updated_at&order=updated_at.asc&limit=50`
        )
      ]);

      if (history.ok) decisionHistory = await history.json() as Array<Record<string, unknown>>;
      if (requests.ok) operationalRequests = await requests.json() as Array<Record<string, unknown>>;

      if (workload.ok && capacity.ok) {
        const workloadRows = await workload.json() as Array<{ estimated_minutes?: number | null; state?: string | null }>;
        const capacityRows = await capacity.json() as Array<{ available_minutes?: number | null }>;
        const activeMinutes = workloadRows.reduce((sum, item) => sum + Math.max(0, item.estimated_minutes ?? 0), 0);
        const availableMinutes = capacityRows.reduce((sum, item) => sum + Math.max(0, item.available_minutes ?? 0), 0);
        const status = capacityState(activeMinutes, availableMinutes);
        operationalCapacity = {
          ...status,
          activeMinutes,
          availableMinutes,
          blockedItems: workloadRows.filter((item) => item.state === "blocked").length
        };
      }
    }
  }

  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!gatewayToken) {
    return NextResponse.json({ error: "Ask AVELA is not configured yet.", configured: false }, { status: 503 });
  }

  const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-5.6-sol";
  const context = {
    fixture: live.fixture,
    timing: { daysToFixture: live.daysToFixture, timingLabel: live.timingLabel },
    opportunity: live.opportunity,
    whyNow: live.whyNow,
    recommendation: live.recommendedAction,
    nextAction: live.nextAction,
    decisionState: live.decisionState,
    blocker: live.primaryBlocker,
    confidence: live.confidence,
    known: live.known,
    assumptions: live.assumptions,
    missing: live.missing,
    whatWouldChangeDecision: live.whatWouldChangeDecision,
    signals: live.liveSignals,
    radar: radar ? {
      state: radar.radarState,
      urgency: radar.urgency,
      opportunityScore: radar.opportunityScore,
      materialSignals: radar.materialSignalCount,
      recentMaterialSignals: radar.recentMaterialSignalCount
    } : null,
    campaign: campaign ? {
      title: campaign.title.en,
      objective: campaign.objective.en,
      activations: campaign.activations.map((item) => ({
        title: item.title.en,
        channel: item.channel,
        state: item.state,
        role: item.role.en
      })),
      schedule: campaign.schedule.map((item) => ({
        window: item.window,
        date: item.date,
        action: item.action.en,
        state: item.state
      })),
      approvals: campaign.approvals.map((item) => ({
        label: item.label.en,
        state: item.state
      })),
      nextApproval: campaign.nextApproval.en
    } : null,
    operationalCapacity,
    pendingOperationalRequests: operationalRequests,
    clubContext,
    decisionHistory
  };

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: [
            "You are Ask AVELA, a decision copilot for a professional women's football club.",
            "Answer only from the supplied AVELA context and the user's message. Never invent club facts, contract terms, results, availability, capacity or dates.",
            "Keep evidence, internal user information, inference and assumptions distinct.",
            "The UI can explicitly request one mode: ask, tell or change. Respect the requested mode when supplied.",
            "ASK answers a question without changing state.",
            "TELL AVELA extracts candidate internal context but does not claim it has been saved or applied.",
            "CHANGE explores a scenario or decision modification but does not claim the official decision has changed.",
            "For capacity questions, use operationalCapacity and say when it is unknown.",
            "For blocker or ownership questions, use pendingOperationalRequests, approvals and nextAction.",
            "For delay questions, use daysToFixture, schedule and approval deadlines; describe qualitative risk only unless a measured cost is supplied.",
            "When evidence is missing, say what is missing.",
            "Use concise British English.",
            "Return valid JSON only with exactly: intent, answer, candidateContext."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            requestedIntent,
            message,
            context,
            output: {
              intent: "ask | tell | change",
              answer: "Concise grounded answer",
              candidateContext: {
                subject: "Entity or decision this new information concerns",
                signal: "Short machine-readable signal label",
                detail: "Normalised statement of what the user supplied",
                confidence: "low | medium | high",
                validUntil: "ISO date if explicitly inferable, otherwise null"
              }
            }
          })
        }
      ]
    })
  });

  const payload = await response.json().catch(() => null) as {
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    return NextResponse.json({ error: payload?.error?.message || "Ask AVELA could not respond." }, { status: 502 });
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "Ask AVELA returned an empty response." }, { status: 502 });

  try {
    const result = extractJson(content);
    const intent = requestedIntent ?? (result.intent === "tell" || result.intent === "change" ? result.intent : "ask");
    return NextResponse.json({
      intent,
      answer: safeText(result.answer, 4000),
      candidateContext: intent === "tell" && result.candidateContext ? result.candidateContext : null,
      model
    });
  } catch {
    return NextResponse.json({ error: "Ask AVELA response could not be parsed safely." }, { status: 502 });
  }
}
