import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon, DocumentIcon } from "@/components/ui/icons";
import GenerateButton from "./GenerateButton";
import FlashcardGrid from "./FlashcardGrid";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      flashcards: { orderBy: { createdAt: "asc" } },
      _count: { select: { chunks: true } },
    },
  });

  if (!document) notFound();

  const hasCards = document.flashcards.length > 0;

  return (
    <Container className="max-w-5xl">
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All documents
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        {document.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{document._count.chunks} chunks</Badge>
        <Badge variant={hasCards ? "primary" : "neutral"}>
          {document.flashcards.length} flashcards
        </Badge>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <GenerateButton documentId={document.id} />
        {hasCards && (
          <>
            <Link
              href={`/documents/${document.id}/study`}
              className={buttonClasses({ variant: "secondary" })}
            >
              Study
            </Link>
            <Link
              href={`/documents/${document.id}/tutor`}
              className={buttonClasses()}
            >
              Tutor mode
            </Link>
          </>
        )}
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">
        Flashcards
      </h2>

      <div className="mt-4">
        {!hasCards ? (
          <EmptyState
            icon={<DocumentIcon className="h-6 w-6" />}
            title="No flashcards yet"
            description="Generate flashcards from this document to start studying."
          />
        ) : (
          <FlashcardGrid
            cards={document.flashcards.map((c) => ({
              id: c.id,
              question: c.question,
              answer: c.answer,
              mastery: c.mastery,
              timesSeen: c.timesSeen,
            }))}
          />
        )}
      </div>
    </Container>
  );
}
