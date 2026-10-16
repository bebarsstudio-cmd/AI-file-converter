"use client";

import { useRef, useEffect } from "react";
import { SendHorizontal, Languages, Sparkles } from "lucide-react";

interface PromptComposerProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  targetLang: string;
  onTargetLangChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export default function PromptComposer({
  prompt,
  onPromptChange,
  targetLang,
  onTargetLangChange,
  onSubmit,
  isSubmitting,
  canSubmit,
}: PromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const languages = ["C++", "Java", "JavaScript", "TypeScript"];

  return (
    <div
      id="prompt-composer"
      className="glass rounded-2xl p-4 md:p-6 shadow-2xl shadow-purple-900/10 transition-all focus-within:border-purple-500/30"
    >
      <div className="flex items-center gap-2 mb-3 text-purple-400">
        <Sparkles size={18} />
        <span className="text-sm font-medium">Describe your transformation</span>
      </div>
      
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="What do you want to transform today? (e.g., Convert my HTML/JS game into C++ while keeping the controls and assets...)"
        className="w-full bg-transparent border-none outline-none resize-none text-gray-200 placeholder-gray-500 text-base md:text-lg min-h-[60px] max-h-[300px]"
        rows={1}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Languages size={16} className="text-gray-400" />
          <select
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
          >
            {languages.map(lang => (
              <option key={lang} value={lang} className="bg-gray-900">{lang}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg transition-all shadow-lg shadow-purple-900/20 disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Transforming…</span>
            </>
          ) : (
            <>
              <span>Transform</span>
              <SendHorizontal size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
