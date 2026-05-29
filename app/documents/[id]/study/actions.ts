"use server";

import { prisma } from "@/lib/prisma";
import { applyMastery, verdictToEnum, type Verdict } from "@/lib/grading";

// Records a self-rated attempt and updates mastery without calling the LLM.
// Mirrors the bookkeeping in app/api/documents/[id]/grade/route.ts. Self-rating
// is a two-way call ("correct" / "incorrect"); "partial" only comes from the
// AI grader.
export async function recordSelfRating(flashcardId: string, verdict: Verdict) {
  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!card) {
    throw new Error("Card not found");
  }

  const newMastery = applyMastery(card.mastery, verdict);

  // Record the attempt and update the card in one transaction.
  // userAnswer/feedback stay null — those are only for short-answer mode.
  await prisma.$transaction([
    prisma.attempt.create({
      data: {
        flashcardId: card.id,
        userAnswer: null,
        verdict: verdictToEnum(verdict),
        feedback: null,
      },
    }),
    prisma.flashcard.update({
      where: { id: card.id },
      data: { mastery: newMastery, timesSeen: { increment: 1 } },
    }),
  ]);

  return { verdict, newMastery };
}
