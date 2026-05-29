import { prisma } from "@/lib/prisma";

type ToolResult = { type: "continue"; content: string }
  | { type: "terminal"; action: "present_card"; cardId: string; reasoning: string }
  | { type: "terminal"; action: "end_session"; studyPlan: string };

export async function executeTool(
  documentId: string,
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case "get_cards_overview": {
      const cards = await prisma.flashcard.findMany({
        where: { documentId },
        select: {
          id: true,
          question: true,
          mastery: true,
          timesSeen: true,
        },
        orderBy: { mastery: "asc" },
      });
      return { type: "continue", content: JSON.stringify(cards) };
    }

    case "get_card_history": {
      const cardId = String(toolInput.cardId);
      const card = await prisma.flashcard.findUnique({
        where: { id: cardId },
        include: {
          attempts: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      });
      if (!card) {
        return { type: "continue", content: JSON.stringify({ error: "Card not found" }) };
      }
      return {
        type: "continue",
        content: JSON.stringify({
          question: card.question,
          answer: card.answer,
          mastery: card.mastery,
          timesSeen: card.timesSeen,
          recentAttempts: card.attempts.map((a) => ({
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
            feedback: a.feedback,
            at: a.createdAt,
          })),
        }),
      };
    }

    case "select_next_card": {
      return {
        type: "terminal",
        action: "present_card",
        cardId: String(toolInput.cardId),
        reasoning: String(toolInput.reasoning),
      };
    }

    case "end_session_with_plan": {
      return {
        type: "terminal",
        action: "end_session",
        studyPlan: String(toolInput.studyPlan),
      };
    }

    default:
      return { type: "continue", content: JSON.stringify({ error: `Unknown tool: ${toolName}` }) };
  }
}