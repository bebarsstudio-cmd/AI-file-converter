/**
 * Modular AI provider layer.
 *
 * Every supported provider speaks the OpenAI-compatible "chat completions"
 * API — Groq, OpenRouter, Mistral and OpenAI all expose one — so adding a
 * provider is a preset (base URL + default model), not a new adapter.
 *
 * Configure via environment variables (server-side only — never expose the
 * key to the browser):
 *
 *   AI_PROVIDER  groq | openrouter | mistral | openai | custom
 *   AI_API_KEY   the provider's API key
 *   AI_MODEL     model id (optional — falls back to a per-provider default)
 *   AI_BASE_URL  only for AI_PROVIDER=custom (any OpenAI-compatible host)
 */

import { createOpenAICompatibleProvider, type AIProvider } from "./openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

export type { AIProvider };

interface ProviderPreset {
  label: string;
  baseUrl: string;
  defaultModel: string;
}

/**
 * Free-tier-first presets. Free keys:
 *   groq       → https://console.groq.com/keys        (fastest; ~1,000 req/day free)
 *   openrouter → https://openrouter.ai/keys           (:free models; 50 req/day until $10 credited)
 *   mistral    → https://console.mistral.ai            (Codestral; free plan credits)
 */
const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "qwen/qwen3.8-27b",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "",
  },
  mistral: {
    label: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "codestral-latest",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
  },
};

/** Thrown when the provider layer is misconfigured (missing key, bad name, …). */
export class AIConfigError extends Error {}

/** Builds the provider configured by the AI_* environment variables. */
export function getAIProvider(): AIProvider {
  const name = (process.env.AI_PROVIDER || "groq").trim().toLowerCase();
  const apiKey = (process.env.AI_API_KEY || "").trim();

  if (!apiKey) {
    throw new AIConfigError(
      "AI_API_KEY is not set. Add it to .env.local (free Groq key: https://console.groq.com/keys) and restart the dev server."
    );
  }

  if (name === "custom") {
    const baseUrl = (process.env.AI_BASE_URL || "").trim();
    const model = (process.env.AI_MODEL || "").trim();
    if (!baseUrl || !model) {
      throw new AIConfigError(
        "AI_PROVIDER=custom requires both AI_BASE_URL and AI_MODEL in .env.local."
      );
    }
    return createOpenAICompatibleProvider({
      label: "Custom provider",
      baseUrl,
      apiKey,
      model,
    });
  }

  const preset = PROVIDER_PRESETS[name];
  if (!preset) {
    throw new AIConfigError(
      `Unknown AI_PROVIDER "${name}". Supported: ${Object.keys(PROVIDER_PRESETS).join(", ")}, custom.`
    );
  }

  const model = (process.env.AI_MODEL || "").trim() || preset.defaultModel;
  if (!model) {
    throw new AIConfigError(
      `AI_MODEL is not set and the "${name}" preset has no default. Set AI_MODEL in .env.local.`
    );
  }

  return createOpenAICompatibleProvider({
    label: preset.label,
    baseUrl: preset.baseUrl,
    apiKey,
    model,
  });
}
