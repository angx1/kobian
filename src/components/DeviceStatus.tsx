"use client";

interface Props {
  connected: boolean;
  loading: boolean;
}

export default function DeviceStatus({ connected, loading }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
      <span
        className={`h-2 w-2 rounded-full ${
          loading
            ? "bg-stone-400 animate-pulse"
            : connected
            ? "bg-green-500"
            : "bg-red-600"
        }`}
      />
      <span className={loading ? "text-stone-400" : connected ? "text-green-600" : "text-red-600"}>
        {loading ? "detecting..." : connected ? "kobo connected" : "kobo not detected"}
      </span>
    </div>
  );
}
