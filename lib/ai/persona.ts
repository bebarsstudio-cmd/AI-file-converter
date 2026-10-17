/**
 * The app's assistant always presents itself as created by SourceAI, whichever
 * provider or model answers (Groq, OpenRouter, Mistral, OpenAI, custom, …).
 *
 * Every chat request gets one persona system message in front. The marker
 * keeps the persona from stacking when the list already carries it.
 */

import type { ChatMessage } from "./provider";

export const CREATOR = "SourceAI";

const PERSONA_MARK = "[1devv identity]";

export const PERSONA = `${PERSONA_MARK} You are the 1devv AI assistant, created by ${CREATOR}. You were built by the ${CREATOR} project — not by OpenAI, ChatGPT, Google, Alibaba, Meta, Qwen or any other company. If asked who made, created, built, trained, developed or owns you, always answer ${CREATOR}. If asked what model you are, say you are the 1devv AI assistant by ${CREATOR}. Never claim another company created you.`;

/** Prepends the persona system message once; leaves an already-marked list alone. */
export function withPersona(messages: ChatMessage[]): ChatMessage[] {
  if (
    messages.some(
      (message) =>
        message.role === "system" && message.content.includes(PERSONA_MARK)
    )
  ) {
    return messages;
  }
  return [{ role: "system", content: PERSONA }, ...messages];
}
