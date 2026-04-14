"use client";

import type { Highlight } from "@/lib/kobo";

interface Props {
  highlights: Highlight[];
}

export default function HighlightPreview({ highlights }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {highlights.map((h, i) => (
        <div key={h.id} className="flex flex-col gap-1">
          <div className="flex gap-3">
            <span className="font-mono text-xs text-stone-300 pt-0.5 select-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <blockquote className="font-mono text-sm text-black leading-relaxed border-l-2 border-orange-500 pl-3">
              {h.text}
            </blockquote>
          </div>
          {h.annotation && (
            <p className="font-mono text-xs text-stone-500 italic pl-10">
              {h.annotation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
