import fs from "fs";
import path from "path";
import { config } from "@/lib/config";
import type { Highlight } from "@/lib/kobo";

export interface StoredInsights {
  markdown: string;
  highlightCount: number | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getDatePrefix(): string {
  return new Date().toISOString().split("T")[0];
}

export function buildHighlightsFilename(title: string, author: string): string {
  return `${getDatePrefix()}-${slugify(title)}-${slugify(author)}-highlights.md`;
}

export function buildInsightsFilename(title: string, author: string): string {
  return `${getDatePrefix()}-${slugify(title)}-${slugify(author)}-insights.md`;
}

// busca cualquier fichero de insights para este libro (independiente de la fecha)
function findInsightsFile(title: string, author: string): string | null {
  const dirPath = path.join(config.vaultPath, config.insightsOutputDir);
  if (!fs.existsSync(dirPath)) return null;

  const suffix = `-${slugify(title)}-${slugify(author)}-insights.md`;
  const matches = fs.readdirSync(dirPath).filter((f) => f.endsWith(suffix));
  if (matches.length === 0) return null;

  // el más reciente (orden lexicográfico descendente por fecha en el nombre)
  matches.sort().reverse();
  return path.join(dirPath, matches[0]);
}

export function buildHighlightsNote(
  title: string,
  author: string,
  highlights: Highlight[]
): string {
  const date = getDatePrefix();

  const highlightBlocks = highlights
    .map((h) => {
      const quote = `> ${h.text}`;
      const note = h.annotation ? `\n\n*${h.annotation}*` : "";
      return `${quote}${note}`;
    })
    .join("\n\n---\n\n");

  return `---
type: book-highlights
created: ${date}
author: ${author}
tags: [highlights, books]
---

# ${title} — Highlights

## Highlights

${highlightBlocks}
`;
}

export function buildInsightsNote(
  title: string,
  author: string,
  insightsMarkdown: string,
  highlightCount: number
): string {
  const date = getDatePrefix();

  return `---
type: book-insights
created: ${date}
author: ${author}
highlight_count: ${highlightCount}
tags: [insights, books]
---

# ${title} — Insights

${insightsMarkdown}
`;
}

export class ObsidianService {
  static highlightsNoteExists(title: string, author: string): boolean {
    const filename = buildHighlightsFilename(title, author);
    const fullPath = path.join(
      config.vaultPath,
      config.highlightsOutputDir,
      filename
    );
    return fs.existsSync(fullPath);
  }

  static insightsNoteExists(title: string, author: string): boolean {
    return findInsightsFile(title, author) !== null;
  }

  // lee el fichero de insights guardado y extrae el markdown + highlight_count del frontmatter
  static readInsightsNote(
    title: string,
    author: string
  ): { data: StoredInsights | null; error: string | null } {
    try {
      const filePath = findInsightsFile(title, author);
      if (!filePath) return { data: null, error: null };

      const content = fs.readFileSync(filePath, "utf-8");

      // extraer highlight_count del frontmatter
      const countMatch = content.match(/^highlight_count:\s*(\d+)/m);
      const highlightCount = countMatch ? parseInt(countMatch[1], 10) : null;

      // extraer el cuerpo (todo tras el segundo ---)
      const bodyMatch = content.match(/^---\n[\s\S]*?^---\n([\s\S]*)$/m);
      const markdown = bodyMatch ? bodyMatch[1].trim() : content;

      return { data: { markdown, highlightCount }, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }

  static writeHighlightsNote(
    title: string,
    author: string,
    highlights: Highlight[]
  ): { data: { path: string } | null; error: string | null } {
    try {
      const filename = buildHighlightsFilename(title, author);
      const dirPath = path.join(config.vaultPath, config.highlightsOutputDir);
      const fullPath = path.join(dirPath, filename);

      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(
        fullPath,
        buildHighlightsNote(title, author, highlights),
        "utf-8"
      );

      return { data: { path: fullPath }, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }

  static writeInsightsNote(
    title: string,
    author: string,
    insightsMarkdown: string,
    highlightCount: number
  ): { data: { path: string } | null; error: string | null } {
    try {
      const filename = buildInsightsFilename(title, author);
      const dirPath = path.join(config.vaultPath, config.insightsOutputDir);
      const fullPath = path.join(dirPath, filename);

      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(
        fullPath,
        buildInsightsNote(title, author, insightsMarkdown, highlightCount),
        "utf-8"
      );

      return { data: { path: fullPath }, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }
}
