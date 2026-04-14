import Database from "better-sqlite3";
import fs from "fs";
import { config } from "@/lib/config";

export interface Book {
  id: string;
  title: string;
  author: string;
  highlightCount: number;
}

export interface Highlight {
  id: string;
  text: string;
  annotation: string | null;
  dateCreated: string;
  startContainerPath: string;
}

export class KoboService {
  static isDeviceConnected(): boolean {
    return fs.existsSync(config.koboDatabasePath);
  }

  static getBooks(): { data: Book[] | null; error: string | null } {
    if (!this.isDeviceConnected()) {
      return { data: null, error: "Kobo no detectado" };
    }

    try {
      const db = new Database(config.koboDatabasePath, { readonly: true });

      const rows = db
        .prepare(
          `
          SELECT
            c.ContentID as id,
            c.Title as title,
            c.Attribution as author,
            COUNT(b.BookmarkID) as highlightCount
          FROM content c
          INNER JOIN Bookmark b ON b.VolumeID = c.ContentID
          WHERE c.MimeType = 'application/epub+zip'
            AND b.Hidden = 'false'
            AND b.Text IS NOT NULL
          GROUP BY c.ContentID
          ORDER BY c.Title
        `
        )
        .all() as Book[];

      db.close();
      return { data: rows, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }

  static getHighlights(
    bookId: string
  ): { data: Highlight[] | null; error: string | null } {
    if (!this.isDeviceConnected()) {
      return { data: null, error: "Kobo no detectado" };
    }

    try {
      const db = new Database(config.koboDatabasePath, { readonly: true });

      const rows = db
        .prepare(
          `
          SELECT
            b.BookmarkID as id,
            b.Text as text,
            b.Annotation as annotation,
            b.DateCreated as dateCreated,
            b.StartContainerPath as startContainerPath
          FROM Bookmark b
          WHERE b.VolumeID = ?
            AND b.Hidden = 'false'
            AND b.Text IS NOT NULL
          ORDER BY b.StartContainerPath
        `
        )
        .all(bookId) as Highlight[];

      db.close();
      return { data: rows, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }
}
