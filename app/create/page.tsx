"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";

const TARGETS = ["C++", "Java", "JavaScript", "TypeScript"];

const EXAMPLE_IDEAS = [
  "Pomodoro timer with tasks and session stats",
  "Snake game with keyboard controls and score",
  "Expense tracker with categories and monthly total",
  "Coffee shop landing page with menu and hours",
];

interface GeneratedFile {
  name: string;
  language: string;
  code: string;
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const ghostButton =
  "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white";

function ViewToggle({
  view,
  onChange,
}: {
  view: "preview" | "code";
  onChange: (view: "preview" | "code") => void;
}) {
  const toggleClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
      active ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
    }`;
  return (
    <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
      <button type="button" onClick={() => onChange("preview")} className={toggleClass(view === "preview")}>
        <Eye size={13} />
        Preview
      </button>
      <button type="button" onClick={() => onChange("code")} className={toggleClass(view === "code")}>
        <Code2 size={13} />
        Code
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

export default function CreatePage() {
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [app, setApp] = useState<GeneratedFile | null>(null);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [target, setTarget] = useState("C++");
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState<GeneratedFile | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"app" | "converted" | null>(null);

  const generate = async () => {
    const trimmed = idea.trim();
    if (!trimmed || generating) return;
    setGenerating(true);
    setError("");
    setApp(null);
    setConverted(null);
    try {
      const res = await fetch("/api/ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate", idea: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "The AI request failed."
        );
      }
      if (!data?.file) throw new Error("The AI returned an unexpected response.");
      setApp(data.file as GeneratedFile);
      setView("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI request failed.");
    } finally {
      setGenerating(false);
    }
  };

  const convert = async () => {
    if (!app || converting) return;
    setConverting(true);
    setError("");
    setConverted(null);
    try {
      const res = await fetch("/api/ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "convert",
          target,
          source: { name: app.name, language: app.language, code: app.code },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "The AI request failed."
        );
      }
      if (!data?.file) throw new Error("The AI returned an unexpected response.");
      setConverted(data.file as GeneratedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI request failed.");
    } finally {
      setConverting(false);
    }
  };

  const copy = async (text: string, which: "app" | "converted") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
          <Wand2 size={22} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white md:text-4xl">Create an App</h1>
        <p className="mt-2 text-gray-400">
          Describe what you want — the AI builds a complete web app — then
          transform it to C++, Java, JavaScript or TypeScript.
        </p>
      </div>

      {/* Idea input */}
      <div className="glass rounded-2xl p-4 ring-glow md:p-6">
        <div className="mb-3 flex items-center gap-2 text-purple-400">
          <Sparkles size={16} />
          <span className="text-sm font-medium">What should we build?</span>
        </div>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
          }}
          rows={3}
          placeholder="e.g., A habit tracker with weekly streaks, dark UI and localStorage persistence..."
          className="w-full resize-none bg-transparent text-base text-gray-200 outline-none placeholder-gray-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_IDEAS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setIdea(example)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-purple-500/40 hover:text-gray-200"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="hidden text-xs text-gray-500 sm:block">
            Ctrl/⌘ + Enter to generate
          </span>
          <button
            type="button"
            onClick={generate}
            disabled={!idea.trim() || generating}
            className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 font-medium text-white shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700 disabled:shadow-none"
          >
            {generating ? (
              <>
                <Spinner />
                Creating your app…
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Generate app
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Generated app */}
      {app && (
        <div className="glass mt-6 rounded-2xl p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{app.name}</span>
              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">
                single file
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle view={view} onChange={setView} />
              <button type="button" onClick={generate} disabled={generating} className={ghostButton}>
                <RefreshCw size={13} />
                Regenerate
              </button>
            </div>
          </div>

          <div className="mt-4">
            {view === "preview" ? (
              <iframe
                title="App preview"
                srcDoc={app.code}
                sandbox="allow-scripts"
                className="h-96 w-full rounded-xl border border-white/10 bg-[#0b0b12]"
              />
            ) : (
              <pre className="max-h-96 overflow-auto whitespace-pre rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-gray-300">
                {app.code}
              </pre>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadText(app.name, app.code)}
                className={ghostButton}
              >
                <Download size={14} />
                Download
              </button>
              <button type="button" onClick={() => copy(app.code, "app")} className={ghostButton}>
                {copied === "app" ? <Check size={14} /> : <Copy size={14} />}
                {copied === "app" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Transform to</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 outline-none transition-colors focus:border-purple-500/50"
              >
                {TARGETS.map((lang) => (
                  <option key={lang} value={lang} className="bg-gray-900">
                    {lang}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={convert}
                disabled={converting}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700"
              >
                {converting ? <Spinner /> : <ArrowRight size={14} />}
                Transform
              </button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-500">
            Quick single-file transform — the full converter (multi-file
            projects, build verification) arrives in a later step.
          </p>
        </div>
      )}

      {/* Converted result */}
      {converted && (
        <div className="glass mt-6 rounded-2xl p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{converted.name}</span>
              <span className="rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-300">
                {converted.language}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadText(converted.name, converted.code)}
                className={ghostButton}
              >
                <Download size={14} />
                Download
              </button>
              <button
                type="button"
                onClick={() => copy(converted.code, "converted")}
                className={ghostButton}
              >
                {copied === "converted" ? <Check size={14} /> : <Copy size={14} />}
                {copied === "converted" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-gray-300">
            {converted.code}
          </pre>
        </div>
      )}
    </div>
  );
}
