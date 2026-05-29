import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const FLASHCARD_MODEL = "claude-haiku-4-5";

// Grading short answers benefits from a stronger model than card generation.
export const GRADER_MODEL = "claude-opus-4-7";