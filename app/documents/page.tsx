import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { DocumentIcon, BookOpenIcon, SparkleIcon } from "@/components/ui/icons";
import { DeleteDocumentButton } from "./DeleteDocumentButton";

// A card counts as "mastered" once the tutor would stop drilling it.
const MASTERED_THRESHOLD = 0.9;

function formatLastStudied(date: Date | null): string {
  if (!date) return "Not studied yet";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Studied today";
  if (days === 1) return "Studied yesterday";
  if (days < 7) return `Studied ${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Studied ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  const months = Math.floor(days / 30);
  return `Studied ${months} month${months === 1 ? "" : "s"} ago`;
}

function MasteryMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Mastery
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {pct}%
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Mastery ${pct} percent`}
      >
        <div
          className="mastery-fill h-full rounded-full bg-primary"
          style={{ "--mastery": value } as CSSProperties}
        />
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="mx-1.5 text-muted-foreground/50">
      &middot;
    </span>
  );
}

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      flashcards: {
        select: {
          mastery: true,
          attempts: {
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      sessions: {
        select: { startedAt: true },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  const docs = documents.map((doc) => {
    const cardCount = doc.flashcards.length;
    const masteredCount = doc.flashcards.filter(
      (f) => f.mastery >= MASTERED_THRESHOLD
    ).length;
    const avgMastery =
      cardCount === 0
        ? 0
        : doc.flashcards.reduce((sum, f) => sum + f.mastery, 0) / cardCount;

    const activity: number[] = [];
    for (const f of doc.flashcards) {
      if (f.attempts[0]) activity.push(f.attempts[0].createdAt.getTime());
    }
    if (doc.sessions[0]) activity.push(doc.sessions[0].startedAt.getTime());
    const lastStudied = activity.length
      ? new Date(Math.max(...activity))
      : null;

    return { id: doc.id, title: doc.title, cardCount, masteredCount, avgMastery, lastStudied };
  });

  const totalCards = docs.reduce((sum, d) => sum + d.cardCount, 0);
  const totalMastered = docs.reduce((sum, d) => sum + d.masteredCount, 0);

  return (
    <Container className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your documents
          </h1>
          {docs.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{docs.length}</span>{" "}
              {docs.length === 1 ? "document" : "documents"}
              <Dot />
              <span className="font-medium text-foreground">{totalCards}</span>{" "}
              {totalCards === 1 ? "card" : "cards"}
              <Dot />
              <span className="font-medium text-foreground">
                {totalMastered}
              </span>{" "}
              mastered
            </p>
          )}
        </div>
        <Link href="/upload" className={buttonClasses()}>
          Upload document
        </Link>
      </div>

      <div className="mt-8">
        {docs.length === 0 ? (
          <EmptyState
            icon={<DocumentIcon className="h-6 w-6" />}
            title="No documents yet"
            description="Upload a document to generate flashcards and start studying with your AI tutor."
            action={
              <Link href="/upload" className={buttonClasses()}>
                Upload a document
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <li key={doc.id} className="relative">
                <Card className="flex h-full flex-col p-5">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="line-clamp-2 block rounded-sm pr-8 text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {doc.title}
                  </Link>

                  {doc.cardCount === 0 ? (
                    <>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        No flashcards yet
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Link
                          href={`/documents/${doc.id}`}
                          className={buttonClasses({
                            variant: "secondary",
                            size: "sm",
                          })}
                        >
                          <SparkleIcon className="h-4 w-4" />
                          Generate flashcards
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {doc.cardCount} {doc.cardCount === 1 ? "card" : "cards"}
                        <Dot />
                        {formatLastStudied(doc.lastStudied)}
                      </p>

                      <div className="mt-4">
                        <MasteryMeter value={doc.avgMastery} />
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Link
                          href={`/documents/${doc.id}/study`}
                          className={buttonClasses({ size: "sm" })}
                        >
                          <BookOpenIcon className="h-4 w-4" />
                          Study
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/tutor`}
                          className={buttonClasses({
                            variant: "secondary",
                            size: "sm",
                          })}
                        >
                          <SparkleIcon className="h-4 w-4" />
                          Tutor
                        </Link>
                      </div>
                    </>
                  )}
                </Card>
                <DeleteDocumentButton id={doc.id} title={doc.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
