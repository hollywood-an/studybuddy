"use client";

import { useTransition } from "react";
import { deleteDocument } from "./actions";
import { XIcon, SpinnerIcon } from "@/components/ui/icons";

export function DeleteDocumentButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const ok = window.confirm(
      `Delete “${title}”? This permanently removes its flashcards and study history.`
    );
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteDocument(id);
      } catch {
        window.alert("Couldn't delete the document. Please try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label={`Delete ${title}`}
      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive-subtle hover:text-destructive disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isPending ? (
        <SpinnerIcon className="h-4 w-4 animate-spin" />
      ) : (
        <XIcon className="h-4 w-4" />
      )}
    </button>
  );
}
