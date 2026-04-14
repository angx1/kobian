import { NextRequest, NextResponse } from "next/server";
import { KoboService } from "@/lib/kobo";
import { AIService } from "@/lib/ai";
import { ObsidianService } from "@/lib/obsidian";

// GET /api/insights?title=&author= → devuelve insights guardados si existen
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const author = req.nextUrl.searchParams.get("author");

  if (!title || !author) {
    return NextResponse.json({ error: "title and author required" }, { status: 400 });
  }

  const { data, error } = ObsidianService.readInsightsNote(title, author);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    insights: data.markdown,
    highlightCount: data.highlightCount,
  });
}

// POST /api/insights — dos modos:
// { action: "generate", bookId, title, author } → genera y devuelve el markdown
// { action: "export", title, author, markdown, highlightCount, overwrite? } → guarda en el vault
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "generate") {
    const { bookId, title, author } = body;

    if (!bookId || !title || !author) {
      return NextResponse.json(
        { error: "bookId, title and author are required" },
        { status: 400 }
      );
    }

    const { data: highlights, error: highlightsError } =
      KoboService.getHighlights(bookId);

    if (highlightsError || !highlights) {
      return NextResponse.json({ error: highlightsError }, { status: 500 });
    }

    const { data: insights, error: aiError } = await AIService.generateInsights(
      title,
      author,
      highlights
    );

    if (aiError || !insights) {
      return NextResponse.json({ error: aiError }, { status: 500 });
    }

    return NextResponse.json({ insights, highlightCount: highlights.length });
  }

  if (action === "export") {
    const { title, author, markdown, highlightCount, overwrite } = body;

    if (!title || !author || !markdown || highlightCount == null) {
      return NextResponse.json(
        { error: "title, author, markdown and highlightCount are required" },
        { status: 400 }
      );
    }

    if (!overwrite && ObsidianService.insightsNoteExists(title, author)) {
      return NextResponse.json({ exists: true }, { status: 409 });
    }

    const { data, error } = ObsidianService.writeInsightsNote(
      title,
      author,
      markdown,
      highlightCount
    );

    if (error || !data) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: data.path });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
