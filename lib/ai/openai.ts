import type { ChatMessage, ChatOptions } from "./provider";

/** The assistant's reply plus why the model stopped generating. */
export interface ChatResult {
  /** The assistant's reply text. */
  content: string;
  /** Provider finish reason, e.g. "stop" or "length" (cut off mid-output). */
  finishReason: string | null;
}

/** Thrown when a provider rejects a request because of a rate limit (HTTP 429). */
export class AIRateLimitError extends Error {
  /** Seconds the provider suggests waiting before retrying, when it says so. */
  readonly retryAfterSeconds: number | null;

  constructor(message: string, retryAfterSeconds: number | null) {
    super(message);
    this.name = "AIRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** A configured AI provider that can run chat completions. */
export interface AIProvider {
  /** Human-readable provider name, e.g. "Google Gemini (Google AI Studio)". */
  name: string;
  /** The model id requests are sent to. */
  model: string;
  /** Sends the conversation and returns the assistant's reply. */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>;
}

interface OpenAICompatibleConfig {
  label: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 180_000;

/**
 * Provider adapter for the OpenAI-compatible "chat completions" API.
 * Google Gemini, Groq, OpenRouter and Mistral all expose one, so a single
 * adapter covers every provider — swapping providers is a config change,
 * not a code change.
 */
export function createOpenAICompatibleProvider(
  config: OpenAICompatibleConfig
): AIProvider {
  const { label, apiKey, model } = config;
  const root = config.baseUrl.replace(/\/+$/, "");
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(`${root}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(init.headers as Record<string, string> | undefined),
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error(
          `${label} did not respond within ${Math.round(timeoutMs / 1000)}s. Wait a moment and retry.`
        );
      }
      throw new Error(
        `Could not reach ${label} (${root}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /** Best-effort model listing, used to make 404 "model not found" errors self-explanatory. */
  async function listModels(): Promise<string[] | null> {
    try {
      const res = await request("/models", { method: "GET" });
      if (!res.ok) return null;
      const data = await res.json();
      const ids = Array.isArray(data?.data)
        ? data.data
            .map((entry: { id?: unknown }) => entry?.id)
            .filter((id: unknown): id is string => typeof id === "string")
        : [];
      return ids.length ? ids : null;
    } catch {
      return null;
    }
  }

  return {
    name: label,
    model,

    async chat(messages, options) {
      const send = (maxTokens: number | undefined) =>
        request("/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages,
            ...(options?.temperature !== undefined
              ? { temperature: options.temperature }
              : {}),
            ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
          }),
        });

      let res = await send(options?.maxTokens);

      // Reads the error body into a readable one-line detail.
      const readError = async (): Promise<string> => {
        const raw = await res.text().catch(() => "");
        let detail = raw.slice(0, 300);
        try {
          const parsed = JSON.parse(raw);
          detail = parsed?.error?.message ?? parsed?.message ?? detail;
        } catch {
          // keep the raw text
        }
        return detail;
      };

      let detail = "";
      if (!res.ok) {
        detail = await readError();

        // Some models reject requests whose *expected* output tokens exceed
        // their per-minute output limit ("Limit 1000, Requested 2048") unless
        // an explicit max_tokens is set. Self-heal: retry once with a safe cap.
        const limitMatch =
          res.status === 429 ? /Limit (\d+), Requested \d+/i.exec(detail) : null;
        const enforcedLimit = limitMatch
          ? Number.parseInt(limitMatch[1], 10)
          : Number.NaN;
        if (Number.isFinite(enforcedLimit) && enforcedLimit > 0) {
          res = await send(Math.max(enforcedLimit - 50, 128));
          if (!res.ok) detail = await readError();
        }

        if (!res.ok && /Request too large/i.test(detail)) {
          throw new Error(`${label} rejected the request: ${detail}`);
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            `${label} rejected the API key (${res.status}). Check AI_API_KEY in .env.local.`
          );
        }
        if (res.status === 429) {
          // Providers tell us how long to wait — via a `retry-after` header,
          // an `x-ratelimit-reset-*` header, or inside the message itself
          // ("Please try again in 7.58s").
          const header =
            res.headers.get("retry-after") ??
            res.headers.get("x-ratelimit-reset-tokens");
          const fromHeader = header ? Number.parseFloat(header) : Number.NaN;
          const match = /try again in ([\d.]+)\s*s/i.exec(detail);
          const seconds = Number.isFinite(fromHeader)
            ? fromHeader
            : match
              ? Number.parseFloat(match[1])
              : Number.NaN;
          throw new AIRateLimitError(
            `${label} rate limit reached (free tier). Wait a moment and retry, or switch AI_PROVIDER.`,
            Number.isFinite(seconds) ? seconds : null
          );
        }
        if (res.status === 404) {
          const models = await listModels();
          const hint = models
            ? ` Available models: ${models.slice(0, 12).join(", ")}${models.length > 12 ? ", …" : ""}`
            : "";
          throw new Error(
            `${label} returned 404 for model "${model}". Set a valid AI_MODEL in .env.local.${hint}`
          );
        }
        throw new Error(`${label} request failed (${res.status}): ${detail}`);
      }

      const data = await res.json();
      const choice = data?.choices?.[0];
      const content = choice?.message?.content;
      if (typeof content !== "string" || content.length === 0) {
        throw new Error(
          `${label} returned an unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`
        );
      }
      return {
        content,
        finishReason:
          typeof choice?.finish_reason === "string" ? choice.finish_reason : null,
      };
    },
  };
}
