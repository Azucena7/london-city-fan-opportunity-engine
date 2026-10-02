import { NextResponse } from "next/server";
import { currentSupabaseUser, supabaseConfigured, supabaseRequest } from "@/lib/supabaseServer";

type DraftType = "crm-email" | "vertical-video";

type DraftRequest = {
  type?: DraftType;
  objective?: string;
  audience?: string;
  proposition?: string;
  clubId?: string;
};

const draftCredits: Record<DraftType, number> = {
  "crm-email": 5,
  "vertical-video": 10
};

function isDraftType(value: unknown): value is DraftType {
  return value === "crm-email" || value === "vertical-video";
}

function safeText(value: unknown, max = 1800) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function extractJson(value: string) {
  const trimmed = value.trim().replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/i, "");
  return JSON.parse(trimmed) as Record<string, unknown>;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as DraftRequest | null;
  const type = body?.type;

  if (!isDraftType(type)) {
    return NextResponse.json({ error: "Unsupported draft type." }, { status: 400 });
  }

  const objective = safeText(body?.objective);
  const audience = safeText(body?.audience);
  const proposition = safeText(body?.proposition);
  const clubId = safeText(body?.clubId, 80);

  if (!objective || !audience || !proposition) {
    return NextResponse.json({ error: "Campaign objective, audience and proposition are required." }, { status: 400 });
  }

  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!gatewayToken) {
    return NextResponse.json(
      {
        error: "AI generation is not configured yet.",
        configured: false,
        requiredEnvironment: "AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN"
      },
      { status: 503 }
    );
  }

  let clubContext: {
    connectedChannels: string[];
    priorityObjectives: string[];
    tone?: string;
    mustAvoid?: string;
  } | null = null;

  if (clubId && supabaseConfigured()) {
    const user = await currentSupabaseUser();
    if (user) {
      const setupResponse = await supabaseRequest(
        `/rest/v1/club_setup?club_id=eq.${encodeURIComponent(clubId)}&select=connected_channels,priority_objectives,brand_rules&limit=1`
      );
      if (setupResponse.ok) {
        const rows = await setupResponse.json() as Array<{
          connected_channels?: string[];
          priority_objectives?: string[];
          brand_rules?: { tone?: string; mustAvoid?: string };
        }>;
        const setup = rows[0];
        if (setup) {
          clubContext = {
            connectedChannels: setup.connected_channels ?? [],
            priorityObjectives: setup.priority_objectives ?? [],
            tone: setup.brand_rules?.tone,
            mustAvoid: setup.brand_rules?.mustAvoid
          };
        }
      }
    }
  }

  const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-5.6-sol";
  const requestedShape = type === "crm-email"
    ? {
        subject: "Email subject line",
        preheader: "Short preheader",
        body: "Approval-ready email body in plain text",
        cta: "Primary CTA label"
      }
    : {
        hook: "Opening hook for a vertical video",
        script: "30-45 second spoken script",
        shotList: ["Shot 1", "Shot 2", "Shot 3"],
        caption: "Platform-ready caption"
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
          content: "You create concise approval-ready fan marketing drafts for professional football clubs. Never invent ticket prices, promotions, dates, benefits or claims that were not supplied. Return valid JSON only, with exactly the requested keys."
        },
        {
          role: "user",
          content: JSON.stringify({
            task: type,
            campaign: { objective, audience, proposition },
            clubContext,
            output: requestedShape,
            constraints: [
              "Use British English.",
              clubContext?.tone
                ? `Follow this club tone: ${clubContext.tone}`
                : "Keep the tone credible, energetic and club-appropriate.",
              clubContext?.mustAvoid
                ? `Respect this club must-avoid rule: ${clubContext.mustAvoid}`
                : "Avoid unsupported urgency, invented scarcity and unverified claims.",
              clubContext?.priorityObjectives.length
                ? `Keep the club priorities in view without inventing outcomes: ${clubContext.priorityObjectives.join(", ")}`
                : "Keep the copy focused on the supplied campaign objective.",
              "Do not claim scarcity, discounts, player appearances or benefits unless stated in the proposition.",
              "Write for human review before publication."
            ]
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
    return NextResponse.json(
      { error: payload?.error?.message || "The AI provider could not generate this draft." },
      { status: 502 }
    );
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "The AI provider returned an empty draft." }, { status: 502 });
  }

  try {
    const draft = extractJson(content);
    return NextResponse.json({
      draft,
      type,
      creditsCommitted: draftCredits[type],
      model,
      persistence: "device-workspace"
    });
  } catch {
    return NextResponse.json({ error: "The generated draft could not be parsed safely." }, { status: 502 });
  }
}
