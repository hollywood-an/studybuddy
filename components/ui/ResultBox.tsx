import { cn } from "@/lib/cn";
import type { Verdict } from "@/lib/grading";

// Shared grade-result display for Study and Tutor modes. Three-way state, each
// carrying a label (never color alone) and a subtle tonal fill: emerald =
// correct, amber = partial, red = incorrect.
const STYLES: Record<Verdict, { box: string; label: string }> = {
  correct: { box: "bg-success-subtle text-success", label: "Correct" },
  partial: {
    box: "bg-partial-subtle text-partial",
    label: "Partially correct",
  },
  incorrect: {
    box: "bg-destructive-subtle text-destructive",
    label: "Incorrect",
  },
};

export function ResultBox({
  verdict,
  feedback,
}: {
  verdict: Verdict;
  feedback?: string;
}) {
  const style = STYLES[verdict];
  return (
    <div className={cn("rounded-lg px-4 py-3 text-sm", style.box)}>
      <div className="font-medium">{style.label}</div>
      {feedback && <div className="mt-1 leading-relaxed">{feedback}</div>}
    </div>
  );
}
