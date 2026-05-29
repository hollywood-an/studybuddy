import { prisma } from "@/lib/prisma";
import { anthropic, FLASHCARD_MODEL } from "@/lib/claude";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a study assistant that generates high-quality flashcards from study material.

For the text provided, generate 3-5 flashcards covering the most important concepts, definitions, or facts.

Rules:
- Questions should be specific and unambiguous
- Answers should be concise (1-3 sentences)
- Don't ask trivial questions ("what does the text say about X?")
- Focus on understanding, not memorization of exact wording
- If the text doesn't contain enough substantive content for flashcards, return an empty array

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "flashcards": [
    {"question": "...", "answer": "..."}
  ]
}`;

type GeneratedCard = { question: string; answer: string };

function parseFlashcards(text: string): GeneratedCard[] {
  // Strip markdown code fences if Claude wrapped the JSON anyway
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.flashcards)) return [];
    return parsed.flashcards.filter(
      (c: GeneratedCard) =>
        typeof c.question === "string" && typeof c.answer === "string"
    );
  } catch {
    return [];
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch the document and its chunks
  const document = await prisma.document.findUnique({
    where: { id },
    include: { chunks: { orderBy: { index: "asc" } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Limit how many chunks we process so a single request doesn't run forever
  const chunksToProcess = document.chunks.slice(0, 10);

  let totalCreated = 0;

  for (const chunk of chunksToProcess) {
    try {
      const response = await anthropic.messages.create({
        model: FLASHCARD_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: chunk.content }],
      });

      // The response.content is an array of content blocks; we want the text block
      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") continue;

      const cards = parseFlashcards(textBlock.text);

      if (cards.length > 0) {
        await prisma.flashcard.createMany({
          data: cards.map((c) => ({
            documentId: document.id,
            chunkId: chunk.id,
            question: c.question,
            answer: c.answer,
          })),
        });
        totalCreated += cards.length;
      }
    } catch (err) {
      console.error(`Failed on chunk ${chunk.index}:`, err);
      // Keep going on the next chunk
    }
  }

  return NextResponse.json({
    documentId: document.id,
    chunksProcessed: chunksToProcess.length,
    flashcardsCreated: totalCreated,
  });
}