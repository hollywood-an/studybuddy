import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowLeftIcon, DocumentIcon } from "@/components/ui/icons";
import TutorSession from "./TutorSession";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // We only need the title + a flashcard count here; the agent endpoint picks
  // which card to show, so we don't load the cards themselves.
  const document = await prisma.document.findUnique({
    where: { id },
    include: { _count: { select: { flashcards: true } } },
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

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        Tutor mode
      </h1>
      <p className="mb-8 mt-1 text-sm text-muted-foreground">
        An AI tutor picks each card based on what you&rsquo;ve mastered.
      </p>

      {document._count.flashcards === 0 ? (
        <EmptyState
          icon={<DocumentIcon className="h-6 w-6" />}
          title="No flashcards to study yet"
          description="Generate flashcards from this document to start a tutor session."
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
        <TutorSession documentId={document.id} backHref={backHref} />
      )}
    </Container>
  );
}
