"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  mastery: number;
  timesSeen: number;
};

function masteryLabel(card: Flashcard): {
  label: string;
  variant: "neutral" | "primary" | "success";
} {
  if (card.timesSeen === 0) return { label: "New", variant: "neutral" };
  if (card.mastery >= 0.8) return { label: "Mastered", variant: "success" };
  if (card.mastery >= 0.5) return { label: "Familiar", variant: "primary" };
  return { label: "Learning", variant: "neutral" };
}

function FlashcardItem({ card }: { card: Flashcard }) {
  const [revealed, setRevealed] = useState(false);
  const mastery = masteryLabel(card);

  return (
    <li>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        className="group block h-full w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Card className="flex h-44 flex-col p-5 transition-colors group-hover:border-primary/40">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {revealed ? "Answer" : "Question"}
            </span>
            <Badge variant={mastery.variant}>{mastery.label}</Badge>
          </div>
          <p className="mt-3 flex-1 overflow-hidden text-sm leading-relaxed text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
            {revealed ? card.answer : card.question}
          </p>
          <span className="mt-3 text-xs text-muted-foreground">
            {revealed ? "Click to hide answer" : "Click to reveal answer"}
          </span>
        </Card>
      </button>
    </li>
  );
}

export default function FlashcardGrid({ cards }: { cards: Flashcard[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <FlashcardItem key={card.id} card={card} />
      ))}
    </ul>
  );
}
