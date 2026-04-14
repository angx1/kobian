"use client";

interface Props {
  markdown: string;
  onChange: (value: string) => void;
  onExport: () => void;
  exporting: boolean;
}

export default function InsightsPreview({
  markdown,
  onChange,
  onExport,
  exporting,
}: Props) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="font-mono text-sm uppercase tracking-widest text-stone-400">
          preview — editable
        </span>
        <button
          onClick={onExport}
          disabled={exporting}
          className="cursor-pointer font-mono text-sm uppercase tracking-widest px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? "saving..." : "→ save to vault"}
        </button>
      </div>
      <textarea
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full font-mono text-sm text-black bg-stone-50 border border-stone-200 p-4 resize-none focus:outline-none transition-colors"
        spellCheck={false}
      />
    </div>
  );
}
