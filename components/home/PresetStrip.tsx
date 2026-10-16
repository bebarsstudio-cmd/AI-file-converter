"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Compass } from "lucide-react";
import { PRESETS } from "@/presets/presets";
import type { Preset } from "@/types/preset";

interface PresetStripProps {
  onSelect: (preset: Preset) => void;
  selectedId?: string | null;
}

const LOOP_COPIES = 3;

/**
 * Horizontally scrollable preset browser with edge fades and seamless looping.
 *
 * The list is rendered three times; whenever the scroll position leaves the
 * middle copy it is shifted by exactly one copy width, which is visually
 * identical and makes the strip loop forever in both directions.
 */
export default function PresetStrip({ onSelect, selectedId }: PresetStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copyWidthRef = useRef(0);
  const dragRef = useRef({ down: false, startX: 0, startScroll: 0, moved: 0 });

  const wrapAround = useCallback(() => {
    const el = scrollerRef.current;
    const copyWidth = copyWidthRef.current;
    if (!el || copyWidth <= 0) return;
    if (el.scrollLeft < copyWidth * 0.5) {
      el.scrollLeft += copyWidth;
    } else if (el.scrollLeft > copyWidth * 2.5) {
      el.scrollLeft -= copyWidth;
    }
  }, []);

  // Measure one copy and start the viewport on the middle copy.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      copyWidthRef.current = el.scrollWidth / LOOP_COPIES;
      if (copyWidthRef.current > 0) el.scrollLeft = copyWidthRef.current;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // A plain mouse wheel only scrolls pages vertically — translate it into
  // horizontal scrolling while the pointer is over the strip.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return; // trackpad pan
      event.preventDefault();
      el.scrollLeft += event.deltaY;
      wrapAround();
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [wrapAround]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      down: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag.down || !el) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    el.scrollLeft = drag.startScroll - dx;
  };

  const endDrag = () => {
    dragRef.current.down = false;
  };

  const loopedPresets = Array.from({ length: LOOP_COPIES }, () => PRESETS).flat();

  return (
    <section aria-label="Preset recipes" className="animate-in-up">
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Presets</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            {PRESETS.length}
          </span>
        </div>
        <span className="hidden text-[11px] text-gray-500 sm:block">
          Scroll or drag · click to apply
        </span>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={wrapAround}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-grab select-none overflow-x-auto py-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopedPresets.map((preset, index) => {
            const isSelected = selectedId === preset.id;
            return (
              <button
                key={`${index}-${preset.id}`}
                type="button"
                title={preset.prompt}
                onDragStart={(event) => event.preventDefault()}
                onClick={() => {
                  if (dragRef.current.moved > 6) return; // was a drag, not a click
                  onSelect(preset);
                }}
                className={`mr-3 w-60 shrink-0 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-purple-500/50 bg-purple-500/[0.07]"
                    : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-purple-500/30 hover:bg-white/[0.06] hover:shadow-[0_0_28px_-8px_rgba(168,85,247,0.55)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base">
                    {preset.emoji}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-tight text-white">
                    {preset.name}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-snug text-gray-400">
                  {preset.description}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                    {preset.category}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                      preset.target === "Auto"
                        ? "border-white/10 bg-white/5 text-gray-500"
                        : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                    }`}
                  >
                    {preset.target}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#07070c] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#07070c] to-transparent" />
      </div>
    </section>
  );
}
