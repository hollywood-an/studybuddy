import { Fragment } from "react";
import type { CSSProperties } from "react";
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

// Stagger index for the one-time hero entrance (see .hero-reveal in globals.css).
const ri = (i: number): CSSProperties => ({ "--reveal-i": i }) as CSSProperties;

const steps = [
  {
    icon: <UploadIcon className="h-4 w-4" />,
    title: "Upload a document",
    description: "Drop in your lecture notes, slides, or readings.",
  },
  {
    icon: <SparkleIcon className="h-4 w-4" />,
    title: "AI generates flashcards",
    description:
      "We split the document into chunks and turn them into question-and-answer cards.",
  },
  {
    icon: <BookOpenIcon className="h-4 w-4" />,
    title: "Study or get tutored",
    description:
      "Review at your own pace, or let the AI tutor run the whole session.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero — the product, thinking, shown */}
      <section className="relative overflow-hidden border-b border-border bg-background bg-grain">
        {/* Broad, faint amber lamp-glow lifting the hero off the flat canvas.
            Weighted up/right toward the demo so it stays clear of the muted
            subcopy in the left column (text stays AA). Decorative, behind all
            content. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 65% at 68% 18%, color-mix(in oklch, var(--primary) 6%, transparent), transparent 72%)",
          }}
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-[5fr_6fr] lg:gap-16">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <h1
              className="hero-reveal font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-tight text-foreground"
              style={ri(0)}
            >
              A tutor that adapts to you,{" "}
              <span className="italic">and tells you why</span>
            </h1>
            <p
              className="hero-reveal mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0"
              style={ri(1)}
            >
              Upload your notes and an AI tutor picks what to study next,
              explains its reasoning, and writes you a plan when you&rsquo;re
              done.
            </p>
            <div
              className="hero-reveal mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
              style={ri(2)}
            >
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
          </div>

          {/* Live agent demo: the agent reasons, then shows the card.
              Decorative product preview — its message is in the prose, so it's
              hidden from screen readers. `isolate` keeps the -z-10 glow scoped
              behind the card instead of the page background. */}
          <div className="relative isolate" aria-hidden="true">
            <div
              className="pointer-events-none absolute -inset-8 -z-10 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
              }}
            />
            <Card className="space-y-3 p-5 shadow-lg">
              <div
                className="hero-reveal flex gap-3 rounded-lg border border-border bg-muted/60 p-4"
                style={ri(3)}
              >
                <SparkleIcon className="agent-pulse mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  <span className="font-medium not-italic text-foreground">
                    Why this card&nbsp;&nbsp;
                  </span>
                  Your mastery here is the lowest, so let&rsquo;s lock it in
                  before moving on.
                </p>
              </div>
              <div
                className="hero-reveal rounded-lg border border-border bg-background p-4"
                style={ri(4)}
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Question
                </div>
                <div className="mt-1.5 text-base text-foreground">
                  Define Gibbs free energy.
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
          </div>
        </div>
      </section>

      {/* How it works — white band */}
      <section className="bg-card bg-grain">
        <Container className="max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              From your notes to practice in three steps.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            {steps.map((step, i) => (
              <Fragment key={step.title}>
                <Card className="flex-1 p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-xl font-semibold leading-none text-foreground">
                      {i + 1}
                    </span>
                    <span className="text-primary">{step.icon}</span>
                  </div>
                  <h3 className="mt-3 font-medium text-foreground">
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
        </Container>
      </section>

      {/* Two ways to study — canvas band, tutor leads */}
      <section className="bg-background bg-grain">
        <Container className="max-w-5xl">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Two ways to study
          </h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            {/* Tutor Mode — the differentiator, featured */}
            <Card className="flex flex-col border-primary/30 p-6 lg:col-span-3">
              <div className="flex items-center gap-2">
                <SparkleIcon className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Tutor Mode
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                An AI agent runs the session. It reads your mastery and history,
                decides which card to show next, explains why, and writes a
                personalized study plan at the end.
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">
                Good for &ldquo;I don&rsquo;t know where to start. Just teach
                me.&rdquo;
              </p>

              {/* Mockup: the plan the agent writes you (decorative) */}
              <div
                aria-hidden="true"
                className="mt-5 rounded-lg border border-border bg-background p-4"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your study plan
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>Drill Gibbs free energy: you missed it twice.</li>
                  <li>Revisit entropy vs. enthalpy to keep them apart.</li>
                  <li>You&rsquo;ve got activation energy down. Move on.</li>
                </ul>
              </div>
            </Card>

            {/* Study Mode — secondary */}
            <Card className="flex flex-col p-6 lg:col-span-2">
              <div className="flex items-center gap-2">
                <CardsIcon className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Study Mode
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Go through your flashcards in a fixed order, weakest first. For
                each card, self-rate it or type a short answer and have it graded
                by AI.
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">
                Good for focused review when you know what you want to drill.
              </p>

              {/* Mockup: a flashcard with self-rate controls (decorative) */}
              <div
                aria-hidden="true"
                className="mt-5 rounded-lg border border-border bg-background p-4"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          </div>
        </Container>
      </section>
    </>
  );
}
