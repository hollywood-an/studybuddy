import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon, DocumentIcon } from "@/components/ui/icons";
import StudySession from "./StudySession";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      // Weakest cards first, so they come up earliest in the session.
      flashcards: { orderBy: { mastery: "asc" } },
    },
  });

  if (!document) notFound();

  const backHref = `/documents/${document.id}`;

  return (
    <Container>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {document.title}
      </Link>

      <h1 className="mb-8 mt-4 font-display text-3xl font-semibold tracking-tight">
        Study
      </h1>

      {document.flashcards.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon className="h-6 w-6" />}
          title="No flashcards to study yet"
          description="Generate flashcards from this document to start a study session."
          action={
            <Link
              href={backHref}
              className={buttonClasses({ variant: "secondary" })}
            >
              Back to document
            </Link>
          }
        />
      ) : (
        <StudySession
          cards={document.flashcards.map((c) => ({
            id: c.id,
            question: c.question,
            answer: c.answer,
          }))}
          backHref={backHref}
        />
      )}
    </Container>
  );
}
