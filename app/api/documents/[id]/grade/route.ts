import { prisma } from "@/lib/prisma";
import { gradeAnswer, applyMastery, verdictToEnum } from "@/lib/grading";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userAnswer } = await request.json();

  if (typeof userAnswer !== "string" || userAnswer.trim().length === 0) {
    return NextResponse.json({ error: "Answer required" }, { status: 400 });
  }

  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  let grade;
  try {
    grade = await gradeAnswer({
      question: card.question,
      referenceAnswer: card.answer,
      studentAnswer: userAnswer,
    });
  } catch {
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }

  const newMastery = applyMastery(card.mastery, grade.verdict);

  // Record the attempt and update the card in one transaction
  const [attempt] = await prisma.$transaction([
    prisma.attempt.create({
      data: {
        flashcardId: card.id,
        userAnswer,
        verdict: verdictToEnum(grade.verdict),
        feedback: grade.feedback,
      },
    }),
    prisma.flashcard.update({
      where: { id: card.id },
      data: { mastery: newMastery, timesSeen: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({
    attemptId: attempt.id,
    verdict: grade.verdict,
    feedback: grade.feedback,
    newMastery,
  });
}
