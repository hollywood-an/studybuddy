"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ResultBox } from "@/components/ui/ResultBox";
import { CheckIcon } from "@/components/ui/icons";
import { recordSelfRating } from "./actions";
import type { Verdict } from "@/lib/grading";

type Flashcard = { id: string; question: string; answer: string };
type Mode = "self" | "short";
type Result = { verdict: Verdict; feedback?: string };

export default function StudySession({
  cards,
  backHref,
}: {
  cards: Flashcard[];
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("self");
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGrading, setIsGrading] = useState(false);

  const card = cards[index];
  const busy = isPending || isGrading;

  // Reset per-card state when moving to a fresh card or switching mode.
  function resetCardState() {
    setRevealed(false);
    setAnswer("");
    setResult(null);
    setError(null);
  }

  function switchMode(next: Mode) {
    if (result) return; // can't change mode after the card is graded
    setMode(next);
    resetCardState();
  }

  function applyResult(r: Result) {
    setResult(r);
    if (r.verdict === "correct") setCorrectCount((c) => c + 1);
  }

  // Self-rate mode: record the attempt via the server action (two-way).
  function selfRate(verdict: Verdict) {
    setError(null);
    startTransition(async () => {
      try {
        await recordSelfRating(card.id, verdict);
        applyResult({ verdict });
      } catch {
        setError("Couldn't save your rating. Try again.");
      }
    });
  }

  // Short-answer mode: send to the grading endpoint and show its feedback.
  async function submitAnswer() {
    if (answer.trim().length === 0 || busy) return;
    setError(null);
    setIsGrading(true);
    try {
      const response = await fetch(`/api/documents/${card.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswer: answer }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Grading failed");
      }
      applyResult({ verdict: data.verdict, feedback: data.feedback });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGrading(false);
    }
  }

  function nextCard() {
    if (index + 1 >= cards.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    resetCardState();
  }

  function restart() {
    setIndex(0);
    setMode("self");
    setCorrectCount(0);
    setFinished(false);
    resetCardState();
  }

  if (finished) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckIcon className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Session complete
        </h2>
        <p className="mt-2 text-muted-foreground">
          You got {correctCount} of {cards.length} correct.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={restart}>Study again</Button>
          <Link
            href={backHref}
            className={buttonClasses({ variant: "secondary" })}
          >
            Back to document
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress + mode toggle */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Card {index + 1} of {cards.length}
        </span>
        <ModeToggle mode={mode} disabled={!!result} onChange={switchMode} />
      </div>

      {/* Question */}
      <Card className="p-5">
        <div className="font-medium text-foreground">{card.question}</div>

        {mode === "self" && revealed && (
          <div className="mt-3 border-t border-border pt-3 text-muted-foreground">
            {card.answer}
          </div>
        )}

        {mode === "short" && result && (
          <div className="mt-3 border-t border-border pt-3 text-muted-foreground">
            <span className="text-foreground/70">Answer: </span>
            {card.answer}
          </div>
        )}
      </Card>

      {/* Self-rate controls */}
      {mode === "self" &&
        !result &&
        (!revealed ? (
          <Button onClick={() => setRevealed(true)}>Show answer</Button>
        ) : (
          <div className="flex gap-3">
            <Button onClick={() => selfRate("correct")} disabled={busy}>
              Got it
            </Button>
            <Button
              variant="secondary"
              onClick={() => selfRate("incorrect")}
              disabled={busy}
            >
              Missed it
            </Button>
          </div>
        ))}

      {/* Short-answer controls */}
      {mode === "short" && !result && (
        <div className="space-y-3">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
          <Button
            onClick={submitAnswer}
            disabled={busy || answer.trim().length === 0}
          >
            {isGrading ? "Grading…" : "Submit answer"}
          </Button>
        </div>
      )}

      {/* Result feedback */}
      {result && <ResultBox verdict={result.verdict} feedback={result.feedback} />}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive-subtle px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Advance */}
      {result && (
        <Button onClick={nextCard}>
          {index + 1 >= cards.length ? "Finish" : "Next card"}
        </Button>
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  disabled,
  onChange,
}: {
  mode: Mode;
  disabled: boolean;
  onChange: (m: Mode) => void;
}) {
  const item = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      disabled={disabled}
      className={cn(
        "rounded-md px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        mode === m
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
      {item("self", "Self-rate")}
      {item("short", "Short answer")}
    </div>
  );
}
