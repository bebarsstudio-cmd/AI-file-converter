import { NextResponse } from "next/server";
import {
  AIConfigError,
  getAIProvider,
  type ChatMessage,
} from "@/lib/ai/provider";
import {
  checkRateLimit,
  clampNumber,
  clientKey,
  numberFromEnv,
  readJsonBody,
  requireFirebaseUser,
  type GuardFailure,
} from "@/lib/api/guards";

/**
 * AI chat endpoint — runs server-side so AI_API_KEY never reaches the browser.
 *
 *   GET  /api/ai/chat  → provider status (no secrets)
 *   POST /api/ai/chat  → { messages: [{ role, content }] } → { content }
 *
 * Every POST passes the shared request guards before any AI work happens:
 * a per-IP rate limit, the optional sign-in check (AI_REQUIRE_AUTH=1), a
 * body-size cap, plus limits on the number and total length of messages.
 */

const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 100_000;

/** Turns a guard failure into the JSON error response the guards describe. */
function fail(failure: GuardFailure): NextResponse {
  return NextResponse.json({ error: failure.error }, { status: failure.status });
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as { role?: unknown; content?: unknown };
  return (
    (message.role === "system" ||
      message.role === "user" ||
      message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length > 0
  );
}

export async function GET() {
  try {
    const provider = getAIProvider();
    return NextResponse.json({
      ok: true,
      provider: provider.name,
      model: provider.model,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: error instanceof AIConfigError ? 500 : 502 }
    );
  }
}

export async function POST(request: Request) {
  const limited = checkRateLimit(`chat:${clientKey(request)}`, {
    limit: numberFromEnv("AI_RATE_LIMIT_PER_MINUTE", 30),
  });
  if (limited) return fail(limited);

  const auth = await requireFirebaseUser(request);
  if (!auth.ok) return fail(auth);

  const bodyResult = await readJsonBody(
    request,
    numberFromEnv("AI_MAX_BODY_KB", 1024) * 1024
  );
  if (!bodyResult.ok) return fail(bodyResult);

  const { messages, temperature, maxTokens } = (bodyResult.value ?? {}) as {
    messages?: unknown;
    temperature?: unknown;
    maxTokens?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Body must include a non-empty messages array." },
      { status: 400 }
    );
  }
  if (!messages.every(isChatMessage)) {
    return NextResponse.json(
      {
        error:
          "Each message needs a role (system|user|assistant) and non-empty string content.",
      },
      { status: 400 }
    );
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `Too many messages (max ${MAX_MESSAGES} per request).` },
      { status: 400 }
    );
  }
  const totalChars = messages.reduce(
    (sum, message) => sum + message.content.length,
    0
  );
  if (totalChars > MAX_TOTAL_CHARS) {
    return NextResponse.json(
      { error: "The conversation is too long (max 100,000 characters)." },
      { status: 400 }
    );
  }

  try {
    const provider = getAIProvider();
    const reply = await provider.chat(messages, {
      temperature: clampNumber(temperature, 0, 2),
      maxTokens: clampNumber(
        maxTokens,
        1,
        numberFromEnv("AI_MAX_OUTPUT_TOKENS", 4096)
      ),
    });
    return NextResponse.json({
      provider: provider.name,
      model: provider.model,
      content: reply.content,
      finishReason: reply.finishReason,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: error instanceof AIConfigError ? 500 : 502 }
    );
  }
}
