"use client";

import { useEffect, useState, useCallback } from "react";
import DeviceStatus from "@/components/DeviceStatus";
import BookList from "@/components/BookList";
import HighlightPreview from "@/components/HighlightPreview";
import InsightsPreview from "@/components/InsightsPreview";
import type { Book, Highlight } from "@/lib/kobo";

type View = "highlights" | "insights";
type ConfirmState = "idle" | "confirm-highlights" | "confirm-insights";

function WaveText({ text }: { text: string }) {
  return (
    <span className="font-mono text-sm text-stone-400 uppercase tracking-widest">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="animate-pulse inline-block"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);

  const [view, setView] = useState<View>("highlights");

  const [insightsMarkdown, setInsightsMarkdown] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  // highlight count cuando se generaron los insights guardados
  const [storedHighlightCount, setStoredHighlightCount] = useState<
    number | null
  >(null);
  // highlight count con el que se generaron los insights en esta sesión
  const [currentInsightsHighlightCount, setCurrentInsightsHighlightCount] =
    useState<number | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>("idle");

  useEffect(() => {
    async function loadBooks() {
      setDeviceLoading(true);
      try {
        const res = await fetch("/api/books");
        const json = await res.json();
        setConnected(json.connected ?? false);
        setBooks(json.books ?? []);
      } catch {
        setConnected(false);
      } finally {
        setDeviceLoading(false);
      }
    }
    loadBooks();
  }, []);

  const handleSelectBook = useCallback(async (book: Book) => {
    setSelectedBook(book);
    setHighlights([]);
    setHighlightsLoading(true);
    setView("highlights");
    setInsightsMarkdown("");
    setInsightsError(null);
    setStoredHighlightCount(null);
    setCurrentInsightsHighlightCount(null);
    setExportSuccess(null);
    setExportError(null);
    setConfirmState("idle");

    // carga highlights e insights guardados en paralelo
    const [highlightsRes, insightsRes] = await Promise.all([
      fetch(`/api/highlights?bookId=${encodeURIComponent(book.id)}`),
      fetch(
        `/api/insights?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`,
      ),
    ]);

    const highlightsJson = await highlightsRes.json();
    const insightsJson = await insightsRes.json();

    setHighlights(highlightsJson.highlights ?? []);
    setHighlightsLoading(false);

    if (insightsJson.found) {
      setInsightsMarkdown(insightsJson.insights);
      setStoredHighlightCount(insightsJson.highlightCount ?? null);
    }
  }, []);

  const handleGenerateInsights = useCallback(async () => {
    if (!selectedBook) return;
    setInsightsLoading(true);
    setInsightsError(null);
    setInsightsMarkdown("");
    setCurrentInsightsHighlightCount(null);

    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate",
        bookId: selectedBook.id,
        title: selectedBook.title,
        author: selectedBook.author,
      }),
    });

    const json = await res.json();
    setInsightsLoading(false);

    if (!res.ok) {
      setInsightsError(json.error ?? "Error generating insights");
    } else {
      setInsightsMarkdown(json.insights);
      setCurrentInsightsHighlightCount(json.highlightCount ?? null);
      setStoredHighlightCount(null); // ya no son los "guardados", son frescos
    }
  }, [selectedBook]);

  const handleExportHighlights = useCallback(
    async (overwrite = false) => {
      if (!selectedBook) return;
      setExporting(true);
      setExportError(null);
      setExportSuccess(null);

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          title: selectedBook.title,
          author: selectedBook.author,
          overwrite,
        }),
      });

      const json = await res.json();
      setExporting(false);

      if (res.status === 409) {
        setConfirmState("confirm-highlights");
        return;
      }

      if (!res.ok) {
        setExportError(json.error ?? "Export failed");
      } else {
        setExportSuccess("highlights exported");
        setConfirmState("idle");
      }
    },
    [selectedBook],
  );

  const handleExportInsights = useCallback(
    async (overwrite = false) => {
      if (!selectedBook || !insightsMarkdown) return;
      setExporting(true);
      setExportError(null);
      setExportSuccess(null);

      const highlightCount = currentInsightsHighlightCount ?? highlights.length;

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export",
          title: selectedBook.title,
          author: selectedBook.author,
          markdown: insightsMarkdown,
          highlightCount,
          overwrite,
        }),
      });

      const json = await res.json();
      setExporting(false);

      if (res.status === 409) {
        setConfirmState("confirm-insights");
        return;
      }

      if (!res.ok) {
        setExportError(json.error ?? "Export failed");
      } else {
        setExportSuccess("insights exported");
        setStoredHighlightCount(highlightCount);
        setCurrentInsightsHighlightCount(null);
        setConfirmState("idle");
      }
    },
    [
      selectedBook,
      insightsMarkdown,
      currentInsightsHighlightCount,
      highlights.length,
    ],
  );

  const insightsFullscreen =
    view === "insights" && insightsMarkdown && !insightsLoading;
  const newHighlightsCount =
    storedHighlightCount !== null
      ? highlights.length - storedHighlightCount
      : 0;
  const hasNewHighlights = newHighlightsCount > 0;

  return (
    <div className="flex flex-col h-screen">
      {/* header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <span className="text-base font-mono font-bold uppercase tracking-widest">
          kobian ~
        </span>
        <DeviceStatus connected={connected} loading={deviceLoading} />
      </header>

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* columna izquierda */}
        <aside className="w-64 flex-shrink-0 border-r border-stone-200 bg-white overflow-y-auto flex flex-col">
          <div className="px-3 py-3 border-b border-stone-100">
            <span className="text-sm font-mono uppercase tracking-widest text-stone-400">
              books ({books.length})
            </span>
          </div>
          {deviceLoading ? (
            <div className="px-3 py-4 text-sm font-mono text-stone-400 animate-pulse">
              loading...
            </div>
          ) : !connected ? (
            <div className="px-3 py-4 text-sm font-mono text-red-500">
              connect kobo via usb
            </div>
          ) : (
            <BookList
              books={books}
              selectedId={selectedBook?.id ?? null}
              onSelect={handleSelectBook}
            />
          )}
        </aside>

        {/* área principal */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {!selectedBook ? (
            <div className="flex items-center justify-center h-full text-sm font-mono text-stone-300 uppercase tracking-widest">
              select a book
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* subheader */}
              <div className="px-6 pt-4 border-b border-stone-200 bg-white flex-shrink-0">
                {/* título + autor */}
                <div className="mb-4">
                  <h1 className="font-mono text-base font-bold text-black">
                    {selectedBook.title}
                  </h1>
                  <p className="font-mono text-sm text-stone-400 mt-0.5">
                    {selectedBook.author}
                  </p>
                </div>

                {/* tabs (arriba) + botón de acción (derecha, alineado al fondo de los tabs) */}
                <div className="flex items-end justify-between">
                  <div className="flex border-l border-t border-r border-stone-200 divide-x divide-stone-200">
                    <button
                      onClick={() => setView("highlights")}
                      className={`cursor-pointer px-4 py-2 text-sm font-mono uppercase tracking-widest transition-colors ${
                        view === "highlights"
                          ? "bg-black text-white"
                          : "bg-white text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      highlights
                    </button>
                    <button
                      onClick={() => setView("insights")}
                      className={`cursor-pointer px-4 py-2 text-sm font-mono uppercase tracking-widest transition-colors relative ${
                        view === "insights"
                          ? "bg-black text-white"
                          : "bg-white text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      insights
                      {hasNewHighlights && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
                      )}
                    </button>
                  </div>

                  <div className="pb-2">
                    {view === "highlights" && (
                      <button
                        onClick={() => handleExportHighlights(false)}
                        disabled={
                          exporting ||
                          highlightsLoading ||
                          highlights.length === 0
                        }
                        className="cursor-pointer px-3 py-1.5 text-sm font-mono uppercase tracking-widest bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {exporting ? "..." : "→ export"}
                      </button>
                    )}

                    {view === "insights" && !insightsLoading && (
                      <button
                        onClick={handleGenerateInsights}
                        disabled={insightsLoading || highlights.length === 0}
                        className="cursor-pointer px-3 py-1.5 text-sm font-mono uppercase tracking-widest bg-black text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {insightsMarkdown ? "regenerate" : "generate insights"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* banner nuevos highlights */}
              {view === "insights" && hasNewHighlights && (
                <div className="px-6 py-2.5 bg-orange-50 border-b border-orange-200 flex-shrink-0">
                  <p className="font-mono text-sm text-orange-600">
                    {newHighlightsCount} new highlight
                    {newHighlightsCount !== 1 ? "s" : ""} since these insights
                    were generated — consider regenerating
                  </p>
                </div>
              )}

              {/* mensajes de estado */}
              {(exportSuccess || exportError || confirmState !== "idle") && (
                <div
                  className={`px-6 py-3 text-sm font-mono border-b flex-shrink-0 ${
                    exportError
                      ? "bg-red-50 border-red-200 text-red-600"
                      : exportSuccess
                        ? "bg-orange-50 border-orange-200 text-orange-600"
                        : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  {exportError && `error: ${exportError}`}
                  {exportSuccess && `✓ ${exportSuccess}`}
                  {confirmState !== "idle" && (
                    <div className="flex items-center gap-4">
                      <span>
                        a note for this book already exists. overwrite?
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            confirmState === "confirm-highlights"
                              ? handleExportHighlights(true)
                              : handleExportInsights(true)
                          }
                          className="cursor-pointer underline hover:text-black"
                        >
                          yes
                        </button>
                        <button
                          onClick={() => setConfirmState("idle")}
                          className="cursor-pointer underline hover:text-black"
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* contenido */}
              <div
                className={`flex-1 min-h-0 px-6 py-6 ${
                  insightsFullscreen
                    ? "flex flex-col overflow-hidden"
                    : "overflow-y-auto"
                }`}
              >
                {view === "highlights" && (
                  <>
                    {highlightsLoading ? (
                      <WaveText text="loading highlights..." />
                    ) : highlights.length === 0 ? (
                      <p className="text-sm font-mono text-stone-400">
                        no highlights for this book
                      </p>
                    ) : (
                      <HighlightPreview highlights={highlights} />
                    )}
                  </>
                )}

                {view === "insights" && (
                  <>
                    {insightsLoading && (
                      <WaveText text="generating insights..." />
                    )}
                    {insightsError && (
                      <p className="text-sm font-mono text-red-500">
                        error: {insightsError}
                      </p>
                    )}
                    {!insightsLoading &&
                      !insightsError &&
                      !insightsMarkdown && (
                        <p className="text-sm font-mono text-stone-300 uppercase tracking-widest">
                          press &quot;generate insights&quot; to start
                        </p>
                      )}
                    {insightsMarkdown && (
                      <InsightsPreview
                        markdown={insightsMarkdown}
                        onChange={setInsightsMarkdown}
                        onExport={() => handleExportInsights(false)}
                        exporting={exporting}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
