import { Tool } from "@anthropic-ai/sdk/resources/messages";

export const TUTOR_TOOLS: Tool[] = [
  {
    name: "get_cards_overview",
    description:
      "Get a summary of all flashcards in this document: id, question, current mastery (0-1), and times seen. Use this to decide which cards the student should review.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_card_history",
    description:
      "Get the full attempt history for a specific flashcard: every past answer, whether it was correct, and the feedback given. Use this when you want to understand a student's pattern with a particular concept.",
    input_schema: {
      type: "object",
      properties: {
        cardId: {
          type: "string",
          description: "The flashcard id",
        },
      },
      required: ["cardId"],
    },
  },
  {
    name: "select_next_card",
    description:
      "Present a specific flashcard to the student as the next question. Provide your reasoning for why you chose this card.",
    input_schema: {
      type: "object",
      properties: {
        cardId: {
          type: "string",
          description: "The flashcard id to present",
        },
        reasoning: {
          type: "string",
          description:
            "Brief explanation of why this card was chosen (e.g., 'lowest mastery', 'student got similar concept wrong last time')",
        },
      },
      required: ["cardId", "reasoning"],
    },
  },
  {
    name: "end_session_with_plan",
    description:
      "End the study session and provide a personalized study plan in markdown. Use this when the student has covered enough material, or when there are no more useful cards to review.",
    input_schema: {
      type: "object",
      properties: {
        studyPlan: {
          type: "string",
          description:
            "A markdown-formatted study plan covering: what the student did well, what concepts to review, suggested next steps",
        },
      },
      required: ["studyPlan"],
    },
  },
];