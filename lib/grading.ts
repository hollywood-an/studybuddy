import { anthropic, GRADER_MODEL } from "@/lib/claude";
import { Verdict as PrismaVerdict } from "@prisma/client";

// App-level verdict is lowercase (matches the grader's JSON and the client);
// the Prisma enum (CORRECT/PARTIAL/INCORRECT) is only used at the DB boundary.
export type Verdict = "correct" | "partial" | "incorrect";

export const MASTERY_DELTA: Record<Verdict, number> = {
  correct: 0.2,
  partial: 0.1,
  incorrect: -0.1,
};

// Single source of truth for the mastery formula (grade route + self-rate).
export function applyMastery(current: number, verdict: Verdict): number {
  return Math.min(1, Math.max(0, current + MASTERY_DELTA[verdict]));
}

const TO_ENUM: Record<Verdict, PrismaVerdict> = {
  correct: PrismaVerdict.CORRECT,
  partial: PrismaVerdict.PARTIAL,
  incorrect: PrismaVerdict.INCORRECT,
};

export function verdictToEnum(v: Verdict): PrismaVerdict {
  return TO_ENUM[v];
}

export function enumToVerdict(v: PrismaVerdict): Verdict {
  return v.toLowerCase() as Verdict;
}

const GRADING_PROMPT = `You are grading a student's short answer to a study question. Grade accurately and honestly, and give feedback that actually teaches. Be generous about whether the student grasps the core idea, but never pretend an answer is more complete or correct than it is.

You are given the question, a reference answer (one valid way to answer, not the only one), and the student's answer.

First, reason privately in this order:
1. State the complete correct answer to the question in your own words.
2. Name what the student got right.
3. Hunt for what's missing, oversimplified, overgeneralized, or wrong — be specific. Watch for answers that are right only for a special case when the question is general, and for confident phrasing or keyword presence that isn't backed by real understanding.
4. Decide the verdict.

Verdict:
- "correct": captures the core concept the question targets. May be shorter, differently phrased, or omit secondary details.
- "partial": shows real but incomplete understanding — gets some of the core idea but misses an important part, overgeneralizes, or is right only for a special case.
- "incorrect": factually wrong, contradicts the concept, off-topic, or misses the core idea (even if related keywords appear).

Feedback (1-2 sentences, written to the student as "you"):
- Always name the single most useful thing to fix or add — even when the verdict is "correct". If the answer is genuinely complete, say so plainly and add the one nuance that deepens it.
- Never invent rewards, points, grades, scores, or "bonus" anything. There is no points system.
- No empty superlatives ("excellent", "amazing", "nice touch") as filler, and never praise depth or completeness the answer didn't show.
- Stay warm and specific.

Return ONLY valid JSON in this exact format, no markdown:
{
  "reasoning": "the complete correct answer, what's right, and what's missing",
  "verdict": "correct" | "partial" | "incorrect",
  "feedback": "1-2 warm, specific sentences naming one gap"
}`;

export type GradeOutput = {
  reasoning: string;
  verdict: Verdict;
  feedback: string;
};

const VERDICTS: readonly Verdict[] = ["correct", "partial", "incorrect"];

function parseGrade(text: string): GradeOutput | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.reasoning !== "string") return null;
    if (!VERDICTS.includes(parsed.verdict)) return null;
    if (typeof parsed.feedback !== "string") return null;
    return {
      reasoning: parsed.reasoning,
      verdict: parsed.verdict,
      feedback: parsed.feedback,
    };
  } catch {
    return null;
  }
}

// Pure grading call: no DB, no request — so the eval harness can drive it
// directly. (temperature is omitted: it's deprecated for the grader model.)
export async function gradeAnswer(input: {
  question: string;
  referenceAnswer: string;
  studentAnswer: string;
}): Promise<GradeOutput> {
  const response = await anthropic.messages.create({
    model: GRADER_MODEL,
    max_tokens: 512,
    system: GRADING_PROMPT,
    messages: [
      {
        role: "user",
        content: `Question: ${input.question}\n\nReference answer: ${input.referenceAnswer}\n\nStudent's answer: ${input.studentAnswer}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const grade =
    textBlock && textBlock.type === "text" ? parseGrade(textBlock.text) : null;
  if (!grade) {
    throw new Error("Grading failed: could not parse model output");
  }
  return grade;
}
