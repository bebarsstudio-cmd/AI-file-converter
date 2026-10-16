"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import PromptComposer from "@/components/home/PromptComposer";
import PresetStrip from "@/components/home/PresetStrip";
import FileUpload from "@/components/home/FileUpload";
import type { Preset } from "@/types/preset";

const TEXT_EXTENSIONS = new Set([
  "html", "htm", "css", "js", "mjs", "cjs", "jsx", "ts", "tsx", "json",
  "md", "txt", "svg", "xml", "yml", "yaml", "cpp", "hpp", "cc", "hh",
  "c", "h", "java", "py", "rb", "go", "rs", "cs", "php", "sql", "sh",
  "vue", "svelte", "toml", "ini",
]);

const MAX_BUNDLE_CHARS = 120_000;

interface ConvertedResult {
  name: string;
  language: string;
  code: string;
}

function isTextFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  if (file.type === "application/json" || file.type === "image/svg+xml") {
    return true;
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXTENSIONS.has(extension);
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

/**
 * Holds the state shared by the composer, the preset strip and the upload
 * card, and runs the quick single-pass AI transform when the send button is
 * pressed.
 */
export default function HomeSetup() {
  const [prompt, setPrompt] = useState("");
  const [targetLang, setTargetLang] = useState("JavaScript");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConvertedResult | null>(null);
  const [resultTruncated, setResultTruncated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    setActivePresetId(null); // manual edits detach the preset
  };

  const handlePresetSelect = (preset: Preset) => {
    setPrompt(preset.prompt);
    setActivePresetId(preset.id);
    if (preset.target !== "Auto") {
      setTargetLang(preset.target);
    }
    document
      .getElementById("prompt-composer")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleTransform = async () => {
    if (isTransforming) return;

    if (files.length === 0) {
      setError(
        "Add your project files below first — then Transform will convert them."
      );
      setResult(null);
      document
        .getElementById("file-upload")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const readableFiles = files.filter(isTextFile);
    if (readableFiles.length === 0) {
      setError(
        "None of the uploaded files can be read as text yet (ZIP archives are coming soon). Try uploading the actual source files."
      );
      setResult(null);
      return;
    }

    setIsTransforming(true);
    setError("");
    setResult(null);
    setResultTruncated(false);
    try {
      const parts = await Promise.all(
        readableFiles.map(
          async (file) => `===== ${file.name} =====\n${await file.text()}`
        )
      );
      const bundle = parts.join("\n\n");
      if (bundle.length > MAX_BUNDLE_CHARS) {
        setError(
          `That project is too large for the quick transform (${Math.round(
            bundle.length / 1024
          )} KB of text). The full project pipeline is coming soon — try fewer or smaller files.`
        );
        return;
      }

      const instruction =
        prompt.trim() ||
        `Convert this project to ${targetLang}, preserving its behavior and structure as closely as possible.`;

      const res = await fetch("/api/ai/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "convert",
          target: targetLang,
          instruction,
          source: {
            name:
              readableFiles.length === 1
                ? readableFiles[0].name
                : `${readableFiles.length} project files`,
            language: "multi-file project",
            code: bundle,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "The AI request failed."
        );
      }
      if (!data?.file) throw new Error("The AI returned an unexpected response.");
      setResult(data.file as ConvertedResult);
      setResultTruncated(data.file.truncated === true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI request failed.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <PromptComposer
        prompt={prompt}
        onPromptChange={handlePromptChange}
        targetLang={targetLang}
        onTargetLangChange={setTargetLang}
        onSubmit={handleTransform}
        isSubmitting={isTransforming}
        canSubmit={prompt.trim().length > 0 || files.length > 0}
      />
      <PresetStrip onSelect={handlePresetSelect} selectedId={activePresetId} />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <FileUpload files={files} onFilesChange={setFiles} />

      {isTransforming && (
        <div className="animate-in-up glass flex items-center gap-4 rounded-2xl p-6">
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <div>
            <p className="font-medium text-white">Transforming your project…</p>
            <p className="mt-0.5 text-xs text-gray-500">
              This can take a while — the AI is converting your files.
            </p>
          </div>
        </div>
      )}

      {result && (
        <div className="animate-in-up glass rounded-2xl p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{result.name}</span>
              <span className="rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-300">
                {result.language}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadText(result.name, result.code)}
                className={ghostButton}
              >
                <Download size={14} />
                Download
              </button>
              <button type="button" onClick={handleCopy} className={ghostButton}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          {resultTruncated && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
              The AI output may be incomplete — it was cut off before the file
              finished. Try again, or convert fewer files.
            </div>
          )}
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-gray-300">
            {result.code}
          </pre>
          <p className="mt-3 text-[11px] text-gray-500">
            Quick AI transform — the full converter (multi-file projects, build
            verification) arrives in a later step.
          </p>
        </div>
      )}
    </>
  );
}
