import { prisma } from "@/lib/prisma";
import { anthropic, GRADER_MODEL } from "@/lib/claude";
import { NextResponse } from "next/server";

const GRADING_PROMPT = `You are grading a student's short answer to a study question. Your goal is to recognize understanding, not to demand a perfect or complete answer.

You will be given the question, a reference answer, and the student's answer.

Grading philosophy:
- Mark CORRECT if the student's answer captures the core idea — even if it's phrased differently, shorter, or uses different examples than the reference answer.
- A partial answer that demonstrates real understanding of the main concept is CORRECT.
- The reference answer is ONE valid way to answer, NOT the only correct answer. Never penalize the student for not matching it word-for-word or for omitting secondary details.
- Only mark INCORRECT if the answer is factually wrong, contradicts the concept, is off-topic, or shows a fundamental misunderstanding.
- When genuinely uncertain, lean toward CORRECT.

Reason through it first, then give your verdict. Double check the student's answer against the question and reference answer to ensure you didn't miss any subtle cues.

Return ONLY valid JSON in this exact format, no markdown:
{
  "reasoning": "What is the core concept, and did the student capture it?",
  "isCorrect": true | false,
  "feedback": "1-2 sentences of encouraging, constructive feedback"
}`;

type GradeResult = { reasoning: string; isCorrect: boolean; feedback: string };

function parseGrade(text: string): GradeResult | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.reasoning !== "string") return null;
    if (typeof parsed.isCorrect !== "boolean") return null;
    if (typeof parsed.feedback !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

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

  // Ask Claude to grade
  const response = await anthropic.messages.create({
    model: GRADER_MODEL,
    max_tokens: 512,
    system: GRADING_PROMPT,
    messages: [
      {
        role: "user",
        content: `Question: ${card.question}\n\nCorrect answer: ${card.answer}\n\nStudent's answer: ${userAnswer}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const grade =
    textBlock && textBlock.type === "text" ? parseGrade(textBlock.text) : null;

  if (!grade) {
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }

  // Update mastery: +0.2 if correct, -0.1 if wrong, clamped 0-1
  const masteryDelta = grade.isCorrect ? 0.2 : -0.1;
  const newMastery = Math.min(1, Math.max(0, card.mastery + masteryDelta));

  // Record the attempt and update the card in one transaction
  const [attempt] = await prisma.$transaction([
    prisma.attempt.create({
      data: {
        flashcardId: card.id,
        userAnswer,
        isCorrect: grade.isCorrect,
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
    isCorrect: grade.isCorrect,
    feedback: grade.feedback,
    newMastery,
  });
}