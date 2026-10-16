import { NextResponse } from "next/server";
import {
  AIConfigError,
  getAIProvider,
  type ChatMessage,
} from "@/lib/ai/provider";

/**
 * AI chat endpoint — runs server-side so AI_API_KEY never reaches the browser.
 *
 *   GET  /api/ai/chat  → provider status (no secrets)
 *   POST /api/ai/chat  → { messages: [{ role, content }] } → { content }
 *
 * NOTE: currently unauthenticated (local development). Add auth + quota
 * checks via the Firebase Admin SDK before deploying publicly.
 */

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, temperature, maxTokens } = (body ?? {}) as {
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

  try {
    const provider = getAIProvider();
    const content = await provider.chat(messages, {
      temperature: typeof temperature === "number" ? temperature : undefined,
      maxTokens: typeof maxTokens === "number" ? maxTokens : undefined,
    });
    return NextResponse.json({
      provider: provider.name,
      model: provider.model,
      content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: error instanceof AIConfigError ? 500 : 502 }
    );
  }
}
