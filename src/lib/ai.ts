import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Highlight } from "@/lib/kobo";

export class AIService {
  static async generateInsights(
    title: string,
    author: string,
    highlights: Highlight[],
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      const highlightsList = highlights
        .map((h, i) => {
          const note = h.annotation ? ` [Note: ${h.annotation}]` : "";
          return `${i + 1}. "${h.text}"${note}`;
        })
        .join("\n");

      const { text } = await generateText({
        model: openai("gpt-5.4"),
        system: `You are an expert at extracting deep insights from book highlights.
You help readers truly learn and apply what they've read.
Always respond in English, regardless of the language of the highlights.
Format your response in clean Markdown with the exact sections requested.`,
        prompt: `Book: "${title}" by ${author}

Here are the reader's highlights:
${highlightsList}

Generate structured insights with these exact sections:

## Key Ideas
Extract 3-5 of the most important concepts or ideas from these highlights. Be specific and concrete.

## Different Perspectives
Offer 2-3 alternative ways to think about the main themes — challenge assumptions, connect to other fields, or reframe the ideas.

## Actionable Takeaways
List 4-6 specific, concrete actions the reader can take to apply what they've read. Start each with a verb.`,
      });

      return { data: text, error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }
}
