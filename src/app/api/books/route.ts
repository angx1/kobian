import { NextResponse } from "next/server";
import { KoboService } from "@/lib/kobo";

export async function GET() {
  const connected = KoboService.isDeviceConnected();

  if (!connected) {
    return NextResponse.json(
      { error: "Kobo no detectado", connected: false },
      { status: 503 }
    );
  }

  const { data, error } = KoboService.getBooks();

  if (error || !data) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ connected: true, books: data });
}
