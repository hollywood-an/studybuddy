import { anthropic } from "@/lib/claude";
import { TUTOR_TOOLS } from "./tools";
import { executeTool } from "./execute";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

const TUTOR_MODEL = "claude-haiku-4-5";
const MAX_AGENT_STEPS = 12;

const SYSTEM_PROMPT = `You are an adaptive study tutor. Your job is to help a student learn the material by either
choosing the next flashcard to present based on their performance history, or to end the session when the
student has mastered the material.

Your decision process:
1. Call get_cards_overview to see all cards and their current mastery.
2. END CHECK — do this before anything else: if the student's message asks to
   stop or end the session, OR if EVERY card has mastery > 0.8, immediately
   call end_session_with_plan (do not select another card). For an explicit
   stop, write an honest, encouraging plan from current mastery even if cards
   are still weak; for full mastery, a positive plan. Spaced-repetition
   reinforcement does not apply once the student has mastered everything.
3. If a card has low mastery and the student has attempted it, call
   get_card_history to understand why they're struggling.
4. Otherwise call select_next_card, preferring in this order:
   a. Cards with mastery < 0.5 that have been seen at least once.
   b. Cards never seen, if all seen cards are above 0.8.
   c. Spaced repetition — occasionally surface a high-mastery card to
      reinforce, but only when at least one card is still below 0.8.

Each past attempt has a verdict: correct, partial, or incorrect. Treat partial
as partial credit — the student grasped the core idea but missed something, so
it's weaker than correct but stronger than incorrect.

Be concise in your reasoning. The student only sees the card you select.`;

export type AgentDecision =
  | { type: "present_card"; cardId: string; reasoning: string; transcript: MessageParam[] }
  | { type: "end_session"; studyPlan: string; transcript: MessageParam[] };

export async function runTutorAgent(
  documentId: string,
  userMessage: string
): Promise<AgentDecision> {
  const messages: MessageParam[] = [{ role: "user", content: userMessage }];

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const response = await anthropic.messages.create({
      model: TUTOR_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TUTOR_TOOLS,
      messages,
    });

    // Remember what the assistant said
    messages.push({ role: "assistant", content: response.content });

    // If no tools were called, the agent is just talking — push it to act
    if (response.stop_reason !== "tool_use") {
      messages.push({
        role: "user",
        content:
          "Please use a tool to either select a card or end the session.",
      });
      continue;
    }

    // Execute every tool the agent called this turn
    const toolResults = [];
    let terminal: AgentDecision | null = null;

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      const result = await executeTool(
        documentId,
        block.name,
        block.input as Record<string, unknown>
      );

      if (result.type === "continue") {
        toolResults.push({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result.content,
        });
      } else if (result.action === "present_card") {
        terminal = {
          type: "present_card",
          cardId: result.cardId,
          reasoning: result.reasoning,
          transcript: messages,
        };
      } else if (result.action === "end_session") {
        terminal = {
          type: "end_session",
          studyPlan: result.studyPlan,
          transcript: messages,
        };
      }
    }

    if (terminal) return terminal;

    // Feed tool results back to the model and loop
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agent exceeded max steps without making a decision");
}