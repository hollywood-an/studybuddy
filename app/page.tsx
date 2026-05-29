import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import {
  UploadIcon,
  SparkleIcon,
  BookOpenIcon,
  CardsIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

const steps = [
  {
    icon: <UploadIcon className="h-5 w-5" />,
    title: "Upload a document",
    description: "Drop in your lecture notes, slides, or readings.",
  },
  {
    icon: <SparkleIcon className="h-5 w-5" />,
    title: "AI generates flashcards",
    description:
      "We split the document into chunks and turn them into question-and-answer cards.",
  },
  {
    icon: <BookOpenIcon className="h-5 w-5" />,
    title: "Study or get tutored",
    description:
      "Review at your own pace, or let the AI tutor run the whole session.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Container className="flex flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Adaptive AI study tutor
        </span>

        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Study smarter with a tutor
          <br className="hidden sm:block" /> that adapts to you
        </h1>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/documents" className={buttonClasses()}>
            Get started
          </Link>
          <Link
            href="/upload"
            className={buttonClasses({ variant: "secondary" })}
          >
            Upload a document
          </Link>
        </div>
      </Container>

      {/* How it works */}
      <section className="border-t border-border">
        <Container className="max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              From a PDF to personalized practice in three steps.
            </p>
          </div>

          {/* Three-step flow */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            {steps.map((step, i) => (
              <Fragment key={step.title}>
                <Card className="flex-1 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step {i + 1}
                  </div>
                  <h3 className="mt-1 font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden items-center justify-center sm:flex"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Two modes */}
          <h2 className="mt-16 text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Two ways to study
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Study Mode */}
            <Card className="flex flex-col p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CardsIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                Study Mode
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Go through your flashcards in a fixed order &mdash; weakest cards
                first. For each card, self-rate it or type a short answer and
                have it graded by AI.
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">
                Good for focused review when you know what you want to drill.
              </p>

              {/* Mini-mockup: a flashcard with self-rate controls */}
              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Question
                </div>
                <div className="mt-1.5 text-sm text-foreground">
                  What is the powerhouse of the cell?
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                    Got it
                  </span>
                  <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                    Missed it
                  </span>
                </div>
              </div>
            </Card>

            {/* Tutor Mode */}
            <Card className="flex flex-col p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SparkleIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                Tutor Mode
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                An AI agent runs the session. It reads your mastery and history,
                decides which card to show next, explains why, and writes a
                personalized study plan at the end.
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">
                Good for &ldquo;I don&rsquo;t know where to start &mdash; just
                teach me.&rdquo;
              </p>

              {/* Mini-mockup: the agent's reasoning callout above a card */}
              <div className="mt-5 space-y-2">
                <div className="flex gap-2 rounded-lg border border-border bg-muted/60 p-3">
                  <SparkleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-xs italic leading-relaxed text-muted-foreground">
                    <span className="font-medium not-italic text-foreground">
                      Why this card&nbsp;&nbsp;
                    </span>
                    lowest mastery &mdash; let&rsquo;s lock it in.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Question
                  </div>
                  <div className="mt-1 text-sm text-foreground">
                    Define Gibbs free energy.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
