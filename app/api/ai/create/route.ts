import { NextResponse } from "next/server";
import {
  AIConfigError,
  getAIProvider,
  type ChatMessage,
} from "@/lib/ai/provider";

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

const CONVERT_SYSTEM_PROMPT = `You are an expert code converter. Convert the provided web app to the requested language, preserving behavior, layout and controls as closely as practical.

Rules:
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
    guidance:
      "Output a single complete app.js: vanilla ES2024, no bundlers or dependencies. Build any UI with template strings and document APIs so it runs when included via a <script> tag.",
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

async function runChat(
  messages: ChatMessage[],
  temperature: number
): Promise<string> {
  const provider = getAIProvider();
  return provider.chat(messages, { temperature });
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

  const raw = await runChat(
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

  return NextResponse.json({
    file: { name: "index.html", language: "html", code },
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
  const raw = await runChat(
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
    file: { name: fileName, language: target, code },
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
