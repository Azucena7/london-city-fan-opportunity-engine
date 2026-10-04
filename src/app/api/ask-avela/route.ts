import { NextResponse } from "next/server";
import { getCurrentProductOpportunity } from "@/lib/productOpportunity";
import { getCurrentClubOperatingContext } from "@/lib/clubOperatingContext";
import { buildOpportunityRadar } from "@/lib/opportunityRadar";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

function safeText(value: unknown, max = 2400) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function extractJson(value: string) {
  const trimmed = value.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(trimmed) as {
    intent?: "ask" | "tell" | "change";
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    fixtureId?: string;
    message?: string;
    clubId?: string;
  } | null;

  const fixtureId = safeText(body?.fixtureId, 160);
  const message = safeText(body?.message);
  const clubId = safeText(body?.clubId, 80);
  if (!fixtureId || !message) return NextResponse.json({ error: "fixtureId and message are required." }, { status: 400 });

  const live = getCurrentProductOpportunity(fixtureId);
  if (!live) return NextResponse.json({ error: "Fixture context is unavailable." }, { status: 404 });

  const clubContext = await getCurrentClubOperatingContext();
  const radar = buildOpportunityRadar([fixtureId], clubContext)[0] ?? null;
  let decisionHistory: Array<Record<string, unknown>> = [];

  if (clubId && supabaseConfigured()) {
    const user = await currentSupabaseUser();
    if (user) {
      const history = await supabaseRequest(
        `/rest/v1/decision_events?club_id=eq.${encodeURIComponent(clubId)}&decision_id=eq.${encodeURIComponent(`fixture:${fixtureId}`)}&select=event_type,state,label,detail,source_type,created_at&order=created_at.desc&limit=40`
      );
      if (history.ok) decisionHistory = await history.json() as Array<Record<string, unknown>>;
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
            "Answer only from the supplied AVELA context and the user's message. Never invent club facts, contract terms, results, availability or dates.",
            "Keep evidence, internal user information, inference and assumptions distinct.",
            "Classify the user's intent as ask, tell or change.",
            "If the user is asking a question, candidateContext must be null.",
            "If the user is adding potentially useful internal information, return it as candidateContext but do not claim it has been saved or applied.",
            "If the user is asking to change a decision, explain the likely consequence but do not claim the decision has changed.",
            "When evidence is missing, say what is missing.",
            "Use concise British English.",
            "Return valid JSON only with exactly: intent, answer, candidateContext."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
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
    return NextResponse.json({
      intent: result.intent === "tell" || result.intent === "change" ? result.intent : "ask",
      answer: safeText(result.answer, 4000),
      candidateContext: result.intent === "tell" && result.candidateContext ? result.candidateContext : null,
      model
    });
  } catch {
    return NextResponse.json({ error: "Ask AVELA response could not be parsed safely." }, { status: 502 });
  }
}
