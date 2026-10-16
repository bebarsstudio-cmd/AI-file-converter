import { NextResponse } from "next/server";
import {
  AIConfigError,
  getAIProvider,
  type ChatMessage,
} from "@/lib/ai/provider";
import type { ChatResult } from "@/lib/ai/openai";

/**
 * App creation endpoint (server-side — AI_API_KEY never reaches the browser).
 *
 *   POST { mode: "generate", idea: string }
 *     → { file: { name, language, code } }
 *
 *   POST { mode: "convert", target: "C++"|"Java"|"JavaScript"|"TypeScript",
 *          source: { name, language, code } }
 *     → { file: { name, language, code } }
 *
 * The source may be in ANY language or format. In "JavaScript" mode every
 * input — HTML, CSS, or any other language — is converted into one runnable
 * JS file.
 *
 * NOTE: unauthenticated for now — add auth + quota checks before deploying.
 */

const TARGET_LANGUAGES = ["C++", "Java", "JavaScript", "TypeScript"] as const;
type TargetLanguage = (typeof TARGET_LANGUAGES)[number];

const GENERATE_SYSTEM_PROMPT = `You are an expert web developer. Build complete, polished single-file web apps from short descriptions.

Rules:
- Return ONE file: a complete index.html with inline <style> and <script> tags. No frameworks, no CDNs, no external assets — use emoji, CSS or inline SVG for visuals.
- It must run correctly the moment it is opened in a browser, with no console errors.
- Clean modern design: dark background, generous spacing, subtle borders; use purple-to-blue gradients for accents unless the idea suggests otherwise.
- Responsive: usable on phone-width viewports.
- Implement real interactions and a finished feel — not a wireframe.
- If the description is vague, make tasteful assumptions instead of asking questions.
- Respond with ONLY the HTML file contents. No markdown fences, no explanations.`;

const CONVERT_SYSTEM_PROMPT = `You are an expert code converter. Convert the provided source to the requested target language, preserving behavior, layout and controls as closely as practical.

Rules:
- The source may be in ANY language or format — HTML, CSS, JavaScript, TypeScript, Java, C++, Python, JSON, or a whole multi-file project. Never refuse and never ask questions; always produce the best possible conversion.
- Respond with ONLY the converted file's code. No markdown fences, no explanations, no extra files.
- Keep the code self-contained and runnable as-is.`;

const CONVERT_TARGETS: Record<
  TargetLanguage,
  { fileName: string; guidance: string }
> = {
  "C++": {
    fileName: "main.cpp",
    guidance:
      "Output a single complete main.cpp (C++17). If the app is visual or interactive, use SDL2 (assume it is installed) for windowing, rendering and input, reproducing the layout, controls and behavior as closely as practical. Otherwise a console program is fine. No dependencies beyond SDL2 and the C++ standard library.",
  },
  Java: {
    fileName: "Main.java",
    guidance:
      "Output a single complete Main.java (public class Main with public static void main). For visual or interactive apps use Java Swing/Java2D so it runs on a vanilla JDK. No external libraries.",
  },
  JavaScript: {
    fileName: "app.js",
    guidance: `Output a single complete app.js: vanilla ES2022+, no bundlers or dependencies, runs when included via a <script> tag or opened in a browser. ANY input becomes JavaScript here:
- HTML input → build the same UI from JS (DOM APIs and/or template strings), keeping every element, text, class and interaction working; inject the markup into the document when the script runs. Move inline <script> logic into the same file.
- CSS input → JS that injects the same styles at runtime (create a <style> element containing the CSS, or set styles via code) so the page looks identical once the script is included.
- HTML + CSS + JS project → merge all of it into one script: inject the HTML, inject the CSS, and re-implement the behavior.
- Any other language (Java, C++, Python…) → an idiomatic JavaScript equivalent of the same program, preserving inputs, outputs and behavior.
Never refuse and never ask questions — every source becomes working JavaScript.`,
  },
  TypeScript: {
    fileName: "app.ts",
    guidance:
      "Output a single complete app.ts: strict TypeScript targeting the DOM, no runtime dependencies, no bundler assumptions. Include explicit types for state and functions.",
  },
};

/** Removes markdown code fences a model may wrap its output in. */
function stripCodeFences(text: string): string {
  let out = text.trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```[^\n]*\n?/, "");
  }
  if (out.endsWith("```")) {
    out = out.replace(/\n?```\s*$/, "");
  }
  return out.trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

async function chatOnce(
  messages: ChatMessage[],
  temperature: number
): Promise<ChatResult> {
  const provider = getAIProvider();
  return provider.chat(messages, { temperature });
}

const CONTINUE_PROMPT =
  "You were cut off mid-output. Continue EXACTLY from the last character you produced. Output only the remaining content — no repetition, no commentary, no markdown fences.";

/**
 * Runs a chat completion and, when the model hits its output limit
 * (finish_reason "length"), asks it to continue where it stopped — up to
 * a few rounds — so long files come back complete instead of truncated.
 */
async function runChatFully(
  messages: ChatMessage[],
  temperature: number,
  maxRounds = 3
): Promise<{ content: string; truncated: boolean }> {
  const conversation: ChatMessage[] = [...messages];
  let content = "";
  let finishReason: string | null = null;

  for (let round = 0; round < maxRounds; round++) {
    const result = await chatOnce(conversation, temperature);
    content += result.content;
    finishReason = result.finishReason;
    if (finishReason !== "length") {
      return { content, truncated: false };
    }
    conversation.push({ role: "assistant", content: result.content });
    conversation.push({ role: "user", content: CONTINUE_PROMPT });
  }

  return { content, truncated: finishReason === "length" };
}

async function handleGenerate(
  payload: Record<string, unknown>
): Promise<NextResponse> {
  const idea = typeof payload.idea === "string" ? payload.idea.trim() : "";
  if (!idea) {
    return NextResponse.json(
      { error: "Describe the app you want to create." },
      { status: 400 }
    );
  }
  if (idea.length > 4000) {
    return NextResponse.json(
      { error: "The idea is too long — keep it under 4000 characters." },
      { status: 400 }
    );
  }

  const { content: raw, truncated } = await runChatFully(
    [
      { role: "system", content: GENERATE_SYSTEM_PROMPT },
      { role: "user", content: `Create this app: ${idea}` },
    ],
    0.6
  );

  const code = stripCodeFences(raw);
  if (!/<(html|body)[\s>]/i.test(code)) {
    return NextResponse.json(
      {
        error:
          "The AI didn't return a valid HTML app. Try again, or rephrase the idea.",
      },
      { status: 502 }
    );
  }

  const looksComplete = /<\/(?:html|body)>\s*$/i.test(code);
  return NextResponse.json({
    file: {
      name: "index.html",
      language: "html",
      code,
      truncated: truncated || !looksComplete,
    },
  });
}

async function handleConvert(
  payload: Record<string, unknown>
): Promise<NextResponse> {
  const target = payload.target;
  if (
    typeof target !== "string" ||
    !TARGET_LANGUAGES.includes(target as TargetLanguage)
  ) {
    return NextResponse.json(
      { error: "target must be one of: C++, Java, JavaScript, TypeScript." },
      { status: 400 }
    );
  }

  const source = asRecord(payload.source);
  const sourceCode = typeof source?.code === "string" ? source.code : "";
  const sourceName = typeof source?.name === "string" ? source.name : "app";
  const instruction =
    typeof payload.instruction === "string" ? payload.instruction.trim() : "";
  if (!sourceCode) {
    return NextResponse.json(
      { error: "Provide the source code to convert." },
      { status: 400 }
    );
  }
  if (sourceCode.length > 200_000) {
    return NextResponse.json(
      { error: "The source is too large (max 200,000 characters)." },
      { status: 400 }
    );
  }

  const { fileName, guidance } = CONVERT_TARGETS[target as TargetLanguage];
  const { content: raw, truncated } = await runChatFully(
    [
      {
        role: "system",
        content: `${CONVERT_SYSTEM_PROMPT}\n\nTarget guidelines: ${guidance}`,
      },
      {
        role: "user",
        content: instruction
          ? `Convert this ${sourceName} to ${target}.\n\nAdditional instructions from the user:\n${instruction.slice(0, 4000)}\n\nSource:\n\n${sourceCode}`
          : `Convert this ${sourceName} to ${target}:\n\n${sourceCode}`,
      },
    ],
    0.2
  );

  const code = stripCodeFences(raw);
  if (!code) {
    return NextResponse.json(
      { error: "The AI returned an empty conversion. Try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    file: { name: fileName, language: target, code, truncated },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = asRecord(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Body must be a JSON object." },
      { status: 400 }
    );
  }

  try {
    if (payload.mode === "generate") return await handleGenerate(payload);
    if (payload.mode === "convert") return await handleConvert(payload);
    return NextResponse.json(
      { error: 'mode must be "generate" or "convert".' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: error instanceof AIConfigError ? 500 : 502 }
    );
  }
}
