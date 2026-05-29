"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ResultBox } from "@/components/ui/ResultBox";
import { CheckIcon, SparkleIcon, SpinnerIcon } from "@/components/ui/icons";
// Reuse the exact server action the linear study mode uses to record a
// self-rated attempt and bump mastery.
import { recordSelfRating } from "../study/actions";
import type { Verdict } from "@/lib/grading";

type Flashcard = { id: string; question: string; answer: string };
type Mode = "self" | "short";
type Result = { verdict: Verdict; feedback?: string };
type Phase = "loading" | "card" | "ended" | "error";

type AgentResponse =
  | {
      sessionId: string;
      action: "present_card";
      card: Flashcard;
      reasoning: string;
    }
  | { sessionId: string; action: "end_session"; studyPlan: string };

// How a verdict reads back to the agent in the "what's next?" prompt.
const VERDICT_PHRASE: Record<Verdict, string> = {
  correct: "correct",
  partial: "partially correct",
  incorrect: "incorrect",
};

function nextMessage(cardId: string, verdict: Verdict, mastery: number) {
  return `Student got card ${cardId} ${VERDICT_PHRASE[verdict]}. Mastery is now ${mastery.toFixed(
    2
  )}. What's next?`;
}

// The end-of-session plan is model-authored markdown. There's no typography
// plugin in this project, so map the elements we expect to design-token classes.
const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1
      className="mb-2 mt-4 font-display text-2xl font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="mb-2 mt-4 font-display text-xl font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-1 mt-3 text-lg font-semibold text-foreground" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-3 leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="mb-3 list-disc space-y-1 pl-6 text-muted-foreground"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="mb-3 list-decimal space-y-1 pl-6 text-muted-foreground"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-primary underline" {...props} />
  ),
  code: ({ node, ...props }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm" {...props} />
  ),
};

export default function TutorSession({
  documentId,
  backHref,
}: {
  documentId: string;
  backHref: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [card, setCard] = useState<Flashcard | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [fatalError, setFatalError] = useState<string | null>(null);

  // Per-card answering state (mirrors the linear study mode).
  const [mode, setMode] = useState<Mode>("self");
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [mastery, setMastery] = useState(0);
  const [cardError, setCardError] = useState<string | null>(null);

  // Session tallies (the agent decides length, so there's no fixed total).
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [isPending, startTransition] = useTransition();
  const [isGrading, setIsGrading] = useState(false);
  const busy = isPending || isGrading;

  // The last message we sent the agent, so the error screen can retry it.
  // null means "start a fresh session".
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const questionRef = useRef<HTMLDivElement>(null);

  function resetCardState() {
    setMode("self");
    setRevealed(false);
    setAnswer("");
    setResult(null);
    setCardError(null);
  }

  // Single entry point to the agent endpoint. userMessage === null starts a
  // new session (no sessionId, no message); otherwise it continues this one.
  async function runAgent(userMessage: string | null) {
    setPhase("loading");
    setFatalError(null);
    setLastMessage(userMessage);
    try {
      const body: { sessionId?: string; userMessage?: string } = {};
      if (sessionId) body.sessionId = sessionId;
      if (userMessage) body.userMessage = userMessage;

      const response = await fetch(`/api/documents/${documentId}/tutor-next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as AgentResponse & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "The tutor couldn't respond");
      }

      setSessionId(data.sessionId);

      if (data.action === "present_card") {
        resetCardState();
        setCard(data.card);
        setReasoning(data.reasoning);
        setPhase("card");
      } else if (data.action === "end_session") {
        setStudyPlan(data.studyPlan);
        setPhase("ended");
      } else {
        throw new Error("Unexpected response from the tutor");
      }
    } catch (err) {
      setFatalError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setPhase("error");
    }
  }

  // Start the session once on mount. The ref guards against React's
  // double-invoked effects in development (the agent call is expensive).
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runAgent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchMode(next: Mode) {
    if (result) return; // can't change mode after the card is answered
    setMode(next);
    setRevealed(false);
    setAnswer("");
    setCardError(null);
  }

  // Self-rate is deferred: we set the result locally so it can be changed, and
  // only persist it (recordSelfRating) when the student advances. That keeps a
  // misclick from permanently writing the wrong mastery signal.
  function selfRate(verdict: Verdict) {
    if (!card || busy) return;
    setCardError(null);
    setResult({ verdict });
  }

  function changeRating() {
    setResult(null);
    setCardError(null);
  }

  // Short-answer: grade via the existing endpoint (keyed by the *card* id). The
  // grade is authored server-side, so this path persists at submit time.
  async function submitAnswer() {
    if (!card || answer.trim().length === 0 || busy) return;
    setCardError(null);
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
      setResult({ verdict: data.verdict, feedback: data.feedback });
      setMastery(data.newMastery);
      setAnsweredCount((c) => c + 1);
      if (data.verdict === "correct") setCorrectCount((c) => c + 1);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGrading(false);
    }
  }

  // Advance to the next card. For self-rate, commit the deferred rating now
  // (then tell the agent); short-answer is already persisted, so just ask.
  function nextCard() {
    if (!card || !result || busy) return;
    const verdict = result.verdict;
    if (mode === "short") {
      runAgent(nextMessage(card.id, verdict, mastery));
      return;
    }
    startTransition(async () => {
      try {
        const { newMastery } = await recordSelfRating(card.id, verdict);
        setAnsweredCount((c) => c + 1);
        if (verdict === "correct") setCorrectCount((c) => c + 1);
        runAgent(nextMessage(card.id, verdict, newMastery));
      } catch {
        setCardError("Couldn't save your rating. Try again.");
      }
    });
  }

  // Move focus to the question whenever a new card loads, so keyboard and
  // screen-reader users land on the content instead of staying on a stale
  // (now-unmounted) control.
  useEffect(() => {
    if (phase === "card") questionRef.current?.focus();
  }, [phase, card?.id]);

  // Keyboard accelerators for the answer loop. Scoped to the card phase and
  // careful not to hijack typing or double-fire a focused button.
  useEffect(() => {
    if (phase !== "card") return;
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return; // don't hijack typing
      if (busy) return;
      if (!result) {
        if (mode === "self" && revealed) {
          if (e.key === "1") {
            e.preventDefault();
            selfRate("correct");
          } else if (e.key === "2") {
            e.preventDefault();
            selfRate("incorrect");
          }
        }
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        // Let a focused button/link handle Enter natively (avoid double-fire).
        if (e.key === "Enter" && (tag === "BUTTON" || tag === "A")) return;
        e.preventDefault();
        nextCard();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // selfRate/nextCard close over this state; re-bind when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, revealed, result, busy, mastery, card]);

  if (phase === "loading") {
    return (
      <Card
        role="status"
        className="flex items-center justify-center gap-3 p-10 text-sm text-muted-foreground"
      >
        <SpinnerIcon className="h-4 w-4 animate-spin" />
        {sessionId ? "Choosing your next card…" : "Starting your tutor session…"}
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <Card className="p-6">
        <div
          role="alert"
          className="mb-4 rounded-lg border border-destructive/20 bg-destructive-subtle px-4 py-3 text-sm text-destructive"
        >
          {fatalError}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => runAgent(lastMessage)}>Try again</Button>
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

  if (phase === "ended") {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Session complete
          </h2>
          <p className="mt-2 text-muted-foreground">
            You answered {answeredCount}{" "}
            {answeredCount === 1 ? "card" : "cards"} ({correctCount} correct).
          </p>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your study plan
          </h3>
          <ReactMarkdown components={markdownComponents}>
            {studyPlan}
          </ReactMarkdown>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={backHref} className={buttonClasses()}>
            Back to document
          </Link>
        </div>
      </Card>
    );
  }

  // phase === "card"
  if (!card) return null;

  return (
    <div className="space-y-4">
      {/* Why the agent chose this card */}
      {reasoning && (
        <div className="flex gap-3 rounded-lg border border-border bg-muted/60 p-4">
          <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm italic leading-relaxed text-muted-foreground">
            <span className="font-medium not-italic text-foreground">
              Why this card&nbsp;&nbsp;
            </span>
            {reasoning}
          </p>
        </div>
      )}

      {/* Progress + mode toggle */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {answeredCount} answered · {correctCount} correct
        </span>
        <ModeToggle mode={mode} disabled={!!result} onChange={switchMode} />
      </div>

      {/* Question */}
      <Card className="p-5">
        <div
          ref={questionRef}
          tabIndex={-1}
          className="font-medium text-foreground focus:outline-none"
        >
          {card.question}
        </div>

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
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submitAnswer();
              }
            }}
            rows={4}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
          <Button
            onClick={submitAnswer}
            disabled={busy || answer.trim().length === 0}
            aria-busy={isGrading}
          >
            {isGrading ? "Grading…" : "Submit answer"}
          </Button>
          {isGrading && (
            <span role="status" className="sr-only">
              Grading your answer…
            </span>
          )}
        </div>
      )}

      {/* Result feedback (announced to screen readers) */}
      <div aria-live="polite">
        {result && (
          <ResultBox verdict={result.verdict} feedback={result.feedback} />
        )}
      </div>

      {/* Error */}
      {cardError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive-subtle px-4 py-3 text-sm text-destructive"
        >
          {cardError}
        </div>
      )}

      {/* Advance */}
      {result && (
        <div className="flex gap-3">
          <Button onClick={nextCard} disabled={busy}>
            Next card
          </Button>
          {mode === "self" && (
            <Button variant="secondary" onClick={changeRating} disabled={busy}>
              Change rating
            </Button>
          )}
        </div>
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
