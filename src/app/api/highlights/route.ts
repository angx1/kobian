import { NextRequest, NextResponse } from "next/server";
import { KoboService } from "@/lib/kobo";

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json({ error: "bookId requerido" }, { status: 400 });
  }

  const { data, error } = KoboService.getHighlights(bookId);

  if (error || !data) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ highlights: data });
}
