import { NextRequest, NextResponse } from "next/server";
import { KoboService } from "@/lib/kobo";
import { ObsidianService } from "@/lib/obsidian";

export async function POST(req: NextRequest) {
  const { bookId, title, author, overwrite } = await req.json();

  if (!bookId || !title || !author) {
    return NextResponse.json(
      { error: "bookId, title y author son requeridos" },
      { status: 400 }
    );
  }

  // comprobar si ya existe y no se ha confirmado sobreescritura
  if (!overwrite && ObsidianService.highlightsNoteExists(title, author)) {
    return NextResponse.json({ exists: true }, { status: 409 });
  }

  const { data: highlights, error: highlightsError } =
    KoboService.getHighlights(bookId);

  if (highlightsError || !highlights) {
    return NextResponse.json({ error: highlightsError }, { status: 500 });
  }

  const { data, error } = ObsidianService.writeHighlightsNote(
    title,
    author,
    highlights
  );

  if (error || !data) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true, path: data.path });
}
