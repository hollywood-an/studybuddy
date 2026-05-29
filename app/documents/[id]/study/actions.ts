"use server";

import { prisma } from "@/lib/prisma";

// Records a self-rated attempt and updates mastery without calling the LLM.
// Mirrors the bookkeeping in app/api/documents/[id]/grade/route.ts.
export async function recordSelfRating(flashcardId: string, isCorrect: boolean) {
  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!card) {
    throw new Error("Card not found");
  }

  // Update mastery: +0.2 if correct, -0.1 if wrong, clamped 0-1
  const masteryDelta = isCorrect ? 0.2 : -0.1;
  const newMastery = Math.min(1, Math.max(0, card.mastery + masteryDelta));

  // Record the attempt and update the card in one transaction.
  // userAnswer/feedback stay null — those are only for short-answer mode.
  await prisma.$transaction([
    prisma.attempt.create({
      data: {
        flashcardId: card.id,
        userAnswer: null,
        isCorrect,
        feedback: null,
      },
    }),
    prisma.flashcard.update({
      where: { id: card.id },
      data: { mastery: newMastery, timesSeen: { increment: 1 } },
    }),
  ]);

  return { isCorrect, newMastery };
}
